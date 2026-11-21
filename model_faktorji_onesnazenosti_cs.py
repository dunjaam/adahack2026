"""
Air pollution factor attribution model for Ljubljana's 17 city districts (četrtne skupnosti).

Outputs:
  output/cs_faktorji_atribucija.csv      - per-CS factor shares & heating type mix
  output/cs_ml_feature_importance.csv    - global RF feature importances
  output/cs_ml_shap_per_cs.csv           - SHAP values per CS × feature
  output/charts/01_heating_vs_traffic.png
  output/charts/02_heating_type_breakdown.png
  output/charts/03_ml_feature_importance.png
  output/charts/04_map_heating_share.png
  output/charts/05_shap_per_cs.png
  output/charts/06_seasonal_profile.png
"""

import warnings
warnings.filterwarnings("ignore")

import json
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import geopandas as gpd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import seaborn as sns
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import StandardScaler
import shap

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE = Path(__file__).parent
DATA = BASE / "data"
OUT = BASE / "output"
CHARTS = OUT / "charts"
OUT.mkdir(exist_ok=True)
CHARTS.mkdir(exist_ok=True)

HEATING_SEASON = [11, 12, 1, 2, 3]

# ---------------------------------------------------------------------------
# Step 1 — Load base data
# ---------------------------------------------------------------------------
print("Loading data ...")

cs = pd.read_csv(DATA / "primeri/cs_kazalniki.csv")

emisije = pd.read_csv(DATA / "04_prostor/emisije/emisije_po_cs.csv")
emisije["cs_ime"] = (
    emisije["cs_ime"]
    .str.replace("ČETRTNA SKUPNOST ", "", regex=False)
    .str.strip()
    .str.title()
)
# Normalize cs_ime in base table to Title Case for joining
cs["cs_ime"] = cs["cs_ime"].str.strip().str.title()

cs = cs.merge(
    emisije[["cs_ime", "promet_pm10_kg_leto", "ceste_km"]],
    on="cs_ime",
    how="left",
)

# EViDim — Ljubljana total furnace fuel split (used as prior)
evidim = pd.read_csv(DATA / "04_prostor/evidim_kurilne_naprave_obcine.csv")
lj_ev = evidim[(evidim["obcina_sifra"] == 61) & (evidim["dimenzija"] == "vrsta_goriva")].copy()
lj_ev = lj_ev.set_index("kategorija")["stevilo_naprav"]
lj_total = lj_ev.get("SKUPAJ", lj_ev.sum())
lj_solid_pct = lj_ev.get("TRDNO", 0) / lj_total  # ~0.188

# SURS — Ljubljana heating type (2021)
surs = pd.read_csv(DATA / "04_prostor/surs_ogrevanje_obcine.csv", dtype={"obcina_sifra": str})
lj_surs = surs[
    (surs["obcina_sifra"] == "061")
    & (surs["leto"] == 2021)
    & (surs["naseljenost_koda"] == 1)   # inhabited dwellings
    & (surs["meritev_koda"] == 1)       # count of dwellings
].copy()

# ---------------------------------------------------------------------------
# Step 2 — Heating type profile per CS
# ---------------------------------------------------------------------------
print("Computing heating type profiles ...")

# pct_district: fraction of buildings near district heating network
cs["pct_district"] = cs["delez_ob_vrocevodu"].clip(0, 1)

# pct_gas: near gas network but NOT district heating
cs["pct_gas"] = (cs["delez_ob_plinovodu"] * (1 - cs["pct_district"])).clip(0, 1)

# pct_solid: normalize per-CS solid-fuel furnace density against LJ total prior
# kurisca_trda_ocena / stavbe_stan gives furnaces per building; scale so LJ mean = lj_solid_pct
raw_solid_ratio = cs["kurisca_trda_ocena"] / cs["stavbe_stan"].replace(0, np.nan)
mean_raw = raw_solid_ratio.mean()
if mean_raw > 0:
    cs["pct_solid"] = (raw_solid_ratio / mean_raw * lj_solid_pct).clip(0, 1)
