import { create } from "zustand";
import { api } from "./api";
import type {
  HistoryResult,
  Municipality,
  SimParams,
  SimResult,
  Scenario,
} from "./types";

export type LayerKey = "pollution" | "heating" | "traffic" | "sensitive";
export type PollutantKey = "pm25" | "pm10";

const DEFAULT_PARAMS: SimParams = {
  electric_bus_pct: 0,
  wood_systems_replaced: 0,
  traffic_reduction_pct: 0,
  pre1980_retrofit_pct: 0,
  budget_eur: 1_000_000,
};

interface AppState {
  municipality: Municipality | null;
  geojson: any | null;
  sensitive: { name: string; type: string; lat: number; lon: number }[];
  selectedDistrict: string | null;
  params: SimParams;
  result: SimResult | null;
  history: HistoryResult | null;
  loading: boolean;
  simulating: boolean;

  // map controls
  layer: LayerKey;
  pollutant: PollutantKey;
  compareMode: boolean; // before/after split

  scenarios: Scenario[];

  init: () => Promise<void>;
  setParam: <K extends keyof SimParams>(k: K, v: number) => void;
  resetParams: () => void;
  applyParams: (p: Partial<SimParams>) => void;
  selectDistrict: (cs: string | null) => void;
  setLayer: (l: LayerKey) => void;
  setPollutant: (p: PollutantKey) => void;
  setCompareMode: (b: boolean) => void;
  runSim: () => Promise<void>;
  saveScenario: (name: string) => void;
  deleteScenario: (id: string) => void;
}

let simTimer: ReturnType<typeof setTimeout> | null = null;

export const useStore = create<AppState>((set, get) => ({
  municipality: null,
  geojson: null,
  sensitive: [],
  selectedDistrict: null,
  params: { ...DEFAULT_PARAMS },
  result: null,
  history: null,
  loading: true,
  simulating: false,
  layer: "pollution",
  pollutant: "pm25",
  compareMode: false,
  scenarios: loadScenarios(),

  init: async () => {
    set({ loading: true });
    const [{ municipalities }, geojson, sens] = await Promise.all([
      api.municipalities(),
      api.geojson(),
      api.sensitive().catch(() => ({ locations: [] })),
    ]);
    set({
      municipality: municipalities[0],
      geojson,
      sensitive: sens.locations ?? [],
      loading: false,
    });
    await get().runSim();
    const h = await api.history(null);
    set({ history: h });
  },

  setParam: (k, v) => {
    set((s) => ({ params: { ...s.params, [k]: v } }));
    scheduleSim(get);
  },

  resetParams: () => {
    set({ params: { ...DEFAULT_PARAMS } });
    get().runSim();
  },

  applyParams: (p) => {
    set((s) => ({ params: { ...s.params, ...p } }));
    get().runSim();
  },

  selectDistrict: (cs) => {
    set({ selectedDistrict: cs });
    get().runSim();
    api.history(cs).then((h) => set({ history: h }));
  },

  setLayer: (l) => set({ layer: l }),
  setPollutant: (p) => set({ pollutant: p }),
  setCompareMode: (b) => set({ compareMode: b }),

  runSim: async () => {
    const { params, selectedDistrict } = get();
    set({ simulating: true });
    try {
      const result = await api.simulate(params, selectedDistrict);
      set({ result });
    } finally {
      set({ simulating: false });
    }
  },

  saveScenario: (name) => {
    const { params, result, selectedDistrict, scenarios } = get();
    if (!result) return;
    const sc: Scenario = {
      id: Math.random().toString(36).slice(2, 9),
      name: name || `Scenarij ${scenarios.length + 1}`,
      district: selectedDistrict,
      params: { ...params },
      result,
      createdAt: Date.now(),
    };
    const next = [...scenarios, sc];
    set({ scenarios: next });
    persistScenarios(next);
  },

  deleteScenario: (id) => {
    const next = get().scenarios.filter((s) => s.id !== id);
    set({ scenarios: next });
    persistScenarios(next);
  },
}));

function scheduleSim(get: () => AppState) {
  if (simTimer) clearTimeout(simTimer);
  simTimer = setTimeout(() => get().runSim(), 130);
}

function loadScenarios(): Scenario[] {
  try {
    return JSON.parse(localStorage.getItem("airshift_scenarios") || "[]");
  } catch {
    return [];
  }
}
function persistScenarios(s: Scenario[]) {
  localStorage.setItem("airshift_scenarios", JSON.stringify(s));
}
