import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  api,
  type CsDetail,
  type CsListItem,
  type FeatureMeta,
  type GeoJsonFeatureCollection,
  type PredictResponse,
} from "./api/client";
import { DistrictMap } from "./components/DistrictMap";
import { DistrictDropdown } from "./components/DistrictDropdown";
import { SliderGroup } from "./components/SliderGroup";
import { ResultCard } from "./components/ResultCard";
import { ShapBarChart } from "./components/ShapBarChart";
import { useDebouncedValue } from "./lib/useDebouncedValue";

const GROUP_ORDER = [
  "Stavbe",
  "Mešanica ogrevanja",
  "Kurilne naprave",
  "Vreme",
  "Omrežja",
];

function groupFeatures(features: FeatureMeta[]): Record<string, FeatureMeta[]> {
  const out: Record<string, FeatureMeta[]> = {};
  for (const f of features) {
    (out[f.group] ??= []).push(f);
  }
  return out;
}

export default function App() {
  const [features, setFeatures] = useState<FeatureMeta[] | null>(null);
  const [districts, setDistricts] = useState<CsListItem[] | null>(null);
  const [geojson, setGeojson] = useState<GeoJsonFeatureCollection | null>(null);
  const [selectedCs, setSelectedCs] = useState<string | null>(null);
  const [csDetail, setCsDetail] = useState<CsDetail | null>(null);
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [prediction, setPrediction] = useState<PredictResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // Initial load: features + district list + geojson in parallel.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [f, cs, gj] = await Promise.all([
          api.features(),
          api.cs(),
          api.geojson(),
        ]);
        if (cancelled) return;
        setFeatures(f);
        setDistricts(cs);
        setGeojson(gj);
        // Default to the district with the highest baseline PM10.
        const defaultCs = [...cs].sort(
          (a, b) => b.baseline_pm10 - a.baseline_pm10,
        )[0]?.cs_ime;
        if (defaultCs) setSelectedCs(defaultCs);
      } catch (e) {
        if (!cancelled) setApiError((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // When selected district changes, fetch its detail + seed sliders.
  useEffect(() => {
    if (!selectedCs) return;
    let cancelled = false;
    (async () => {
      try {
        const detail = await api.csDetail(selectedCs);
        if (cancelled) return;
        setCsDetail(detail);
        setOverrides({ ...detail.features });
        setPrediction(null);
      } catch (e) {
        if (!cancelled) setApiError((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedCs]);

  // Debounce slider changes before hitting /api/predict.
  const debouncedOverrides = useDebouncedValue(overrides, 200);
  const predictReqId = useRef(0);

  useEffect(() => {
    if (!selectedCs || !csDetail) return;
    // Only send overrides that differ from baseline.
    const diff: Record<string, number> = {};
    for (const [k, v] of Object.entries(debouncedOverrides)) {
      const base = csDetail.features[k];
      if (base == null || Math.abs(v - base) > 1e-9) diff[k] = v;
    }
    if (Object.keys(diff).length === 0) {
      setPrediction(null);
      setIsPredicting(false);
      return;
    }
    const myId = ++predictReqId.current;
    setIsPredicting(true);
    api
      .predict(selectedCs, diff)
      .then((p) => {
        if (myId !== predictReqId.current) return; // stale response
        setPrediction(p);
        setIsPredicting(false);
      })
      .catch((e) => {
        if (myId !== predictReqId.current) return;
        setApiError((e as Error).message);
        setIsPredicting(false);
      });
  }, [debouncedOverrides, selectedCs, csDetail]);

  const onSliderChange = useCallback((name: string, next: number) => {
    setOverrides((prev) => ({ ...prev, [name]: next }));
  }, []);

  const onReset = useCallback(() => {
    if (csDetail) setOverrides({ ...csDetail.features });
  }, [csDetail]);

  const grouped = useMemo(
    () => (features ? groupFeatures(features) : {}),
    [features],
  );

  const baselinePm10 = csDetail?.baseline_pm10 ?? 0;
  const newPm10 = prediction?.new_pm10 ?? baselinePm10;
  const deltaPct = prediction?.delta_pct ?? 0;
  const perFeatureDelta = prediction?.per_feature_delta ?? {};

  // "pct_other" badge for the heating-mix group
  const pctOther = useMemo(() => {
    const d = overrides["pct_district"] ?? 0;
    const g = overrides["pct_gas"] ?? 0;
    const s = overrides["pct_solid"] ?? 0;
    return Math.max(0, Math.min(1, 1 - d - g - s));
  }, [overrides]);

  if (apiError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-xl rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 shadow-sm">
          <h2 className="text-lg font-semibold">API ni dosegljiv</h2>
          <p className="mt-2 text-sm">
            Zaženi{" "}
            <code className="rounded bg-red-100 px-1">
              uvicorn api:app --reload --port 8000
            </code>{" "}
            v korenski mapi projekta, nato osveži stran.
          </p>
          <p className="mt-2 text-xs text-red-600">{apiError}</p>
        </div>
      </div>
    );
  }

  const isLoading = !features || !districts || !geojson || !csDetail;

  return (
    <div className="mx-auto min-h-screen max-w-7xl p-4 sm:p-6">
      <header className="mb-4 flex flex-col gap-1 sm:mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Onesnaženost zraka v Ljubljani
        </h1>
        <p className="text-sm text-slate-600">
          Interaktivni model: izberi četrtno skupnost, spreminjaj vhodne
          parametre in opazuj, kako se spreminja napoved PM10.
        </p>
      </header>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          Nalaganje modela in podatkov…
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Left column — map + dropdown */}
          <aside className="flex flex-col gap-3 lg:col-span-4">
            <DistrictMap
              geojson={geojson!}
              districts={districts!}
              selected={selectedCs}
              onSelect={setSelectedCs}
            />
            <DistrictDropdown
              districts={districts!}
              selected={selectedCs}
              onSelect={setSelectedCs}
            />
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm">
              <p className="font-semibold text-slate-700">Legenda</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-3 flex-1 rounded-full bg-gradient-to-r from-[#ffffcc] via-[#feb24c] to-[#bd0026]" />
              </div>
              <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wide text-slate-500">
                <span>nižji PM10</span>
                <span>višji PM10</span>
              </div>
            </div>
          </aside>

          {/* Center column — sliders */}
          <main className="flex flex-col gap-4 lg:col-span-5">
            {GROUP_ORDER.filter((g) => grouped[g]?.length).map((group) => (
              <SliderGroup
                key={group}
                title={group}
                features={grouped[group]}
                values={overrides}
                baselines={csDetail!.features}
                onChange={onSliderChange}
                footer={
                  group === "Mešanica ogrevanja" ? (
                    <span className="text-xs text-slate-500">
                      Preostalo (ostalo):{" "}
                      <span className="font-semibold tabular-nums text-slate-700">
                        {(pctOther * 100).toFixed(0)}%
                      </span>
                    </span>
                  ) : undefined
                }
              />
            ))}
            <button
              type="button"
              onClick={onReset}
              className="self-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Ponastavi na izhodišče
            </button>
          </main>

          {/* Right column — results */}
          <aside className="flex flex-col gap-4 lg:col-span-3">
            <ResultCard
              csName={selectedCs!}
              baselinePm10={baselinePm10}
              newPm10={newPm10}
              deltaPct={deltaPct}
              isPending={isPredicting}
            />
            <ShapBarChart
              perFeatureDelta={perFeatureDelta}
              features={features!}
            />
          </aside>
        </div>
      )}
    </div>
  );
}
