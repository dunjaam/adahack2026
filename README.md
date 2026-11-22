# AirShift — Ljubljana PM10 Attribution & Scenario Model

**ADA Hack 2026 — "Zrak, ki ga dihamo"**

An interactive tool that estimates how **PM10 from residential heating** varies
across Ljubljana's 17 city districts (četrtne skupnosti) and lets a user
simulate what happens when heating-mix, building stock or network coverage
changes. The goal is to let citizens and policymakers ask *"what if we
replaced X % of solid-fuel heaters?"* and see an immediate, explainable answer.

## What's in the repo

| Path | Purpose |
|---|---|
| `model_faktorji_onesnazenosti_cs.py` | End-to-end training pipeline — reads the data package, engineers 8 features per district, fits a Random Forest, computes SHAP, and exports the model artifacts. |
| `api.py` | FastAPI service that loads the trained model and exposes per-district baselines, prediction, SHAP attribution, and the district GeoJSON. |
| `backend/` *(on `feature/frontend`)* | Policy-lever simulation layer that wraps the model to answer scenario questions (e.g. "replace 30 % of solid-fuel heaters, reinsulate 20 % of pre-1980 buildings"). |
| `frontend/` *(on `makedonka/frontend`, `feature/frontend`)* | React + Vite dashboard: interactive map of districts shaded by baseline PM10, grouped sliders, live SHAP waterfall, and a scenario optimiser. |
| `data/` | The pre-cleaned ADA Hack 2026 data package. See `data/README.md` for the full index. |
| `output/` | Generated artifacts: model, per-district defaults, feature metadata, GeoJSON, diagnostic charts. |

## Tech stack

**Backend** — Python 3.10+, `scikit-learn` (RandomForestRegressor), `shap`
(TreeExplainer), `pandas`, `geopandas`, `numpy`, `joblib`, `FastAPI`,
`uvicorn`.

**Frontend** — React 18, TypeScript, Vite, Tailwind CSS, Leaflet /
react-leaflet (district map), Recharts (SHAP chart), Zustand (state),
React Router, Lucide icons, react-grid-layout (dashboard panels).

**Charts** — `matplotlib` + `seaborn` for the training-time diagnostic PNGs
in `output/charts/`.

## How the model is built

1. **Target** — `gral_pm10_kurilna`: the ground-level PM10 contribution from
   small residential furnaces, taken from the **ARSO GRAL** 15 m dispersion
   model and averaged over the heating season (Nov–Mar).
2. **Training sample** — 17 rows, one per *četrtna skupnost*. Districts with
   partial GRAL coverage (e.g. Sostro, 23 %) are held out from training but
   still get predictions at inference time with median-imputed features.
3. **8 engineered features**, joined on `cs_ime`:
   - `pct_district`, `pct_solid` — heating-fuel mix shares (row-normalised
     together with `pct_gas` and `pct_other` to sum to 1), built from
     utility-network proximity + EViDim furnace registry. `pct_gas` and
     `pct_other` are computed and exported but are not model inputs.
   - `delez_pred_1980` — share of buildings built before 1980 (insulation proxy).
   - `kurisca_na_km2` — small-furnace density.
   - `delez_pod_30m` — fraction of district surface in the basin floor
     (cold-air trap).
   - `delez_ob_plinovodu` — share of buildings near the gas network.
   - `inv_exposure` — winter inversion frequency × basin-floor fraction.
   - `stavbe_brez_omrezij_km2` — buildings with no gas *and* no district
     heating, per km² (isolated-heating proxy).
4. **Algorithm** — `RandomForestRegressor(n_estimators=300, max_depth=3,
   min_samples_leaf=2, random_state=42)`. Trees are deliberately shallow —
   with only 17 rows, overfitting is the real risk.
5. **Evaluation** — 5-fold CV RMSE (currently ~1.75 µg/m³), plus a linear
   sanity check on the 3 ARSO-measured districts with real PM2.5 to confirm
   coefficient signs.
6. **Explainability** — `shap.TreeExplainer` is fit once and reused at
   runtime, so every `/api/predict` response decomposes the prediction into
   per-feature SHAP contributions.

Retrain with:

```bash
python model_faktorji_onesnazenosti_cs.py
```

That regenerates `output/model/{model.joblib, cs_defaults.json,
feature_metadata.json, cs_geojson.json}` plus the diagnostic PNGs in
`output/charts/`.

## Data sources

Everything comes from the ADA Hack 2026 data package in `data/` (see
`data/README.md` for the full index). Primary sources used by this project:

| Source | What we use it for |
|---|---|
| **ARSO** — hourly meteorology from 6 basin + ridge stations, hourly PM10/PM2.5 from Bežigrad / Vič / Celovška, GRAL 15 m dispersion model for heating + traffic PM10, CAMx 4.4 km regional forecasts | target variable, inversion feature, measurement validation |
| **EEA** — validated PM10/PM2.5/NO2/O3 (2013–2025) for 13 Slovenian stations | long-term validation |
| **SURS** — dwellings by heating type per municipality (2011–2021) | city-level heating-mix prior |
| **EViDim** (2026) — small furnace registry by fuel type | per-district solid-fuel share normalisation |
| **GURS / MOL** — cadastral buildings with year of construction + networks, utility network traces (district heating & gas), četrtna skupnost boundaries | 6 of the 8 input features |
| **Copernicus DEM 30 m** — basin elevation + height-above-basin-floor raster | `delez_pod_30m` (cold-air trap) |
| **OpenStreetMap** (ODbL) — sensitive-location POIs (schools, kindergartens, hospitals, care homes) | optimiser weighting |
| **IGRA2** — Ljubljana radiosondes | inversion diagnostics |

**Important nuance:** The model's target is only the **heating-sector**
contribution to PM10, from a dispersion model — not total measured PM10.
It is a sector attribution tool, not a replacement for ARSO's monitoring
network.

## How to run

### Backend

```bash
# Python 3.10+
pip install fastapi uvicorn scikit-learn shap pandas geopandas joblib numpy
uvicorn api:app --reload --port 8000
# Swagger UI at http://localhost:8000/docs
```

### Frontend (on `makedonka/frontend` or `feature/frontend`)

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

Vite proxies `/api` to `http://localhost:8000`, so run both in parallel
during development.

## Project status by branch

- **`main`** — trained model + REST API.
- **`makedonka/frontend`** — first React UI (map + sliders + SHAP chart).
- **`makedonka/charts`** — human-readable Slovenian axis labels on the
  diagnostic PNGs.
- **`feature/frontend`** — AirShift dashboard with the policy-lever
  simulator, scenario optimiser, and in-app docs page.

## License & attribution

Data retains the licences of the original providers (ARSO, EEA, SURS, GURS,
MOL, Copernicus, OSM / ODbL, NOAA IGRA2). Source attribution is required on
any publication. See `data/LICENCE.md` for details.
