# Kontrola kakovosti paketa

Datum: 20. 11. 2026. Ukaz za ponovitev: `py -I skripte/paket/preveri_paket.py`. Pregledanih datotek: 47; napak: 0; opozoril: 3.

Status NAPAKA pomeni stvar, ki bi ekipam povzročila težave (datoteka se ne naloži, napačen format časa, podvojeni ključi, ni v README). OPOZORILO je lastnost podatkov, ki jo je treba poznati (negativne vrednosti, luknje, geometrije).

| Mapa | Datoteka (sloj) | Vrstice/elementi | Obdobje | MB | Status | Opomba |
|---|---|---|---|---|---|---|
| 01_meritve | `arso_lj_pm_urno_2016_2026.csv.gz` | 197021 | 2015-12-31 – 2026-10-31 | 26.9 | OK | manjka > 5 %: pm10_raw 99%, pm25 22% |
| 01_meritve | `arso_lj_pm_urno_2026_11_dopolnitev.csv` | 1386 | 2026-11-01 – 2026-11-20 | 0.2 | OK | manjka > 5 %: pm10_raw 100% |
| 01_meritve | `arso_lj_postaje.geojson` | 3 |  | 0.0 | OK | EPSG:4326, Point, bbox 14.487 46.037 14.513 46.072 |
| 01_meritve | `eea_postaje.geojson` | 13 |  | 0.0 | OK | EPSG:4326, Point, bbox 14.362 45.561 15.083 46.297 |
| 01_meritve | `eea_si_utd_2026.csv` | 179812 | 2026-01-01 – 2026-11-13 | 16.1 | OPOZORILO | negativne vrednosti: value 5772 (min -3.91) (validity 2: 5314, 1: 373, 4: 85; koda 2 = veljavno pod mejo zaznave) |
| 01_meritve | `eea_si_validirano_dnevno_2013_2025.csv` | 45174 | 2013-01-01 – 2025-12-31 | 4.1 | OK |  |
| 01_meritve | `eea_si_validirano_urno_2013_2019.csv.gz` | 592435 | 2013-01-01 – 2019-12-31 | 54.1 | OPOZORILO | manjka > 5 %: value 6%; negativne vrednosti: value 1390 (min -3.55) (validity 1: 1316, 2: 74; koda 2 = veljavno pod mejo zaznave) |
| 01_meritve | `eea_si_validirano_urno_2020_2025.csv.gz` | 660756 | 2020-01-01 – 2025-12-31 | 59.3 | OPOZORILO | negativne vrednosti: value 4008 (min -4.27) (validity 2: 4004, 1: 4; koda 2 = veljavno pod mejo zaznave) |
| 01_meritve | `purpleair_lj_naprave.geojson` | 3 |  | 0.0 | OK | EPSG:4326, Point, bbox 14.380 45.950 14.584 46.058 |
| 01_meritve | `purpleair_lj_urno.csv` | 74769 | 2021-12-19 – 2026-11-17 | 7.5 | OK |  |
| 01_meritve | `sensor_community_lj_naprave.geojson` | 10 |  | 0.0 | OK | EPSG:4326, Point, bbox 14.470 46.038 14.612 46.096 |
| 01_meritve | `sensor_community_lj_surovo_2025_26.csv.gz` | 504983 | 2025-11-01 – 2026-03-31 | 39.3 | OK | manjka > 5 %: pressure_hpa 67%, humidity_pct 18%, temperature_c 18%, humidity_sensor_id 17% |
| 01_meritve | `sensor_community_lj_surovo_2026_27.csv` | 141473 | 2026-10-01 – 2026-11-16 | 10.9 | OK | manjka > 5 %: pressure_hpa 68%, humidity_pct 20%, temperature_c 20%, humidity_sensor_id 19% |
| 01_meritve | `sensor_community_lj_urno_2023_2026.csv` | 79607 | 2023-11-01 – 2026-11-16 | 6.5 | OK | manjka > 5 %: pressure_hpa 67%, temperature_c 22%, humidity_pct 20%, humidity_sensor_id 20% |
| 01_meritve | `senzorji_umerjanje_koeficienti.csv` | 354 |  | 0.0 | OK | manjka > 5 %: ratio_rh_70_90 76%, ratio_rh_lt70 76%, ratio_rh_ge90 76%, c 73%, b 24%, a 24% |
| 01_meritve | `senzorji_umerjeno_urno.csv.gz` | 153135 | 2021-12-19 – 2026-11-17 | 27.3 | OK | manjka > 5 %: pm10_cal 12%, pm25_cal 7% |
| 02_modeli | `arso_opis_podatkov.pdf` |  |  | 1.87 | OK | skripta/dokument |
| 02_modeli | `cams_openmeteo_napoved_20261113.csv` | 1160 | 2026-11-11 – 2026-11-17 | 0.2 | OK |  |
| 02_modeli | `cams_openmeteo_urno_2016_2026.csv.gz` | 762048 | 2016-01-01 – 2026-11-12 | 81.9 | OK | manjka > 5 %: dust 18% |
| 03_vreme_inverzija | `arso_meteo_30min_kredarica_2016_2026.csv.gz` | 571407 | 2015-12-31 – 2026-11-12 | 68.1 | OK | Kredarica 2514 m je referenčna višinska postaja zunaj kotline (po načrtu); manjka > 5 %: global_rad_wm2 67%, precip_mm 67%, pressure_hpa 36%, rh_termin_pct 6%, rh_pct 6% |
| 03_vreme_inverzija | `arso_meteo_30min_krvavec_2016_2026.csv.gz` | 571023 | 2015-12-31 – 2026-11-12 | 64.5 | OK | manjka > 5 %: global_rad_wm2 67%, precip_mm 67% |
| 03_vreme_inverzija | `arso_meteo_30min_lj_bezigrad_2016_2026.csv.gz` | 396783 | 2015-12-31 – 2026-11-12 | 51.2 | OK | manjka > 5 %: global_rad_wm2 52%, precip_mm 52%, wind_speed_ms 8%, wind_gust_ms 7%, wind_dir_deg 7%, pressure_hpa 7% |
| 03_vreme_inverzija | `arso_meteo_30min_lj_vic_2016_2026.csv.gz` | 291264 | 2015-12-31 – 2026-11-11 | 33.6 | OK | manjka > 5 %: global_rad_wm2 68%, wind_speed_ms 6%, wind_dir_deg 6%, wind_gust_ms 6% |
| 03_vreme_inverzija | `arso_meteo_30min_pasja_ravan_2016_2026.csv.gz` | 571407 | 2015-12-31 – 2026-11-12 | 65.5 | OK | manjka > 5 %: precip_mm 67% |
| 03_vreme_inverzija | `arso_meteo_30min_topol_2016_2026.csv.gz` | 571407 | 2015-12-31 – 2026-11-12 | 62.6 | OK | manjka > 5 %: global_rad_wm2 67%, precip_mm 67% |
| 03_vreme_inverzija | `arso_meteo_postaje.geojson` | 6 |  | 0.0 | OK | EPSG:4326, Point, bbox 13.849 46.037 14.533 46.379; vključuje Kredarico zunaj kotline (po načrtu) |
| 03_vreme_inverzija | `era5_openmeteo_urno_2016_2020.csv.gz` | 350784 | 2016-01-01 – 2020-12-31 | 46.3 | OK |  |
| 03_vreme_inverzija | `era5_openmeteo_urno_2021_2026.csv.gz` | 411264 | 2021-01-01 – 2026-11-12 | 54.2 | OK | manjka > 5 %: boundary_layer_height 8% |
| 03_vreme_inverzija | `igra2_lj_inverzija_dnevno.csv` | 4125 | 2016-01-01 – 2026-10-31 | 0.9 | OK | manjka > 5 %: inv_top_m_agl 59%, inv_base_m_agl 59%, inv_depth_m 59%, inv_strength_k 59%, wind_925_speed_ms 54%, wind_925_dir_deg 54% |
| 03_vreme_inverzija | `igra2_lj_profili_2016_2026.csv` | 76787 | 2016-01-01 – 2026-10-31 | 7.9 | OK | manjka > 5 %: height_m 65%, wind_speed_ms 50%, wind_dir_deg 50%, dewpoint_c 15%, temp_c 15% |
| 03_vreme_inverzija | `inverzija_urno_2016_2026.csv` | 95240 | 2015-12-31 – 2026-11-12 | 10.5 | OK | izpeljana tabela več postaj, koordinate v arso_meteo_postaje.geojson (po načrtu); manjka > 5 %: temp_lj_vic 50% |
| 04_prostor | `dem_lj_kotlina_30m.tif` |  |  | 8.2 | OK | EPSG:4326, 2340×1440, ločljivost 0.000278×0.000278, nodata -32767.0, min 228.0 max 1849.5 |
| 04_prostor | `dem_lj_kotlina_30m_visina_nad_dnom.tif` |  |  | 8.8 | OK | EPSG:4326, 2340×1440, ločljivost 0.000278×0.000278, nodata -32767.0, min -50.0 max 1571.5 |
| 04_prostor | `evidim_kurilne_naprave_gorivo_moc_slo.csv` | 255 |  | 0.0 | OK | ni koordinat (po načrtu) |
| 04_prostor | `evidim_kurilne_naprave_obcine.csv` | 9372 |  | 0.5 | OK | ni koordinat (po načrtu) |
| 04_prostor | `kn_stavbe.gpkg:stavbe_tlorisi` | 145915 |  | 91.0 | OK | EPSG:3794, MultiPolygon, bbox 437476.860 81392.160 493591.090 135585.200 |
| 04_prostor | `kn_stavbe.gpkg:stavbe_tocke` | 146736 |  |  | OK | EPSG:3794, Point, bbox 437477.210 81395.630 493586.030 135576.260 |
| 04_prostor | `kn_stavbe_atributi.csv.gz` | 146736 |  | 37.3 | OK | ni koordinat (po načrtu); manjka > 5 %: leto_obnove_instalacij_max 87%, bruto_tlorisna_povrsina 84%, leto_obnove_fasade 84%, leto_obnove_oken_max 80%, visina_h1 72%, leto_obnove_strehe 68% |
| 04_prostor | `mol_cetrtne_skupnosti.geojson` | 17 |  | 0.4 | OK | EPSG:4326, Polygon, bbox 14.409 45.974 14.755 46.146 |
| 04_prostor | `mol_meja.geojson` | 1 |  | 0.2 | OK | EPSG:4326, Polygon, bbox 14.409 45.974 14.755 46.146 |
| 04_prostor | `mol_meje.gpkg:cetrtne_skupnosti` | 17 |  | 0.6 | OK | EPSG:3794, Polygon, bbox 454261.450 92845.450 481059.120 111921.580 |
| 04_prostor | `mol_meje.gpkg:naselja` | 38 |  |  | OK | EPSG:3794, Polygon, bbox 454261.130 92838.580 481054.170 111917.690 |
| 04_prostor | `mol_meje.gpkg:meja_mol` | 1 |  |  | OK | EPSG:3794, Polygon, bbox 454261.450 92845.450 481059.120 111921.580 |
| 04_prostor | `mol_naselja.geojson` | 38 |  | 0.7 | OK | EPSG:4326, Polygon, bbox 14.409 45.974 14.755 46.146 |
| 04_prostor | `osm_obcutljive_lokacije.csv` | 530 |  | 0.1 | OK |  |
| 04_prostor | `osm_obcutljive_lokacije.geojson` | 530 |  | 0.2 | OK | EPSG:4326, Point, bbox 14.267 45.859 14.844 46.299 |
| 04_prostor | `surs_ogrevanje_naselja.csv` | 148651 |  | 13.8 | OK | ni koordinat (po načrtu) |
| 04_prostor | `surs_ogrevanje_obcine.csv` | 37514 |  | 3.5 | OK | ni koordinat (po načrtu) |
| 04_prostor | `zkgji_plinovod.gpkg:linije` | 72066 |  | 56.6 | OK | EPSG:3794, LineString, bbox 395705.320 80173.120 470925.070 115783.670 |
| 04_prostor | `zkgji_plinovod.gpkg:tocke` | 79180 |  |  | OK | EPSG:3794, Point, bbox 455934.640 95342.040 470923.290 110191.590 |
| 04_prostor | `zkgji_plinovod.gpkg:poligoni` | 47 |  |  | OK | EPSG:3794, Polygon, bbox 457265.460 100690.850 470021.220 109466.830 |
| 04_prostor | `zkgji_vrocevod.gpkg:linije` | 24334 |  | 17.2 | OK | EPSG:3794, LineString, bbox 457460.270 100025.700 466981.110 106212.790 |
| 04_prostor | `zkgji_vrocevod.gpkg:tocke` | 23007 |  |  | OK | EPSG:3794, Point, bbox 458919.310 100028.790 466978.100 106212.790 |
| v_zivo | `zajem_arso_xml.py` |  |  | 0.0 | OK | skripta/dokument |
| v_zivo | `zrak_v_zivo.py` |  |  | 0.01 | OK | skripta/dokument |
| primeri | `01_hiter_zacetek.ipynb` |  |  | 0.95 | OK | skripta/dokument |
| primeri | `02_epizode_opozarjanje.ipynb` |  |  | 0.31 | OK | skripta/dokument |
| primeri | `03_napoved_jutri.ipynb` |  |  | 0.33 | OK | skripta/dokument |
| primeri | `04_kje_in_koga.ipynb` |  |  | 0.51 | OK | skripta/dokument |
| primeri | `05_obcan_zdaj.ipynb` |  |  | 0.1 | OK | skripta/dokument |
| primeri | `06_ucinek_ukrepa.ipynb` |  |  | 0.3 | OK | skripta/dokument |
| primeri | `07_scenariji_ukrepov.ipynb` |  |  | 0.38 | OK | skripta/dokument |
| primeri | `cs_kazalniki.csv` | 17 |  | 0.0 | OK | manjka > 5 %: gral_pm10_kurilna 6%, gral_pm10_januar 6% |
| primeri | `paket.py` |  |  | 0.01 | OK | skripta/dokument |
| primeri | `zgradi_02.py` |  |  | 0.02 | OK | skripta/dokument |
| primeri | `zgradi_03.py` |  |  | 0.01 | OK | skripta/dokument |
| primeri | `zgradi_04.py` |  |  | 0.02 | OK | skripta/dokument |
| primeri | `zgradi_05.py` |  |  | 0.02 | OK | skripta/dokument |
| primeri | `zgradi_06.py` |  |  | 0.01 | OK | skripta/dokument |
| primeri | `zgradi_07.py` |  |  | 0.02 | OK | skripta/dokument |
| primeri | `zgradi_zvezek.py` |  |  | 0.01 | OK | skripta/dokument |

## Napake in opozorila

### OPOZORILO (3)

- `01_meritve/eea_si_utd_2026.csv`: negativne vrednosti: value 5772 (min -3.91) (validity 2: 5314, 1: 373, 4: 85; koda 2 = veljavno pod mejo zaznave)
- `01_meritve/eea_si_validirano_urno_2013_2019.csv.gz`: manjka > 5 %: value 6%; negativne vrednosti: value 1390 (min -3.55) (validity 1: 1316, 2: 74; koda 2 = veljavno pod mejo zaznave)
- `01_meritve/eea_si_validirano_urno_2020_2025.csv.gz`: negativne vrednosti: value 4008 (min -4.27) (validity 2: 4004, 1: 4; koda 2 = veljavno pod mejo zaznave)