else:
    cs["pct_solid"] = lj_solid_pct

# pct_other (liquid fuel, wood stoves not in solid category, etc.)
cs["pct_other"] = (1 - cs["pct_district"] - cs["pct_gas"] - cs["pct_solid"]).clip(0, 1)

# Re-normalise rows so they sum to 1
heat_cols = ["pct_district", "pct_gas", "pct_solid", "pct_other"]
row_sums = cs[heat_cols].sum(axis=1).replace(0, 1)
for col in heat_cols:
    cs[col] = cs[col] / row_sums

# ---------------------------------------------------------------------------
# Step 3 — Inversion exposure per CS
# ---------------------------------------------------------------------------
print("Computing inversion feature ...")

inv = pd.read_csv(DATA / "03_vreme_inverzija/inverzija_urno_2016_2026.csv")
inv["time_utc"] = pd.to_datetime(inv["time_utc"], utc=True)
inv["month"] = inv["time_utc"].dt.month
inv_winter = inv[inv["month"].isin(HEATING_SEASON)]
inv_freq_winter = inv_winter["inv_pasja_ravan"].mean()
print(f"  Winter inversion frequency (Nov-Mar 2016-2026): {inv_freq_winter:.3f}")

# CS in the basin hollow (delez_pod_30m ≈ 1 → trapped cold air) are most exposed
cs["inv_exposure"] = inv_freq_winter * cs["delez_pod_30m"]

# ---------------------------------------------------------------------------
# Step 4 — Static factor attribution (heating vs traffic)
# ---------------------------------------------------------------------------
print("Computing static factor attribution ...")

heating_em = cs["emisije_kurisca_kg_leto"].fillna(0)
traffic_em = cs["promet_pm10_kg_leto"].fillna(0)
total_em = heating_em + traffic_em

cs["heating_share"] = (heating_em / total_em.replace(0, np.nan)).fillna(0)
cs["traffic_share"] = 1 - cs["heating_share"]

# Data-quality flag for GRAL partial coverage
cs["gral_quality_flag"] = "ok"
cs.loc[cs["gral_pokritost"] < 0.5, "gral_quality_flag"] = "partial_coverage"

# ---------------------------------------------------------------------------
# Step 5 — GRAL seasonal profile (heating + traffic monthly averages)
# ---------------------------------------------------------------------------
print("Loading GRAL hourly data for seasonal profile ...")

def load_gral(path):
    df = pd.read_csv(path, skiprows=2, low_memory=False)
    df["time_utc"] = pd.to_datetime(df["time_utc"], utc=True, errors="coerce")
    df["month"] = df["time_utc"].dt.month
    cs_cols = [c for c in df.columns if c.startswith("ČETRTNA")]
    # Rename to Title Case without prefix to match cs_ime
    rename = {c: c.replace("ČETRTNA SKUPNOST ", "").strip().title() for c in cs_cols}
    df = df.rename(columns=rename)
    return df, list(rename.values())

gral_heat, cs_names_h = load_gral(DATA / "02_modeli/gral/gral_kurisca_cs_urno.csv")
gral_traf, cs_names_t = load_gral(DATA / "02_modeli/gral/gral_promet_cs_urno.csv")

# Monthly mean per CS
heat_monthly = gral_heat.groupby("month")[cs_names_h].mean()
traf_monthly = gral_traf.groupby("month")[cs_names_t].mean()

# ---------------------------------------------------------------------------
# Step 6 — ML Model: Random Forest with SHAP
# ---------------------------------------------------------------------------
print("Training Random Forest model ...")

FEATURES = [
    "delez_pred_1980",
    "pct_solid",
    "pct_district",
    "kurisca_na_km2",
    "delez_pod_30m",
    "delez_ob_plinovodu",
    "inv_exposure",
]
# Add buildings without networks per km² (proxy for isolated heating)
cs["stavbe_brez_omrezij_km2"] = cs["stavbe_brez_omrezij"] / cs["povrsina_km2"].replace(0, np.nan)
FEATURES.append("stavbe_brez_omrezij_km2")

