import type {
  HistoryResult,
  Municipality,
  OptimizeResult,
  SimParams,
  SimResult,
} from "./types";

const BASE = ""; // vite proxy forwards /api -> backend

async function getJSON<T>(url: string): Promise<T> {
  const r = await fetch(BASE + url);
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return r.json();
}
async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(BASE + url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return r.json();
}

export const api = {
  municipalities: () =>
    getJSON<{ municipalities: Municipality[] }>("/api/municipalities"),
  geojson: () => getJSON<any>("/api/geojson"),
  sensitive: () =>
    getJSON<{ locations: { name: string; type: string; lat: number; lon: number }[] }>(
      "/api/sensitive-locations"
    ),
  simulate: (params: SimParams, focus: string | null) =>
    postJSON<SimResult>("/api/simulate", { params, focus }),
  optimize: (budget_eur: number) =>
    postJSON<OptimizeResult>("/api/optimize", { budget_eur }),
  history: (cs: string | null) =>
    getJSON<HistoryResult>("/api/history" + (cs ? `?cs=${encodeURIComponent(cs)}` : "")),
};
