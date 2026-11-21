"""
FastAPI service exposing the per-CS pollution model.

Run:  uvicorn api:app --reload --port 8000
Docs: http://localhost:8000/docs

Endpoints:
  GET  /api/features           — slider metadata (min/max/labels)
  GET  /api/cs                 — list of 17 CS with baseline PM10
  GET  /api/cs/{cs_name}       — one CS: features + baseline + SHAP
  POST /api/predict            — predict with user parameter overrides
  GET  /api/geojson            — CS polygons for map rendering
"""

import json
import unicodedata
from pathlib import Path
from typing import Any, Dict

import joblib
import numpy as np
import shap
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE = Path(__file__).parent
MODEL_DIR = BASE / "output" / "model"

if not (MODEL_DIR / "model.joblib").exists():
    raise RuntimeError(
        f"Model artifacts not found in {MODEL_DIR}. "
        "Run `python model_faktorji_onesnazenosti_cs.py` first."
    )

# ---------------------------------------------------------------------------
# Load artifacts once at startup
# ---------------------------------------------------------------------------
_artifact = joblib.load(MODEL_DIR / "model.joblib")
MODEL = _artifact["model"]
FEATURE_ORDER = _artifact["feature_order"]
CV_RMSE = _artifact.get("cv_rmse")

EXPLAINER = shap.TreeExplainer(MODEL)
EXPECTED_VALUE = float(np.asarray(EXPLAINER.expected_value).item())

CS_DEFAULTS: Dict[str, Dict[str, Any]] = json.loads(
    (MODEL_DIR / "cs_defaults.json").read_text(encoding="utf-8")
)
FEATURE_META = json.loads(
    (MODEL_DIR / "feature_metadata.json").read_text(encoding="utf-8")
)
FEATURE_META_IDX = {f["name"]: f for f in FEATURE_META}

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Ljubljana PM10 Attribution API",
    description=(
        "Interaktivni model za ocenjevanje vpliva dejavnikov onesnaženosti "
        "zraka po četrtnih skupnostih Mestne občine Ljubljana."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class PredictRequest(BaseModel):
    cs_name: str = Field(..., description="Ime četrtne skupnosti (npr. 'Center', 'Sostro').")
    overrides: Dict[str, float] = Field(
        default_factory=dict,
        description="Map feature_name → new_value. Unknown features are ignored.",
    )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _clamp(name: str, val: float) -> float:
    meta = FEATURE_META_IDX.get(name)
    if meta is None:
        return float(val)
    return max(meta["min"], min(meta["max"], float(val)))


def _predict_vector(features: Dict[str, float]):
    x = np.array([[features[f] for f in FEATURE_ORDER]], dtype=float)
    pm10 = float(MODEL.predict(x)[0])
    shap_vals = EXPLAINER.shap_values(x)[0]
    return pm10, {f: float(v) for f, v in zip(FEATURE_ORDER, shap_vals)}


def _strip_diacritics(s: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c)
    )


def _resolve_cs(cs_name: str) -> str:
    """Case-insensitive, diacritic-tolerant CS lookup."""
    if cs_name in CS_DEFAULTS:
        return cs_name
    want = cs_name.strip().title()
    if want in CS_DEFAULTS:
        return want
    target = _strip_diacritics(cs_name).lower()
    for key in CS_DEFAULTS:
        if _strip_diacritics(key).lower() == target:
            return key
    raise HTTPException(404, f"CS '{cs_name}' not found.")


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/")
def root():
    return {
        "name": "Ljubljana PM10 Attribution API",
        "version": "1.0.0",
        "endpoints": ["/api/features", "/api/cs", "/api/cs/{cs_name}", "/api/predict", "/api/geojson"],
        "docs": "/docs",
        "n_cs": len(CS_DEFAULTS),
        "n_features": len(FEATURE_ORDER),
        "cv_rmse": CV_RMSE,
    }


@app.get("/api/features")
def features():
    """Return slider metadata (feature name, Slovenian label, min/max/step, unit)."""
    return FEATURE_META


@app.get("/api/cs")
def cs_list():
    """Return list of all CS with their baseline PM10 and summary info."""
    result = []
    for name, d in CS_DEFAULTS.items():
        result.append({
            "cs_ime": name,
            "baseline_pm10": d["baseline_pm10"],
            "heating_share": d["heating_share"],
            "traffic_share": d["traffic_share"],
            "pct_district": d["pct_district"],
            "pct_gas": d["pct_gas"],
            "pct_solid": d["pct_solid"],
            "pct_other": d["pct_other"],
            "lat": d.get("lat"),
            "lon": d.get("lon"),
            "povrsina_km2": d["povrsina_km2"],
            "gral_quality_flag": d["gral_quality_flag"],
        })
    result.sort(key=lambda r: -r["heating_share"])
    return result


@app.get("/api/cs/{cs_name}")
def cs_detail(cs_name: str):
    """Return full details + baseline SHAP breakdown for one CS."""
    key = _resolve_cs(cs_name)
    d = CS_DEFAULTS[key]
    pm10, shap_b = _predict_vector(d["features"])
    return {
        "cs_ime": key,
        "features": d["features"],
        "baseline_pm10": pm10,
        "expected_value": EXPECTED_VALUE,
        "shap_baseline": shap_b,
        "heating_share": d["heating_share"],
        "traffic_share": d["traffic_share"],
        "pct_district": d["pct_district"],
        "pct_gas": d["pct_gas"],
        "pct_solid": d["pct_solid"],
        "pct_other": d["pct_other"],
        "lat": d.get("lat"),
        "lon": d.get("lon"),
        "povrsina_km2": d["povrsina_km2"],
        "gral_quality_flag": d["gral_quality_flag"],
    }


@app.post("/api/predict")
def predict(req: PredictRequest):
    """
    Predict PM10 for a CS with user-supplied parameter overrides.

    Body example:
      {"cs_name": "Sostro", "overrides": {"pct_solid": 0.0, "delez_pred_1980": 0.2}}
    """
    key = _resolve_cs(req.cs_name)
    baseline_features = CS_DEFAULTS[key]["features"]
    overrides = {
        name: _clamp(name, val)
        for name, val in req.overrides.items()
        if name in FEATURE_META_IDX
    }
    new_features = {**baseline_features, **overrides}

    baseline_pm10, shap_b = _predict_vector(baseline_features)
    new_pm10, shap_n = _predict_vector(new_features)

    per_feature_delta = {
        f: shap_n[f] - shap_b[f] for f in FEATURE_ORDER
    }

    return {
        "cs_name": key,
        "baseline_pm10": baseline_pm10,
        "new_pm10": new_pm10,
        "delta_pm10": new_pm10 - baseline_pm10,
        "delta_pct": (new_pm10 - baseline_pm10) / baseline_pm10 if baseline_pm10 else 0.0,
        "features_used": new_features,
        "overrides_applied": overrides,
        "expected_value": EXPECTED_VALUE,
        "shap_baseline": shap_b,
        "shap_new": shap_n,
        "per_feature_delta": per_feature_delta,
    }


@app.get("/api/geojson")
def geojson():
    """CS boundary polygons (simplified) for frontend map."""
    path = MODEL_DIR / "cs_geojson.json"
    if not path.exists():
        raise HTTPException(503, "GeoJSON artifact not available yet.")
    return json.loads(path.read_text(encoding="utf-8"))