# Human-readable Slovenian labels, used by the matplotlib charts below and
# mirrored in the frontend-facing feature_metadata.json export further down.
FEATURE_LABELS_SL = {
    "pct_solid":               "Delež ogrevanja na trda goriva",
    "pct_gas":                 "Delež ogrevanja na plin",
    "pct_district":            "Delež daljinskega ogrevanja",
    "kurisca_na_km2":          "Gostota kurišč",
    "delez_pred_1980":         "Delež stavb pred 1980",
    "inv_exposure":            "Izpostavljenost inverziji",
    "delez_ob_plinovodu":      "Dostop do plinovoda",
    "delez_pod_30m":           "Delež površine pod 30 m nad dnom",
    "stavbe_brez_omrezij_km2": "Stavbe brez omrežij / km²",
}

TARGET = "gral_pm10_kurilna"

ml_df = cs[FEATURES + [TARGET, "cs_ime", "gral_quality_flag"]].dropna(subset=FEATURES + [TARGET])
X = ml_df[FEATURES].values
y = ml_df[TARGET].values
feature_names = FEATURES

# RandomForest — shallow trees to avoid overfitting at n=17
rf = RandomForestRegressor(n_estimators=300, max_depth=3, min_samples_leaf=2, random_state=42)
rf.fit(X, y)

# 5-fold CV (leave-one-out for small n is more robust, but 5-fold is standard)
cv_scores = cross_val_score(rf, X, y, cv=5, scoring="neg_root_mean_squared_error")
cv_rmse = -cv_scores.mean()
print(f"  5-fold CV RMSE: {cv_rmse:.4f} µg/m³")

# SHAP values
explainer = shap.TreeExplainer(rf)
shap_values = explainer.shap_values(X)

shap_df = pd.DataFrame(shap_values, columns=feature_names, index=ml_df["cs_ime"].values)
shap_df.index.name = "cs_ime"

importance_df = pd.DataFrame({
    "feature": feature_names,
    "mean_abs_shap": np.abs(shap_values).mean(axis=0),
    "rf_importance": rf.feature_importances_,
}).sort_values("mean_abs_shap", ascending=False)

# Validation on 3 ARSO-measured CS using real PM2.5 (linear only, n=3)
measured_cs = cs[cs["vrsta"] == "meritev"][FEATURES + ["pm25_zima_2025_26", "cs_ime"]].dropna()
if len(measured_cs) >= 2:
    lr = LinearRegression()
    lr.fit(measured_cs[FEATURES], measured_cs["pm25_zima_2025_26"])
    lr_coef = pd.Series(lr.coef_, index=FEATURES, name="linear_coef").sort_values(ascending=False)
    print(f"  Linear model (n={len(measured_cs)} measured CS) coefficients:")
    print(lr_coef.to_string())

# ---------------------------------------------------------------------------
# Step 7 — Assemble final attribution CSV
# ---------------------------------------------------------------------------
print("Saving CSVs ...")

out_cols = [
    "cs_ime", "povrsina_km2",
    "heating_share", "traffic_share",
    "pct_district", "pct_gas", "pct_solid", "pct_other",
    "inv_exposure", "gral_pm10_kurilna", "gral_pm10_januar",
    "emisije_kurisca_kg_leto", "promet_pm10_kg_leto",
    "gral_pokritost", "gral_quality_flag",
    "pm25_zima_2025_26", "vir", "vrsta",
]
out_cols = [c for c in out_cols if c in cs.columns]
cs[out_cols].sort_values("heating_share", ascending=False).to_csv(
    OUT / "cs_faktorji_atribucija.csv", index=False, float_format="%.4f"
)

importance_df.to_csv(OUT / "cs_ml_feature_importance.csv", index=False, float_format="%.6f")
shap_df.reset_index().to_csv(OUT / "cs_ml_shap_per_cs.csv", index=False, float_format="%.6f")

