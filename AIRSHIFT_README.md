# AirShift — Simulate Change. See the Impact.

Interaktivni **okoljski digitalni dvojček** za slovenske občine in odločevalce.
Simulirajte okoljske ukrepe in v živo opazujte vpliv na onesnaženost zraka (PM2.5 /
PM10) in investicijske stroške. Pokrita občina z vsemi podatki: **Mestna občina
Ljubljana** (17 četrtnih skupnosti iz podatkovnega paketa ADA Hack 2026).

## Arhitektura

```
backend/simulation.py   # simulacijski model (ukrepi -> prej/potem PM, strošek, optimizacija)
api.py                  # FastAPI: municipalities, districts, geojson, simulate, optimize, history
output/model/           # prednaučen RandomForest (prediction model) + izpeljani podatki
frontend/               # React + TypeScript + Tailwind + Leaflet + Recharts + react-grid-layout
```

**Dva povezana modela**
1. *Prediction model* — prednaučen RandomForest oceni ogrevalni prispevek k PM10 iz
   značilk stavb/ogrevanja/vremena (SHAP atribucija). Izhodišče PM2.5 je izmerjeno
   zimsko sidro 2025/26 iz paketa.
2. *Simulation model* — politike (e-busi, zamenjava kurišč, obnova stavb)
   pretvori v prej/potem PM2.5/PM10 po območjih, strošek in vpliv. Fizikalno
   utemeljen odziv; prediction model lahko odziv le izostri.

Vse neizmerjene vrednosti so jasno označene kot **modelska ocena**; nobena realna
meritev ni izmišljena. Regionalno ozadje (`BACKGROUND_FRAC`) je dokumentirana
predpostavka, ki je lokalni ukrepi ne morejo spremeniti.

## Zagon

### 1. Backend (Python 3.12, venv je že nameščen)
```bash
cd /Users/anastasija/Documents/adahack2026
.venv/bin/uvicorn api:app --reload --port 8000
# Docs: http://localhost:8000/docs
```

### 2. Frontend
```bash
cd frontend
npm install     # že narejeno
npm run dev     # http://localhost:5173  (proxy /api -> :8000)
```

Ali na hitro oba hkrati:
```bash
./start.sh
```

## Uporabniška pot
Izberi občino → poglej zemljevid onesnaženosti → premakni drsnike →
opazuj spremembe v živo → primerjaj stroške in učinek → shrani najboljši scenarij →
izvozi povzetek (HTML).

## Ključne funkcije
- **Prilagodljivi gradniki** — dodaj / odstrani / povleci / spremeni velikost.
- **Interaktivni zemljevid** — sloji (onesnaženost, ogrevanje, promet, občutljive
  lokacije), meje ČS, toplotno obarvanje, način **Prej / Potem / Δ**.
- **Simulacija v živo** — 4 drsniki + numerični vnosi, skupno stanje (zustand),
  posodobitev brez osveževanja strani.
- **Optimizacija investicije** — proračun → najboljša kombinacija ukrepov +
  stroškovna učinkovitost (€/µg/m³).
- **Scenariji** — shrani, primerjaj, uporabi; **izvoz** povzetka.
- **Meritev vs. ocena** — povsod jasno označeno (📍 meritev / 〜 modelska ocena).
