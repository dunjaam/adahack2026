"""
AirShift simulation model.

Two connected models:
  1. Prediction model  — the pre-trained RandomForest (output/model/model.joblib)
     estimates the heating-driven PM10 increment per district from building /
     heating / weather features. Loaded lazily; if unavailable we fall back to a
     transparent analytic heating response.
  2. Simulation model  — translates municipality-level POLICY levers
     into before/after district PM2.5 / PM10 and investment cost. Diesel
     replacement uses proportional primary-PM scenarios for local driving.

All numbers that are not directly measured are clearly flagged as model
estimates in the API payloads. No real measurement values are invented: the
baseline PM2.5 anchor is the winter 2025/26 value shipped in the dataset
(measured at ARSO stations, calibrated-sensor estimate elsewhere).
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from backend.vehicle_replacement import (
    DIESEL_FLEET_LIMIT,
    DIESEL_SUBSIDY_EUR,
    MOL_TRANSPORT_PM25_KG,
    MOL_TRANSPORT_PM10_KG,
    annual_avoided_emissions,
)

BASE = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE / "output" / "model"

# --------------------------------------------------------------------------- #
# Cost model (demo values, clearly documented, in EUR)                        #
# --------------------------------------------------------------------------- #
WOOD_SWAP_COST = 8_000          # replace one solid-fuel system with a heat pump (net)
EBUS_COST = 450_000             # one electric bus incl. charging infrastructure
N_CITY_BUSES = 220              # LPP diesel city fleet (demo)
BUS_TRAFFIC_FRACTION = 0.08     # share of traffic PM attributable to city buses
SOLID_EFFECTIVENESS = 0.9       # share of heating PM driven by solid fuel
RETROFIT_COST_PER_BUILDING = 25_000  # deep energy retrofit of one pre-1980 building
RETROFIT_HEATING_SAVING = 0.5   # heating-PM drop per fully retrofitted old building

# Share of winter PM2.5 that is regional / secondary background and CANNOT be
# changed by municipal levers (long-range transport, secondary aerosol). The
# remaining (1 - BACKGROUND_FRAC) is the locally-addressable fraction, split
# into heating vs traffic using the GRAL source attribution. Documented modelling
# assumption aligned with ARSO winter-episode source apportionment for the basin.
BACKGROUND_FRAC = 0.30

# --------------------------------------------------------------------------- #
# Data                                                                        #
# --------------------------------------------------------------------------- #
_ENRICHED = json.loads((MODEL_DIR / "districts_enriched.json").read_text("utf-8"))
RATIO = _ENRICHED["ratio_pm25_pm10"]
DISTRICTS: Dict[str, Dict[str, Any]] = {d["cs_ime"]: d for d in _ENRICHED["districts"]}
MUNICIPALITY = _ENRICHED["municipality"]

# Merge building-age share (pre-1980) per district from the ML defaults so the
# retrofit lever can target the fraction of old, poorly-insulated stock.
try:
    _CS_DEFAULTS = json.loads((MODEL_DIR / "cs_defaults.json").read_text("utf-8"))
except FileNotFoundError:
    _CS_DEFAULTS = {}
for _cs, _d in DISTRICTS.items():
    _share = float(_CS_DEFAULTS.get(_cs, {}).get("features", {}).get("delez_pred_1980", 0.0))
    _d["pct_pre_1980"] = round(max(0.0, min(1.0, _share)), 4)
    _d["pre_1980_buildings"] = int(round(_d.get("buildings", 0) * _d["pct_pre_1980"]))

TOTAL_WOOD = sum(d["wood_systems"] for d in DISTRICTS.values())
TOTAL_DWELLINGS = sum(d["dwellings"] for d in DISTRICTS.values())
TOTAL_PRE_1980 = sum(d["pre_1980_buildings"] for d in DISTRICTS.values())

# Optional ML prediction model ------------------------------------------------
_ML: Dict[str, Any] = {}


def _load_ml() -> Dict[str, Any]:
    if _ML:
        return _ML
    try:
        import warnings
        warnings.filterwarnings("ignore")
        import joblib  # noqa
        art = joblib.load(MODEL_DIR / "model.joblib")
        defaults = json.loads((MODEL_DIR / "cs_defaults.json").read_text("utf-8"))
        _ML.update(model=art["model"], order=art["feature_order"],
                   defaults=defaults, ok=True)
    except Exception:  # pragma: no cover - resilient fallback
        _ML.update(ok=False)
    return _ML


def _heating_ratio_ml(cs: str, frac_replaced: float) -> Optional[float]:
    """Use the prediction model to estimate how the heating increment changes
    when a fraction of solid-fuel systems is replaced. Returns new/base ratio."""
    ml = _load_ml()
    if not ml.get("ok") or cs not in ml["defaults"]:
        return None
    import numpy as np
    model, order = ml["model"], ml["order"]
    base = ml["defaults"][cs]["features"]
    new = dict(base)
    if "pct_solid" in new:
        new["pct_solid"] = base["pct_solid"] * (1 - frac_replaced)
    if "kurisca_na_km2" in new:
        new["kurisca_na_km2"] = base["kurisca_na_km2"] * (1 - frac_replaced)
    try:
        xb = np.array([[base[f] for f in order]], float)
        xn = np.array([[new[f] for f in order]], float)
        pb, pn = float(model.predict(xb)[0]), float(model.predict(xn)[0])
        if pb <= 0:
            return None
        return max(0.0, min(1.0, pn / pb))
    except Exception:
        return None


# --------------------------------------------------------------------------- #
# Core simulation                                                             #
# --------------------------------------------------------------------------- #
def _simulate_district(d: Dict[str, Any], wood_replaced: float,
                       ebus_pct: float,
                       retrofit_pct: float = 0.0, diesel_pm25_fraction: float = 0.0,
                       diesel_pm10_fraction: float = 0.0) -> Dict[str, Any]:
    base_pm25 = d["pm25_winter"]
    local = base_pm25 * (1 - BACKGROUND_FRAC)
    background = base_pm25 * BACKGROUND_FRAC
    heating = local * d["heating_share"]
    traffic = local * d["traffic_share"]

    # Heating lever -----------------------------------------------------------
    frac = 0.0 if d["wood_systems"] <= 0 else min(1.0, wood_replaced / d["wood_systems"])
    # Analytic response is the physically-grounded floor: removing solid-fuel
    # systems removes ~SOLID_EFFECTIVENESS of the heating PM proportionally. The
    # prediction model (RandomForest) can only sharpen the cut, never block it.
    analytic_ratio = 1 - frac * SOLID_EFFECTIVENESS
    ml_ratio = _heating_ratio_ml(d["cs_ime"], frac)
    heat_ratio = analytic_ratio if ml_ratio is None else min(analytic_ratio, ml_ratio)
    heat_ratio = max(0.0, min(1.0, heat_ratio))

    # Pre-1980 retrofit lever: deep insulation on the share of older stock
    # multiplicatively lowers heating demand for that fraction of the district.
    retrofit_frac = max(0.0, min(1.0, retrofit_pct / 100.0))
    pct_old = float(d.get("pct_pre_1980", 0.0))
    retrofit_ratio = 1 - pct_old * retrofit_frac * RETROFIT_HEATING_SAVING
    retrofit_ratio = max(0.0, min(1.0, retrofit_ratio))
    heating_new = heating * heat_ratio * retrofit_ratio

    # Both vehicle classes reduce separate pieces of the original traffic term.
    # Full-local endpoint: displaced trips follow baseline traffic in space/time,
    # with fixed weather and primary PM proportional to source emissions.
    bus_fraction = BUS_TRAFFIC_FRACTION * ebus_pct / 100.0
    pm25_outside = heating_new + traffic * (1 - bus_fraction) + background
    traffic_new = traffic * (1 - bus_fraction - diesel_pm25_fraction)
    new_pm25 = pm25_outside - traffic * diesel_pm25_fraction
    new_pm10 = (pm25_outside - traffic * diesel_pm10_fraction) / RATIO
    return {
        "cs_ime": d["cs_ime"],
        "pm25_before": round(base_pm25, 2),
        "pm25_after": round(new_pm25, 6),
        "pm25_after_outside": round(pm25_outside, 6),
        "pm10_before": round(base_pm25 / RATIO, 6),
        "pm10_after": round(new_pm10, 6),
        "pm10_after_outside": round(pm25_outside / RATIO, 6),
        "delta_pm25": round(new_pm25 - base_pm25, 6),
        "delta_pct": round((new_pm25 - base_pm25) / base_pm25 * 100, 1) if base_pm25 else 0,
        "heating_before": round(heating, 2),
        "heating_after": round(heating_new, 2),
        "traffic_before": round(traffic, 2),
        "traffic_after": round(traffic_new, 2),
        "background": round(background, 2),
        "wood_replaced": round(wood_replaced),
        "pct_pre_1980": pct_old,
        "pre_1980_retrofitted": int(round(d.get("pre_1980_buildings", 0) * retrofit_frac)),
        "used_ml": ml_ratio is not None,
        "measured": d["measured"],
    }


def _diesel_count(params: Dict[str, float]) -> int:
    return max(0, min(DIESEL_FLEET_LIMIT, int(params.get("diesel_cars_replaced", 0))))


def scenario_cost(params: Dict[str, float]) -> Dict[str, Any]:
    wood = params.get("wood_systems_replaced", 0)
    ebus = params.get("electric_bus_pct", 0)
    retrofit = max(0.0, min(100.0, float(params.get("pre1980_retrofit_pct", 0))))
    wood_cost = wood * WOOD_SWAP_COST
    n_buses = round(N_CITY_BUSES * ebus / 100.0)
    bus_cost = n_buses * EBUS_COST
    diesel_cost = _diesel_count(params) * DIESEL_SUBSIDY_EUR
    n_retrofits = round(TOTAL_PRE_1980 * retrofit / 100.0)
    retrofit_cost = n_retrofits * RETROFIT_COST_PER_BUILDING
    total = wood_cost + bus_cost + diesel_cost + retrofit_cost
    return {
        "wood_cost": round(wood_cost),
        "bus_cost": round(bus_cost),
        "n_buses": n_buses,
        "diesel_cost": diesel_cost,
        "retrofit_cost": round(retrofit_cost),
        "n_retrofits": n_retrofits,
        "total_cost": round(total),
    }


def simulate(params: Dict[str, float], focus: Optional[str] = None) -> Dict[str, Any]:
    """Run the full municipality simulation for a set of policy levers."""
    wood = max(0.0, float(params.get("wood_systems_replaced", 0)))
    ebus = max(0.0, min(100.0, float(params.get("electric_bus_pct", 0))))
    diesel = _diesel_count(params)
    avoided = annual_avoided_emissions(diesel)
    diesel_pm25_fraction = avoided["pm25_kg"] / MOL_TRANSPORT_PM25_KG
    diesel_pm10_fraction = avoided["pm10_kg"] / MOL_TRANSPORT_PM10_KG
    retrofit = max(0.0, min(100.0, float(params.get("pre1980_retrofit_pct", 0))))

    # Distribute wood swaps proportionally to where solid-fuel systems are.
    wood = min(wood, TOTAL_WOOD)
    per_district = []
    for cs, d in DISTRICTS.items():
        share = d["wood_systems"] / TOTAL_WOOD if TOTAL_WOOD else 0
        per_district.append(_simulate_district(d, wood * share, ebus, retrofit,
                                               diesel_pm25_fraction, diesel_pm10_fraction))

    # Population-weighted municipality aggregate.
    wsum = sum(DISTRICTS[r["cs_ime"]]["dwellings"] for r in per_district) or 1
    def wavg(key):
        return round(sum(r[key] * DISTRICTS[r["cs_ime"]]["dwellings"]
                         for r in per_district) / wsum, 6)

    pm25_b, pm25_a = wavg("pm25_before"), wavg("pm25_after")
    pm10_b, pm10_a = wavg("pm10_before"), wavg("pm10_after")

    cost = scenario_cost(params)
    delta = pm25_a - pm25_b
    affected = sum(DISTRICTS[r["cs_ime"]]["dwellings"] for r in per_district if r["delta_pm25"] < -0.01)
    area = sum(DISTRICTS[r["cs_ime"]]["area_km2"] for r in per_district if r["delta_pm25"] < -0.01)
    eur_per_ug = round(cost["total_cost"] / abs(delta)) if abs(delta) > 1e-6 else None

    result = {
        "municipality": MUNICIPALITY,
        "params": {"electric_bus_pct": ebus, "wood_systems_replaced": round(wood),
                   "diesel_cars_replaced": diesel,
                   "pre1980_retrofit_pct": retrofit,
                   "budget_eur": params.get("budget_eur", 0)},
        "municipality_pm25_before": pm25_b,
        "municipality_pm25_after": pm25_a,
        "municipality_pm10_before": pm10_b,
        "municipality_pm10_after": pm10_a,
        "municipality_pm25_after_outside": wavg("pm25_after_outside"),
        "municipality_pm10_after_outside": wavg("pm10_after_outside"),
        "delta_pm25": round(delta, 6),
        "delta_pm25_pct": round(delta / pm25_b * 100, 1) if pm25_b else 0,
        "cost": cost,
        "diesel_avoided_kg_per_year": avoided,
        "affected_dwellings": affected,
        "affected_area_km2": round(area, 1),
        "eur_per_ug_m3": eur_per_ug,
        "within_budget": (params.get("budget_eur", 0) == 0
                          or cost["total_cost"] <= params.get("budget_eur", 0)),
        "districts": per_district,
    }
    if focus and focus in DISTRICTS:
        result["focus"] = next(r for r in per_district if r["cs_ime"] == focus)
    return result


# --------------------------------------------------------------------------- #
# Policy-lever sensitivity                                                    #
# --------------------------------------------------------------------------- #
# Why this exists: the SHAP feature importance in output/cs_ml_feature_importance.csv
# ranks drivers of the GRAL *heating-only* PM10 increment (model target
# gral_pm10_kurilna), where pct_solid is #1. Users reading that chart expect the
# wood-swap slider to dominate the simulator — but the simulator reports *total*
# PM2.5 (heating + traffic + background), so in dense districts the top ML
# feature barely moves the needle. This function answers the complementary
# question "which lever cuts total PM2.5 the most" so the two rankings don't
# tell contradictory stories.
def sensitivity() -> Dict[str, Any]:
    """Per-lever Δ municipality PM2.5 when each lever is pushed to its max."""
    baseline = simulate({})["municipality_pm25_after"]
    rows: List[Dict[str, Any]] = []
    for key, step, label in [
        ("electric_bus_pct",      100,        "100% e-busi"),
        ("diesel_cars_replaced", DIESEL_FLEET_LIMIT, "Zamenjava vseh dizlov EURO 4 (vožnja v MOL)"),
        ("wood_systems_replaced", TOTAL_WOOD, "Zamenjava vseh kurišč"),
        ("pre1980_retrofit_pct",  100,        "Obnova vseh stavb pred 1980"),
    ]:
        s = simulate({key: step})
        rows.append({
            "lever": key,
            "label": label,
            "delta_pm25": round(s["delta_pm25"], 3),
            "pm25_after": s["municipality_pm25_after"],
            "cost": s["cost"]["total_cost"],
        })
    rmax = max((abs(r["delta_pm25"]) for r in rows), default=0) or 1.0
    for r in rows:
        r["share_of_max"] = round(abs(r["delta_pm25"]) / rmax, 3)
    rows.sort(key=lambda r: r["delta_pm25"])
    return {
        "baseline_pm25": baseline,
        "note": "Občutljivost simulatorja na posamezne ukrepe (Δ celotnega "
                "PM2.5). Dopolnjuje SHAP razvrstitev, ki rangira dejavnike "
                "ogrevalnega prispevka k PM10, ne skupnega PM.",
        "levers": rows,
    }


# --------------------------------------------------------------------------- #
# Investment optimisation                                                     #
# --------------------------------------------------------------------------- #
def optimize(budget_eur: float, diesel_cars_replaced: int = 0) -> Dict[str, Any]:
    """Grid-search the lever space for the biggest PM2.5 cut within budget."""
    best = None
    candidates: List[Dict[str, Any]] = []
    ebus_opts = [0, 40, 80]
    wood_opts = [0, 0.25, 0.5, 1.0]        # fraction of all wood systems
    retrofit_opts = [0, 25, 50, 100]       # % of pre-1980 buildings retrofitted

    for e in ebus_opts:
        for wf in wood_opts:
            for r in retrofit_opts:
                params = {"electric_bus_pct": e, "diesel_cars_replaced": diesel_cars_replaced,
                          "wood_systems_replaced": round(TOTAL_WOOD * wf),
                          "pre1980_retrofit_pct": r}
                cost = scenario_cost(params)["total_cost"]
                if cost > budget_eur:
                    continue
                sim = simulate(params)
                cand = {
                    "params": params,
                    "cost": cost,
                    "delta_pm25": sim["delta_pm25"],
                    "pm25_after": sim["municipality_pm25_after"],
                    "eur_per_ug_m3": sim["eur_per_ug_m3"],
                }
                candidates.append(cand)
                if best is None or cand["delta_pm25"] < best["delta_pm25"]:
                    best = cand

    candidates.sort(key=lambda c: c["delta_pm25"])
    # Cost-effectiveness of single levers for the explainer panel.
    single = []
    for label, p in [
        ("100% e-busi", {"electric_bus_pct": 100}),
        ("Zamenjava polovice kurišč", {"wood_systems_replaced": round(TOTAL_WOOD * 0.5)}),
        ("Obnova 50% stavb pred 1980", {"pre1980_retrofit_pct": 50}),
    ]:
        s = simulate(p)
        single.append({"label": label, "cost": s["cost"]["total_cost"],
                       "delta_pm25": s["delta_pm25"],
                       "eur_per_ug_m3": s["eur_per_ug_m3"]})

    return {
        "budget_eur": budget_eur,
        "diesel_cars_replaced": diesel_cars_replaced,
        "best": best,
        "alternatives": candidates[:8],
        "single_levers": single,
        "total_wood_systems": TOTAL_WOOD,
        "total_pre_1980_buildings": TOTAL_PRE_1980,
    }


# --------------------------------------------------------------------------- #
# Historical / seasonal trend (clearly labelled estimate)                     #
# --------------------------------------------------------------------------- #
# Monthly PM2.5 multiplier relative to the winter anchor — a seasonal shape
# typical for the Ljubljana basin (inversion-driven winter peaks). This is a
# MODEL ESTIMATE, not a measurement, and is flagged as such in the API.
_SEASONAL = {1: 1.00, 2: 0.88, 3: 0.70, 4: 0.52, 5: 0.42, 6: 0.38,
             7: 0.36, 8: 0.38, 9: 0.48, 10: 0.66, 11: 0.86, 12: 0.98}
_MONTH_SL = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun",
             "Jul", "Avg", "Sep", "Okt", "Nov", "Dec"]


def history(cs: Optional[str]) -> Dict[str, Any]:
    if cs and cs in DISTRICTS:
        anchor = DISTRICTS[cs]["pm25_winter"]
        measured = DISTRICTS[cs]["measured"]
        label = cs
    else:
        anchor = round(sum(d["pm25_winter"] * d["dwellings"] for d in DISTRICTS.values())
                       / (TOTAL_DWELLINGS or 1), 2)
        measured = False
        label = MUNICIPALITY
    series = [{"month": _MONTH_SL[m - 1], "pm25": round(anchor * _SEASONAL[m], 1),
               "limit": 25} for m in range(1, 13)]
    return {
        "label": label,
        "winter_anchor_pm25": anchor,
        "anchor_measured": measured,
        "kind": "model_estimate_seasonal",
        "note": "Mesečni profil je modelska ocena na podlagi zimskega sidra "
                "(sezonski hod kotline), ne meritev.",
        "eu_annual_limit": 25,
        "series": series,
    }