# ---------------------------------------------------------------------------
# Step 7b — Export trained model + per-CS defaults for the FastAPI service
# ---------------------------------------------------------------------------
print("Exporting model artifacts for API ...")

MODEL_DIR = OUT / "model"
MODEL_DIR.mkdir(exist_ok=True)

joblib.dump(
    {"model": rf, "feature_order": FEATURES, "cv_rmse": float(cv_rmse)},
    MODEL_DIR / "model.joblib",
)

# Per-CS defaults — features used for prediction + baseline PM10 + display info
# Include ALL 17 CS: for CS that were dropped from training (NaN target, e.g. Sostro
# with gral_pokritost=0.23), we still fill features from cs_kazalniki and predict
# with the trained model.
cs_indexed = cs.set_index("cs_ime")
defaults = {}
cs_predict_df = cs[["cs_ime"] + FEATURES].copy()
# Fill any missing feature with the median (only needed for edge cases)
for f in FEATURES:
    cs_predict_df[f] = cs_predict_df[f].fillna(cs_predict_df[f].median())
for _, row in cs_predict_df.iterrows():
    name = row["cs_ime"]
    feat = {f: float(row[f]) for f in FEATURES}
    x_vec = np.array([[feat[f] for f in FEATURES]])
    baseline_pm10 = float(rf.predict(x_vec)[0])
    meta = cs_indexed.loc[name]
    defaults[name] = {
        "features": feat,
        "baseline_pm10": baseline_pm10,
        "heating_share": float(meta["heating_share"]),
        "traffic_share": float(meta["traffic_share"]),
        "pct_district": float(meta["pct_district"]),
        "pct_gas": float(meta["pct_gas"]),
        "pct_solid": float(meta["pct_solid"]),
        "pct_other": float(meta["pct_other"]),
        "lat": float(meta["lat"]) if pd.notna(meta.get("lat")) else None,
        "lon": float(meta["lon"]) if pd.notna(meta.get("lon")) else None,
        "povrsina_km2": float(meta["povrsina_km2"]),
        "gral_pokritost": float(meta["gral_pokritost"]) if pd.notna(meta.get("gral_pokritost")) else None,
        "gral_quality_flag": str(meta["gral_quality_flag"]),
    }
(MODEL_DIR / "cs_defaults.json").write_text(
    json.dumps(defaults, indent=2, ensure_ascii=False)
)

