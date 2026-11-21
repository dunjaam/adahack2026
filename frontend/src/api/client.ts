// Typed fetch wrappers for the Ljubljana PM10 Attribution API.
// All requests go through Vite's /api proxy to http://localhost:8000.

export type FeatureDirection = "higher_worse" | "higher_better" | "neutral";

export interface FeatureMeta {
  name: string;
  label_sl: string;
  group: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  direction: FeatureDirection;
  description_sl: string;
}

export interface CsListItem {
  cs_ime: string;
  baseline_pm10: number;
  heating_share: number;
  traffic_share: number;
  pct_district: number;
  pct_gas: number;
  pct_solid: number;
  pct_other: number;
  lat: number | null;
  lon: number | null;
  povrsina_km2: number;
  gral_quality_flag: string;
}

export interface CsDetail {
  cs_ime: string;
  features: Record<string, number>;
  baseline_pm10: number;
  expected_value: number;
  shap_baseline: Record<string, number>;
  heating_share: number;
  traffic_share: number;
  pct_district: number;
  pct_gas: number;
  pct_solid: number;
  pct_other: number;
  lat: number | null;
  lon: number | null;
  povrsina_km2: number;
  gral_quality_flag: string;
}

export interface PredictResponse {
  cs_name: string;
  baseline_pm10: number;
  new_pm10: number;
  delta_pm10: number;
  delta_pct: number;
  features_used: Record<string, number>;
  overrides_applied: Record<string, number>;
  expected_value: number;
  shap_baseline: Record<string, number>;
  shap_new: Record<string, number>;
  per_feature_delta: Record<string, number>;
}

export type GeoJsonFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: Record<string, unknown> & { cs_ime?: string; CS_IME?: string };
    geometry: unknown;
  }>;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${body || path}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  features: () => request<FeatureMeta[]>("/api/features"),
  cs: () => request<CsListItem[]>("/api/cs"),
  csDetail: (csName: string) =>
    request<CsDetail>(`/api/cs/${encodeURIComponent(csName)}`),
  predict: (cs_name: string, overrides: Record<string, number>) =>
    request<PredictResponse>("/api/predict", {
      method: "POST",
      body: JSON.stringify({ cs_name, overrides }),
    }),
  geojson: () => request<GeoJsonFeatureCollection>("/api/geojson"),
};
