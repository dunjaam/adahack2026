"""
AirShift simulation model.

Two connected models:
  1. Prediction model  — the pre-trained RandomForest (output/model/model.joblib)
     estimates the heating-driven PM10 increment per district from building /
     heating / weather features. Loaded lazily; if unavailable we fall back to a
     transparent analytic heating response.
  2. Simulation model  — translates municipality-level POLICY levers
     (electric buses, wood-heating swaps, traffic-emission cuts) into per-district
     before/after PM2.5 / PM10, investment cost and affected population.

All numbers that are not directly measured are clearly flagged as model
estimates in the API payloads. No real measurement values are invented: the
baseline PM2.5 anchor is the winter 2025/26 value shipped in the dataset
(measured at ARSO stations, calibrated-sensor estimate elsewhere).
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

BASE = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE / "output" / "model"

# --------------------------------------------------------------------------- #
# Cost model (demo values, clearly documented, in EUR)                        #
# --------------------------------------------------------------------------- #
WOOD_SWAP_COST = 8_000          # replace one solid-fuel system with a heat pump (net)
EBUS_COST = 450_000             # one electric bus incl. charging infrastructure
TRAFFIC_COST_PER_PCT = 60_000   # LEZ / park&ride / cycling per 1% traffic-PM cut
N_CITY_BUSES = 220              # LPP diesel city fleet (demo)
BUS_TRAFFIC_FRACTION = 0.08     # share of traffic PM attributable to city buses
SOLID_EFFECTIVENESS = 0.9       # share of heating PM driven by solid fuel

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
TOTAL_WOOD = sum(d["wood_systems"] for d in DISTRICTS.values())
TOTAL_DWELLINGS = sum(d["dwellings"] for d in DISTRICTS.values())

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
                       ebus_pct: float, traffic_pct: float) -> Dict[str, Any]:
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
    heating_new = heating * heat_ratio

    # Traffic levers ----------------------------------------------------------
    traffic_new = (traffic
                   * (1 - traffic_pct / 100.0)
                   * (1 - BUS_TRAFFIC_FRACTION * ebus_pct / 100.0))

    new_pm25 = heating_new + traffic_new + background
    return {
        "cs_ime": d["cs_ime"],
        "pm25_before": round(base_pm25, 2),
        "pm25_after": round(new_pm25, 2),
        "pm10_before": round(base_pm25 / RATIO, 2),
        "pm10_after": round(new_pm25 / RATIO, 2),
        "delta_pm25": round(new_pm25 - base_pm25, 2),
        "delta_pct": round((new_pm25 - base_pm25) / base_pm25 * 100, 1) if base_pm25 else 0,
        "heating_before": round(heating, 2),
        "heating_after": round(heating_new, 2),
        "traffic_before": round(traffic, 2),
        "traffic_after": round(traffic_new, 2),
        "background": round(background, 2),
        "wood_replaced": round(wood_replaced),
        "used_ml": ml_ratio is not None,
        "measured": d["measured"],
    }


def scenario_cost(params: Dict[str, float]) -> Dict[str, Any]:
    wood = params.get("wood_systems_replaced", 0)
    ebus = params.get("electric_bus_pct", 0)
    traffic = params.get("traffic_reduction_pct", 0)
    wood_cost = wood * WOOD_SWAP_COST
    n_buses = round(N_CITY_BUSES * ebus / 100.0)
    bus_cost = n_buses * EBUS_COST
    traffic_cost = TRAFFIC_COST_PER_PCT * traffic * (1 + 0.01 * traffic)
    total = wood_cost + bus_cost + traffic_cost
    return {
        "wood_cost": round(wood_cost),
        "bus_cost": round(bus_cost),
        "n_buses": n_buses,
        "traffic_cost": round(traffic_cost),
        "total_cost": round(total),
    }


def simulate(params: Dict[str, float], focus: Optional[str] = None) -> Dict[str, Any]:
    """Run the full municipality simulation for a set of policy levers."""
    wood = max(0.0, float(params.get("wood_systems_replaced", 0)))
    ebus = max(0.0, min(100.0, float(params.get("electric_bus_pct", 0))))
    traffic = max(0.0, min(100.0, float(params.get("traffic_reduction_pct", 0))))

    # Distribute wood swaps proportionally to where solid-fuel systems are.
    wood = min(wood, TOTAL_WOOD)
    per_district = []
    for cs, d in DISTRICTS.items():
        share = d["wood_systems"] / TOTAL_WOOD if TOTAL_WOOD else 0
        per_district.append(_simulate_district(d, wood * share, ebus, traffic))

    # Population-weighted municipality aggregate.
    wsum = sum(DISTRICTS[r["cs_ime"]]["dwellings"] for r in per_district) or 1
    def wavg(key_before, key_after):
        b = sum(r[key_before] * DISTRICTS[r["cs_ime"]]["dwellings"] for r in per_district) / wsum
        a = sum(r[key_after] * DISTRICTS[r["cs_ime"]]["dwellings"] for r in per_district) / wsum
        return round(b, 2), round(a, 2)

    pm25_b, pm25_a = wavg("pm25_before", "pm25_after")
    pm10_b, pm10_a = wavg("pm10_before", "pm10_after")

    cost = scenario_cost(params)
    delta = pm25_a - pm25_b
    affected = sum(DISTRICTS[r["cs_ime"]]["dwellings"] for r in per_district if r["delta_pm25"] < -0.01)
    area = sum(DISTRICTS[r["cs_ime"]]["area_km2"] for r in per_district if r["delta_pm25"] < -0.01)
    eur_per_ug = round(cost["total_cost"] / abs(delta)) if abs(delta) > 1e-6 else None

    result = {
        "municipality": MUNICIPALITY,
        "params": {"electric_bus_pct": ebus, "wood_systems_replaced": round(wood),
                   "traffic_reduction_pct": traffic,
                   "budget_eur": params.get("budget_eur", 0)},
        "municipality_pm25_before": pm25_b,
        "municipality_pm25_after": pm25_a,
        "municipality_pm10_before": pm10_b,
        "municipality_pm10_after": pm10_a,
        "delta_pm25": round(delta, 2),
        "delta_pm25_pct": round(delta / pm25_b * 100, 1) if pm25_b else 0,
        "cost": cost,
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
# Investment optimisation                                                     #
# --------------------------------------------------------------------------- #
def optimize(budget_eur: float) -> Dict[str, Any]:
    """Grid-search the lever space for the biggest PM2.5 cut within budget."""
    best = None
    candidates: List[Dict[str, Any]] = []
    ebus_opts = [0, 20, 40, 60, 80, 100]
    traffic_opts = [0, 10, 20, 30, 40, 50]
    wood_opts = [0, 0.1, 0.25, 0.5, 0.75, 1.0]  # fraction of all wood systems

    for e in ebus_opts:
        for t in traffic_opts:
            for wf in wood_opts:
                wood = round(TOTAL_WOOD * wf)
                params = {"electric_bus_pct": e, "traffic_reduction_pct": t,
                          "wood_systems_replaced": wood}
                cost = scenario_cost(params)["total_cost"]
                if cost > budget_eur:
                    continue
                sim = simulate(params)
                cand = {
                    "params": {"electric_bus_pct": e, "traffic_reduction_pct": t,
                               "wood_systems_replaced": wood},
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
        ("−30% promet", {"traffic_reduction_pct": 30}),
    ]:
        s = simulate(p)
        single.append({"label": label, "cost": s["cost"]["total_cost"],
                       "delta_pm25": s["delta_pm25"],
                       "eur_per_ug_m3": s["eur_per_ug_m3"]})

    return {
        "budget_eur": budget_eur,
        "best": best,
        "alternatives": candidates[:8],
        "single_levers": single,
        "total_wood_systems": TOTAL_WOOD,
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