# Feature metadata — slider ranges + Slovenian labels for the frontend
feature_metadata = [
    {"name": "pct_solid", "label_sl": "Delež ogrevanja na trda goriva",
     "group": "Mešanica ogrevanja", "min": 0.0, "max": 1.0, "step": 0.01, "unit": "delež",
     "direction": "higher_worse",
     "description_sl": "Ocena deleža stanovanj, ki se ogrevajo na trda goriva (drva, premog, peleti)."},
    {"name": "pct_gas", "label_sl": "Delež ogrevanja na plin",
     "group": "Mešanica ogrevanja", "min": 0.0, "max": 1.0, "step": 0.01, "unit": "delež",
     "direction": "neutral",
     "description_sl": "Delež stanovanj z dostopom do plinovoda (lokalno ogrevanje na plin)."},
    {"name": "pct_district", "label_sl": "Delež daljinskega ogrevanja",
     "group": "Mešanica ogrevanja", "min": 0.0, "max": 1.0, "step": 0.01, "unit": "delež",
     "direction": "higher_better",
     "description_sl": "Delež stavb, povezanih na vročevodno omrežje (čistejše)."},
    {"name": "kurisca_na_km2", "label_sl": "Gostota kurišč",
     "group": "Kurilne naprave", "min": 0.0, "max": 200.0, "step": 1.0, "unit": "kurišč/km²",
     "direction": "higher_worse",
     "description_sl": "Število malih kurišč na kvadratni kilometer četrtne skupnosti."},
    {"name": "delez_pred_1980", "label_sl": "Delež stavb pred 1980",
     "group": "Stavbe", "min": 0.0, "max": 1.0, "step": 0.01, "unit": "delež",
     "direction": "higher_worse",
     "description_sl": "Starejše stavbe imajo slabšo izolacijo in porabijo več goriva."},
    {"name": "inv_exposure", "label_sl": "Izpostavljenost inverziji",
     "group": "Vreme", "min": 0.0, "max": 0.3, "step": 0.005, "unit": "indeks",
     "direction": "higher_worse",
     "description_sl": "Pogostost temperaturnih inverzij × delež nižinskega površja."},
    {"name": "delez_ob_plinovodu", "label_sl": "Dostop do plinovoda",
     "group": "Omrežja", "min": 0.0, "max": 1.0, "step": 0.01, "unit": "delež",
     "direction": "higher_better",
     "description_sl": "Delež stavb blizu plinovoda — alternativa trdim gorivom."},
    {"name": "delez_pod_30m", "label_sl": "Delež površine pod 30 m nad dnom",
     "group": "Vreme", "min": 0.0, "max": 1.0, "step": 0.01, "unit": "delež",
     "direction": "higher_worse",
     "description_sl": "Kakšen del CS leži v nižinskem delu kotline (zadrževanje hladnega zraka)."},
    {"name": "stavbe_brez_omrezij_km2", "label_sl": "Stavbe brez omrežij / km²",
     "group": "Omrežja", "min": 0.0, "max": 100.0, "step": 1.0, "unit": "stavb/km²",
     "direction": "higher_worse",
     "description_sl": "Gostota stavb, ki nimajo dostopa niti do plinovoda niti vročevoda."},
]
# Ensure order matches FEATURE_ORDER expected by the model
feature_metadata = sorted(feature_metadata, key=lambda m: FEATURES.index(m["name"]) if m["name"] in FEATURES else 999)
(MODEL_DIR / "feature_metadata.json").write_text(
    json.dumps(feature_metadata, indent=2, ensure_ascii=False)
)

# ---------------------------------------------------------------------------
# Step 8 — Charts
# ---------------------------------------------------------------------------
print("Generating charts ...")

PALETTE = {
    "heating": "#d62728",
    "traffic": "#1f77b4",
    "district": "#2ca02c",
    "gas": "#ff7f0e",
    "solid": "#8c564b",
    "other": "#9467bd",
}

cs_sorted = cs.sort_values("heating_share", ascending=True)
names = cs_sorted["cs_ime"].values

# --- Chart 1: heating vs traffic stacked bar ---
fig, ax = plt.subplots(figsize=(10, 7))
y_pos = np.arange(len(names))
ax.barh(y_pos, cs_sorted["heating_share"], color=PALETTE["heating"], label="Ogrevanje")
ax.barh(y_pos, cs_sorted["traffic_share"], left=cs_sorted["heating_share"],
        color=PALETTE["traffic"], label="Promet")
ax.set_yticks(y_pos)
ax.set_yticklabels(names, fontsize=9)
ax.set_xlabel("Delež letnih emisij PM10")
ax.set_title("Delež emisij PM10: ogrevanje vs promet po četrtnih skupnostih\n(vir: ARSO emisijska inventura)")
ax.xaxis.set_major_formatter(mticker.PercentFormatter(xmax=1))
ax.legend(loc="lower right")
ax.axvline(0.5, color="gray", linewidth=0.8, linestyle="--", alpha=0.6)
fig.tight_layout()
fig.savefig(CHARTS / "01_heating_vs_traffic.png", dpi=150)
plt.close(fig)

# --- Chart 2: heating type breakdown ---
fig, ax = plt.subplots(figsize=(10, 7))
bar_w = 0.65
bottoms = np.zeros(len(names))
for col, label, color in [
    ("pct_district", "Daljinsko ogrevanje", PALETTE["district"]),
    ("pct_gas", "Plin", PALETTE["gas"]),
    ("pct_solid", "Trda goriva", PALETTE["solid"]),
    ("pct_other", "Ostalo/tekoče", PALETTE["other"]),
]:
    vals = cs_sorted[col].values
    ax.barh(y_pos, vals, left=bottoms, height=bar_w, color=color, label=label)
    bottoms += vals
