export interface District {
  cs_ime: string;
  pm25_winter: number;
  pm10_winter: number;
  heating_share: number;
  traffic_share: number;
  pct_solid: number;
  wood_systems: number;
  dwellings: number;
  area_km2: number;
  heating_emis_kg: number;
  traffic_emis_kg: number;
  lat: number;
  lon: number;
  measured: boolean;
  source: string;
  pct_pre_1980?: number;
  pre_1980_buildings?: number;
}

export interface Municipality {
  id: string;
  name: string;
  covered: boolean;
  lat: number;
  lon: number;
  zoom: number;
  pm25_winter: number;
  n_districts: number;
  total_wood_systems: number;
  total_dwellings: number;
  total_pre_1980_buildings?: number;
  districts: District[];
}

export interface SimParams {
  electric_bus_pct: number;
  wood_systems_replaced: number;
  traffic_reduction_pct: number;
  pre1980_retrofit_pct: number;
  budget_eur: number;
}

export interface DistrictResult {
  cs_ime: string;
  pm25_before: number;
  pm25_after: number;
  pm10_before: number;
  pm10_after: number;
  delta_pm25: number;
  delta_pct: number;
  heating_before: number;
  heating_after: number;
  traffic_before: number;
  traffic_after: number;
  background: number;
  wood_replaced: number;
  pct_pre_1980?: number;
  pre_1980_retrofitted?: number;
  used_ml: boolean;
  measured: boolean;
}

export interface Cost {
  wood_cost: number;
  bus_cost: number;
  n_buses: number;
  traffic_cost: number;
  retrofit_cost: number;
  n_retrofits: number;
  total_cost: number;
}

export interface SimResult {
  municipality: string;
  params: SimParams;
  municipality_pm25_before: number;
  municipality_pm25_after: number;
  municipality_pm10_before: number;
  municipality_pm10_after: number;
  delta_pm25: number;
  delta_pm25_pct: number;
  cost: Cost;
  affected_dwellings: number;
  affected_area_km2: number;
  eur_per_ug_m3: number | null;
  within_budget: boolean;
  districts: DistrictResult[];
}

export interface OptimizeResult {
  budget_eur: number;
  best: {
    params: Partial<SimParams>;
    cost: number;
    delta_pm25: number;
    pm25_after: number;
    eur_per_ug_m3: number | null;
  } | null;
  alternatives: OptimizeResult["best"][];
  single_levers: { label: string; cost: number; delta_pm25: number; eur_per_ug_m3: number | null }[];
  total_wood_systems: number;
  total_pre_1980_buildings?: number;
}

export interface HistoryResult {
  label: string;
  winter_anchor_pm25: number;
  anchor_measured: boolean;
  kind: string;
  note: string;
  eu_annual_limit: number;
  series: { month: string; pm25: number; limit: number }[];
}

export interface Scenario {
  id: string;
  name: string;
  district: string | null;
  params: SimParams;
  result: SimResult;
  createdAt: number;
}
