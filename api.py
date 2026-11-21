"""
AirShift — FastAPI backend.

Run:  .venv/bin/uvicorn api:app --reload --port 8000
Docs: http://localhost:8000/docs

Connects two models:
  * Prediction model — pre-trained RandomForest for the heating PM10 increment.
  * Simulation model — policy levers -> before/after PM2.5/PM10, cost, impact.

Endpoints:
  GET  /api/municipalities        — covered municipality + its districts (zones)
  GET  /api/districts             — per-district baseline (PM2.5/PM10, shares, flags)
  GET  /api/geojson               — district polygons + baseline props for the map
  POST /api/simulate              — run a scenario (all policy levers)
  POST /api/optimize              — best intervention mix for a budget
  GET  /api/history               — seasonal PM2.5 trend (labelled estimate)
  GET  /api/features, /api/cs, ...— legacy ML-attribution endpoints
"""
from __future__ import annotations

import json
import unicodedata
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend import simulation as sim

BASE = Path(__file__).parent
MODEL_DIR = BASE / "output" / "model"

app = FastAPI(title="AirShift API", version="2.0.0",
              description="Okoljski digitalni dvojček za simulacijo ukrepov "
                          "za kakovost zraka (MO Ljubljana).")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])


# --------------------------------------------------------------------------- #
# Request models                                                              #
# --------------------------------------------------------------------------- #
class SimParams(BaseModel):
    electric_bus_pct: float = Field(0, ge=0, le=100)
    wood_systems_replaced: float = Field(0, ge=0)
    traffic_reduction_pct: float = Field(0, ge=0, le=100)
    pre1980_retrofit_pct: float = Field(0, ge=0, le=100)
    budget_eur: float = Field(0, ge=0)


class SimRequest(BaseModel):
    params: SimParams
    focus: Optional[str] = None


class OptimizeRequest(BaseModel):
    budget_eur: float = Field(1_000_000, ge=0)


# --------------------------------------------------------------------------- #
# Helpers                                                                     #
# --------------------------------------------------------------------------- #
def _strip(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFKD", s)
                   if not unicodedata.combining(c))


def _resolve(name: str) -> Optional[str]:
    if name in sim.DISTRICTS:
        return name
    t = _strip(name).lower()
    for k in sim.DISTRICTS:
        if _strip(k).lower() == t:
            return k
    return None


# --------------------------------------------------------------------------- #
# Core endpoints                                                              #
# --------------------------------------------------------------------------- #
@app.get("/")
def root():
    return {"name": "AirShift API", "version": "2.0.0",
            "municipality": sim.MUNICIPALITY, "n_districts": len(sim.DISTRICTS),
            "docs": "/docs"}


@app.get("/api/municipalities")
def municipalities():
    """Covered municipalities. Full data exists for MO Ljubljana (17 districts)."""
    districts = [{
        "cs_ime": d["cs_ime"], "lat": d["lat"], "lon": d["lon"],
        "pm25_winter": d["pm25_winter"], "pm10_winter": d["pm10_winter"],
        "measured": d["measured"], "dwellings": d["dwellings"],
        "area_km2": d["area_km2"], "wood_systems": d["wood_systems"],
        "heating_share": d["heating_share"], "traffic_share": d["traffic_share"],
        "pct_pre_1980": d.get("pct_pre_1980", 0.0),
        "pre_1980_buildings": d.get("pre_1980_buildings", 0),
    } for d in sim.DISTRICTS.values()]
    pm25 = round(sum(d["pm25_winter"] * d["dwellings"] for d in sim.DISTRICTS.values())
                 / (sim.TOTAL_DWELLINGS or 1), 2)
    return {"municipalities": [{
        "id": "mol", "name": sim.MUNICIPALITY, "covered": True,
        "lat": 46.0569, "lon": 14.5058, "zoom": 12,
        "pm25_winter": pm25, "n_districts": len(districts),
        "total_wood_systems": sim.TOTAL_WOOD, "total_dwellings": sim.TOTAL_DWELLINGS,
        "total_pre_1980_buildings": sim.TOTAL_PRE_1980,
        "districts": districts,
    }]}


@app.get("/api/districts")
def districts():
    return {"municipality": sim.MUNICIPALITY, "ratio_pm25_pm10": sim.RATIO,
            "districts": list(sim.DISTRICTS.values())}


@app.get("/api/geojson")
def geojson():
    """District polygons enriched with baseline PM + source flags for the map."""
    path = MODEL_DIR / "cs_geojson.json"
    if not path.exists():
        raise HTTPException(503, "GeoJSON artifact not available.")
    gj = json.loads(path.read_text("utf-8"))
    for f in gj.get("features", []):
        name = _resolve(f["properties"].get("cs_ime", ""))
        if name:
            d = sim.DISTRICTS[name]
            f["properties"].update({
                "cs_ime": name,
                "pm25_winter": d["pm25_winter"], "pm10_winter": d["pm10_winter"],
                "heating_share": d["heating_share"], "traffic_share": d["traffic_share"],
                "measured": d["measured"], "wood_systems": d["wood_systems"],
                "dwellings": d["dwellings"], "source": d["source"],
                "heating_emis_kg": d["heating_emis_kg"],
                "traffic_emis_kg": d["traffic_emis_kg"],
                "pct_pre_1980": d.get("pct_pre_1980", 0.0),
                "pre_1980_buildings": d.get("pre_1980_buildings", 0),
            })
    return gj


@app.post("/api/simulate")
def simulate(req: SimRequest):
    return sim.simulate(req.params.model_dump(), focus=req.focus)


@app.post("/api/optimize")
def optimize(req: OptimizeRequest):
    return sim.optimize(req.budget_eur)


@app.get("/api/sensitivity")
def sensitivity():
    """Per-lever Δ PM2.5 from the simulator — the policy-oriented counterpart
    to the SHAP feature importance (which ranks drivers of the heating-only
    PM10 increment, not total PM)."""
    return sim.sensitivity()


@app.get("/api/history")
def history(cs: Optional[str] = None):
    return sim.history(_resolve(cs) if cs else None)


@app.get("/api/sensitive-locations")
def sensitive_locations():
    """Schools / kindergartens / hospitals near heating hotspots (if present)."""
    path = BASE / "data" / "02_modeli" / "gral" / "gral_kurisca_obcutljive_lokacije.csv"
    out = []
    if path.exists():
        import csv
        with path.open(encoding="utf-8") as fh:
            for row in csv.DictReader(fh):
                lat = row.get("lat") or row.get("y") or row.get("latitude")
                lon = row.get("lon") or row.get("x") or row.get("longitude")
                try:
                    out.append({"name": row.get("ime") or row.get("name") or "Lokacija",
                                "type": row.get("tip") or row.get("type") or "",
                                "lat": float(lat), "lon": float(lon)})
                except (TypeError, ValueError):
                    continue
    return {"locations": out[:400], "source": "GRAL občutljive lokacije"}


# --------------------------------------------------------------------------- #
# Legacy ML-attribution endpoints (kept for transparency / SHAP)              #
# --------------------------------------------------------------------------- #
@app.get("/api/features")
def features():
    p = MODEL_DIR / "feature_metadata.json"
    return json.loads(p.read_text("utf-8")) if p.exists() else []


@app.get("/api/cs")
def cs_list():
    return [{"cs_ime": d["cs_ime"], "baseline_pm25": d["pm25_winter"],
             "heating_share": d["heating_share"], "traffic_share": d["traffic_share"],
             "lat": d["lat"], "lon": d["lon"]} for d in sim.DISTRICTS.values()]