ax.set_yticks(y_pos)
ax.set_yticklabels(names, fontsize=9)
ax.set_xlabel("Ocenjeni delež načina ogrevanja")
ax.set_title("Ocenjena sestava načinov ogrevanja po četrtnih skupnostih\n(vir: cs_kazalniki, EViDim, omrežja)")
ax.xaxis.set_major_formatter(mticker.PercentFormatter(xmax=1))
ax.legend(loc="lower right", fontsize=8)
fig.tight_layout()
fig.savefig(CHARTS / "02_heating_type_breakdown.png", dpi=150)
plt.close(fig)

# --- Chart 3: ML feature importance ---
fig, ax = plt.subplots(figsize=(9, 5))
imp = importance_df.sort_values("mean_abs_shap")
labels = imp["feature"].map(FEATURE_LABELS_SL).fillna(imp["feature"])
ax.barh(labels, imp["mean_abs_shap"], color="#4c72b0")
ax.set_xlabel("Povprečni prispevek k napovedi PM10 (µg/m³, |SHAP|)")
ax.set_title(
    "Kateri dejavniki najbolj vplivajo na napoved PM10 iz ogrevanja\n"
    f"(model: naključni gozd, 5-kratna CV RMSE = {cv_rmse:.3f} µg/m³)"
)
ax.margins(y=0.02)
fig.tight_layout()
fig.savefig(CHARTS / "03_ml_feature_importance.png", dpi=150)
plt.close(fig)

# --- Chart 4: choropleth map — heating share ---
try:
    gdf = gpd.read_file(DATA / "04_prostor/mol_cetrtne_skupnosti.geojson")
    gdf["cs_ime"] = gdf["ime"].str.strip().str.title() if "ime" in gdf.columns else gdf.iloc[:, 1].str.strip().str.title()
    gdf = gdf.merge(cs[["cs_ime", "heating_share", "traffic_share"]], on="cs_ime", how="left")

    fig, ax = plt.subplots(1, 1, figsize=(10, 8))
    gdf.plot(
        column="heating_share",
        ax=ax,
        legend=True,
        cmap="RdYlGn_r",
        vmin=0, vmax=1,
        edgecolor="white",
        linewidth=0.5,
        legend_kwds={"label": "Delež ogrevanja v PM10 emisijah", "shrink": 0.7},
        missing_kwds={"color": "lightgrey", "label": "Ni podatka"},
    )
    for _, row in gdf.iterrows():
        if pd.notna(row.get("heating_share")):
            centroid = row.geometry.centroid
            ax.annotate(
                row["cs_ime"].split()[0],
                xy=(centroid.x, centroid.y),
                fontsize=5.5,
                ha="center",
                color="black",
            )
    ax.set_title("Delež ogrevanja v skupnih emisijah PM10 po četrtnih skupnostih MOL", fontsize=11)
    ax.set_axis_off()
    fig.tight_layout()
    fig.savefig(CHARTS / "04_map_heating_share.png", dpi=150)
    plt.close(fig)

    # Simplified GeoJSON for the frontend map — strip "Četrtna Skupnost " prefix
    gdf_simple = gdf[["cs_ime", "geometry"]].copy()
    gdf_simple["cs_ime"] = (
        gdf_simple["cs_ime"]
        .astype(str)
        .str.replace("Četrtna Skupnost ", "", regex=False)
        .str.replace("ČETRTNA SKUPNOST ", "", regex=False)
        .str.strip()
    )
    if gdf_simple.crs is None or gdf_simple.crs.to_epsg() != 4326:
        try:
            gdf_simple = gdf_simple.to_crs(4326)
        except Exception:
            pass
    gdf_simple["geometry"] = gdf_simple.geometry.simplify(0.0005, preserve_topology=True)
    api_geojson_path = MODEL_DIR / "cs_geojson.json"
    if api_geojson_path.exists():
        api_geojson_path.unlink()
    gdf_simple.to_file(api_geojson_path, driver="GeoJSON")
