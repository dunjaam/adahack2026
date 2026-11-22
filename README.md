# AirShift — Ljubljana PM10 Attribution & Scenario Model

**ADA Hack 2026 - "Zrak, ki ga dihamo"**

An interactive tool that estimates how much of Ljubljana's winter air pollution comes from **home heating** and lets citizens and policymakers ask *"what if we replaced X % of wood stoves?"* and see an immediate, explainable answer, district by district.

---

## The data and the model

### What we're trying to predict

For each of Ljubljana's **17 neighborhoods**, we want one number:

> *"How much of the dirty winter air in this neighborhood comes from people's home heating - specifically from wood stoves, pellet boilers, and old furnaces?"*

Measured in micrograms of PM10 per cubic meter - the same unit you see on air-quality apps. Across the city this number ranges from about **1.5 (clean)** in well-connected central districts up to **7+ (heavy)** in hilly, suburban ones.

We don't measure this directly - Ljubljana only has a handful of measurement stations. Instead, we use **ARSO's physics simulation** (a dispersion model called GRAL) that ran the whole city at 15-meter resolution for the year 2021 and tells us, hour by hour, how smoke from chimneys spreads. We average that down to one "heating pollution" number per neighborhood. **That's our ground truth.**

### What we feed the model (the "features")

Think of it as **9 facts about each neighborhood** - a profile card:

**How people heat their homes** (the fuel mix)
- % of households burning wood / pellets / coal
- % hooked up to district heating (clean)
- % on the gas grid

**The buildings themselves**
- How many chimneys per square kilometer
- How many buildings are from before 1980 (badly insulated → they burn more)
- How many houses are isolated - no gas, no district heating (they're forced to burn wood)
- How close buildings are to the gas pipeline (could they switch?)

**The geography / weather trap**
- How much of the neighborhood sits on the valley floor (below 30 m elevation)
- How often cold air gets trapped there in winter - the **temperature inversion** effect, computed from 10 years of weather balloons and thermometers (2016–2026)

That last one matters because Ljubljana is in a basin: in winter, cold air settles at the bottom and traps smoke like a lid on a pot. Two identical houses - one on a hill, one in the basin - produce very different air quality.

### The data behind those 9 facts

We cross-reference **six public datasets**:

| Dataset | What it tells us |
|---|---|
| **SURS** census | How Slovenian households heat |
| **EViDim** furnace registry | Which furnaces exist and what they burn |
| **Building cadastre** | Age and location of every building |
| **GRAL** physics model | Where the pollution ends up (our target) |
| **ARSO emissions inventory** | How much pollution comes from traffic vs. heating |
| **IGRA2** weather balloons | 10 years of inversion events |

### How the model learns

We use a **Random Forest** - picture **300 decision trees** voting together. Each tree asks questions like:

> *"Is the share of wood heating above 20%? → Yes → Are more than half the buildings old? → Yes → Predict high pollution."*

Each tree asks slightly different questions, and the forest averages their answers. We deliberately keep the trees **shallow** (only 3 questions deep) because we only have 17 neighborhoods to learn from - a deep tree would just memorize them.

### Why not a neural network or something fancier?

Two reasons:

1. **17 data points.** Fancy models need thousands. A random forest is honest with small data.
2. **We need to explain *why*.** For every prediction, we can show which features pushed it up or down — using a technique called **SHAP**. That matters because this is a **policy tool**, not a toy: the city needs to see *"your district's pollution is 60% old buildings, 30% wood stoves, 10% being in the valley"* before they spend money.

### How accurate is it?

We tested by hiding each neighborhood in turn and predicting it from the other 16. Average error: **about 1.75 µg/m³**, against values that range from 1.5 to 7+ - good enough to compare districts and simulate policy, not good enough to replace a real sensor.

### What the model is actually used for

Once trained, it answers **"what if"** questions in real time:

> *"If we replace half of the wood stoves in Sostro with heat pumps, what happens to winter PM10?"*

The front-end slider changes the wood-heating input, the model re-predicts, and the map updates. That's it - a decision-support tool for cleaning Ljubljana's winter air.

### 30-second version for the pitch

> *"We take 9 facts about each of Ljubljana's 17 neighborhoods - how people heat their homes, how old the buildings are, and how often cold air gets trapped in winter - and train 300 small decision trees to predict how much wintertime air pollution comes from home heating in that neighborhood. The ground truth comes from a physics simulation ARSO ran for the whole city. The model isn't just a black box: for every neighborhood we can show exactly which factors are driving its pollution, which lets the city plan subsidies where they'll actually help."*

---

## How to run the app

### Prerequisites

- **Python 3.10+** with `pip` (and ideally a virtualenv)
- **Node.js 18+** with `npm`

### 1. Install backend dependencies

From the repo root:

```bash
python -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn scikit-learn shap pandas geopandas joblib numpy
```

### 2. (Optional) Retrain the model

The repo already ships with a trained model under `output/model/`. To regenerate it from scratch:

```bash
python model_faktorji_onesnazenosti_cs.py
```

This reads the CSVs under `data/`, fits the Random Forest, computes SHAP, and writes:

- `output/model/model.joblib` - the trained model
- `output/model/cs_defaults.json` - per-district baselines
- `output/model/feature_metadata.json` - slider ranges & labels for the UI
- `output/model/cs_geojson.json` - district polygons
- `output/charts/*.png` - diagnostic plots

### 3. Start the API (FastAPI backend)

```bash
uvicorn api:app --reload --port 8000
```

- Base URL: `http://localhost:8000`
- Interactive docs (Swagger UI): `http://localhost:8000/docs`

Key endpoints:

| Endpoint | Purpose |
|---|---|
| `GET /api/municipalities` | 17 districts + baseline PM values |
| `GET /api/districts` | Per-district feature data |
| `GET /api/geojson` | District polygons enriched with model output |
| `GET /api/features` | SHAP feature importance |
| `POST /api/simulate` | Run a policy scenario (wood replaced, buses, retrofit %) |
| `POST /api/optimize` | Budget-constrained optimizer |

### 4. Start the frontend (Vite + React)

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

- App: `http://localhost:5173`
- Vite proxies `/api` → `http://localhost:8000`, so keep both running in parallel.

### 5. One-command start (both together)

A helper script is provided:

```bash
./start.sh
```

It launches the FastAPI backend on port 8000 and the Vite frontend on port 5173, and shuts the backend down when you stop the frontend (Ctrl-C).

---

## What's in the repo

| Path | Purpose                                                                                                                      |
|---|------------------------------------------------------------------------------------------------------------------------------|
| `model_faktorji_onesnazenosti_cs.py` | End-to-end training pipeline - loads data, builds the 9 features, fits the Random Forest, runs SHAP, exports artifacts.      |
| `api.py` | FastAPI service that loads the trained model and exposes baselines, predictions, SHAP attribution, and the district GeoJSON. |
| `backend/` | Policy-lever simulation layer wrapping the model for scenario questions.                                                     |
| `frontend/` | React + Vite dashboard: interactive map, grouped sliders, live SHAP chart, scenario optimizer.                               |
| `data/` | The pre-cleaned ADA Hack 2026 data package. See `data/README.md` for the full index.                                         |
| `output/` | Generated artifacts: trained model, per-district defaults, feature metadata, GeoJSON, charts.                                |
| `start.sh` | Runs backend + frontend together.                                                                                            |

## License & attribution

Data retains the licences of the original providers (ARSO, EEA, SURS, GURS, MOL, Copernicus, OSM / ODbL, NOAA IGRA2). Source attribution is required on any publication. See `data/LICENCE.md` for details.