except Exception as exc:
    print(f"  Map chart skipped: {exc}")

# --- Chart 5: SHAP per CS (dot plot) ---
fig, ax = plt.subplots(figsize=(13, 7))
shap_plot = shap_df.copy()

# Sort features by mean abs SHAP, then relabel with human-readable Slovenian names
feat_order = importance_df.sort_values("mean_abs_shap", ascending=True)["feature"].tolist()
shap_plot = shap_plot[feat_order]
shap_plot = shap_plot.rename(columns=FEATURE_LABELS_SL)

# Heatmap-style: rows = CS, cols = features, values = SHAP
sns.heatmap(
    shap_plot,
    ax=ax,
    cmap="RdBu_r",
    center=0,
    annot=True,
    fmt=".2f",
    linewidths=0.4,
    cbar_kws={"label": "Prispevek (µg/m³, SHAP)"},
    annot_kws={"size": 7},
)
ax.set_title(
    "Prispevek posameznih dejavnikov k napovedi PM10 iz ogrevanja — po četrtnih skupnostih",
    fontsize=10,
)
ax.set_xlabel("Dejavnik")
ax.set_ylabel("Četrtna skupnost")
plt.xticks(rotation=30, ha="right", fontsize=8)
plt.yticks(fontsize=8)
fig.tight_layout()
fig.savefig(CHARTS / "05_shap_per_cs.png", dpi=150)
plt.close(fig)

# --- Chart 6: seasonal profile for 3 representative CS ---
highlight_cs = ["Sostro", "Center", "Polje"]
# Fall back to any available names
available = [n for n in highlight_cs if n in cs_names_h]
if len(available) < 2:
    available = cs_names_h[:3]

fig, axes = plt.subplots(1, len(available), figsize=(5 * len(available), 4), sharey=False)
if len(available) == 1:
    axes = [axes]
months_labels = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Avg", "Sep", "Okt", "Nov", "Dec"]
for ax, cs_name in zip(axes, available):
    if cs_name not in heat_monthly.columns or cs_name not in traf_monthly.columns:
        continue
    hv = heat_monthly[cs_name]
    tv = traf_monthly[cs_name]
    x = hv.index
    ax.plot(x, hv, color=PALETTE["heating"], marker="o", label="Kurišča (PM10)", linewidth=2)
    ax.plot(x, tv, color=PALETTE["traffic"], marker="s", label="Promet (PM10)", linewidth=2, linestyle="--")
    ax.set_title(cs_name, fontsize=10)
    ax.set_xlabel("Mesec")
    ax.set_ylabel("µg/m³ (GRAL model, 2021)")
    ax.set_xticks(range(1, 13))
    ax.set_xticklabels(months_labels, rotation=45, fontsize=7)
    ax.legend(fontsize=7)
    ax.grid(alpha=0.3)
fig.suptitle("Mesečni profil prispevka PM10: kurišča vs promet (GRAL 2021)", fontsize=11)
fig.tight_layout()
fig.savefig(CHARTS / "06_seasonal_profile.png", dpi=150)
plt.close(fig)

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
print("\n=== REZULTATI ===")
top3 = cs.nlargest(3, "heating_share")[["cs_ime", "heating_share", "pct_solid", "emisije_kurisca_kg_leto"]]
print("Top 3 CS po deležu ogrevanja v emisijah:")
print(top3.to_string(index=False))

print(f"\nNajpomembnejša spremenljivka (SHAP): {importance_df.iloc[0]['feature']}")
print(f"5-fold CV RMSE: {cv_rmse:.4f} µg/m³")

print(f"\nIzhodne datoteke:")
for f in sorted(OUT.rglob("*")):
    if f.is_file():
        print(f"  {f.relative_to(BASE)}")

print("\n--- API ---")
print("Zaženi REST vmesnik:  uvicorn api:app --reload --port 8000")
print("Swagger UI:           http://localhost:8000/docs")

print("\nKonec.")
