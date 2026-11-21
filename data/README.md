# Podatkovni paket: Zrak, ki ga dihamo (ADA Hack 2026)

Vse podatke, ki jih potrebujete za izziv, smo prenesli, očistili in opisali vnaprej, da prve ure ne izgubite z registracijami in formati. Nič v tem paketu ne zahteva ključa ali prijave. Vsaka mapa ima svoj `README.md` z opisom vsake datoteke, stolpcev, enot, licence in znanih opozoril. Ta datoteka je kazalo.

Stanje podatkov: zajeto **13. 11. 2026** (občanski senzorji 17. 11., CAMx, GRAL in emisije ARSO 20. 11. 2026). Podatki v živo med hekatonom: `v_zivo/`.

## Prvi trije koraki

1. **Zaženite paket (prvih 15 minut).** `pip install -r requirements.txt` (Python 3.10+), nato poženite `primeri/01_hiter_zacetek.ipynb` od začetka do konca: ena karta vseh slojev, meritve, modeli in ocene drug ob drugem. Če teče, imate vse; nobena datoteka ne zahteva ključa ali prijave.
2. **Izberite izhodišče in uporabnika (do konca prve ure).** List za ekipe našteje osem izhodišč; vsako kaže zvezek in datoteke. Poženite ta zvezek (`primeri/02` … `07`) in preberite README mape, ki jo uporabljate, zlasti razdelek Opozorila. Zapišite v en stavek: komu (občan ali odločevalec) in na katero vprašanje odgovarjate.
3. **Ponovite eno številko in postavite poštenost (do konca druge ure).** Vzemite eno ugotovitev iz zvezka, jo ponovite ali spremenite s svojo kodo in zapišite, kaj je v vaši rešitvi meritev, kaj model in kaj ocena ter kje je omejitev. Šele nato gradite. Podatki v živo med hekatonom: `v_zivo/`.

## Skupni dogovori

- CSV: UTF-8, ločilo vejica, decimalna pika. Čas v stolpcu `time_utc` (ISO 8601, `2026-01-15T20:00:00Z`, začetek intervala). Kjer je vir v lokalnem času, je dodan `time_local` (ARSO: UTC+1 brez poletnega premika).
- Vsaka vrstica časovne vrste nosi identifikator in koordinate postaje ali točke (`lat`, `lon`, WGS84). Za združevanje virov uporabite `time_utc`.
- Vektorji: GeoPackage v EPSG:3794 (D96/TM, slovenski državni sistem), majhni sloji tudi GeoJSON v WGS84. Rastri: GeoTIFF, EPSG:4326.
- Vsaka datoteka ima v README oznako, ali je **meritev**, **model** ali **ocena**. Ta razlika naj bo vidna tudi v vaši rešitvi.
- Navedba vira je obvezna pri vsaki objavi (podrobno po mapah): ARSO, EEA, Open-Meteo / Copernicus (CAMS, ERA5, DEM), NOAA IGRA2, GURS, SURS, MOL.

## Kazalo

### `01_meritve/` – uradne meritve kakovosti zraka (meritev)

| Datoteka | Obseg | Vsebina |
|---|---|---|
| `arso_lj_pm_urno_2016_2026.csv.gz` | 197.021 vrstic, 27 MB | ARSO urni PM10 in PM2.5: Bežigrad (2016–), Celovška (2020–), Vič (2021–), do 31. 10. 2026; koordinate v vsaki vrstici |
| `arso_lj_postaje.geojson` | 3 točke | postaje z obdobji in tipom |
| `arso_lj_pm_urno_2026_11_dopolnitev.csv` | 1.446 vrstic | nadaljevanje od 1. 11. do 21. 11. 2026 08:00 UTC (jutro hekatona) (EEA nevalidirano + zajem XML v oblaku, stolpec `source`) |
| `eea_si_validirano_dnevno_2013_2025.csv` | 45.174 vrstic | validirana dnevna povprečja (gravimetrija) za 13 postaj: Ljubljana (Bežigrad, Celovška, Vič, Center 2017–2020, Biotehniška), Kranj, Iskrba, Krvavec, Zagorje, Hrastnik, Trbovlje |
| `eea_si_validirano_urno_2013_2019.csv.gz`, `..._2020_2025.csv` | 1,25 mio vrstic, 113 MB | validirane urne vrednosti PM10, PM2.5, NO2, O3 istih postaj |
| `eea_si_utd_2026.csv` | 179.812 vrstic | tekoče leto 2026, nevalidirano, do 13. 11. 2026 |
| `eea_postaje.geojson` | 13 točk | postaje s pokritostjo po onesnaževalu |
| `purpleair_lj_urno.csv`, `purpleair_lj_naprave.geojson` | 74.769 vrstic, 3 naprave | **občanski senzor** PurpleAir (PMS5003, dva kanala): OBELISK (vzhod, 2023–), Ljubljana Vič (2021–), Goričica (jug, 2026–); umerjanje na ARSO Vič po zimah v README |
| `sensor_community_lj_urno_2023_2026.csv`, `sensor_community_lj_surovo_2025_26.csv.gz`, `..._2026_27.csv`, `sensor_community_lj_naprave.geojson` | 79.607 ur, 9 zunanjih naprav (SDS011) | **občanski senzor** Sensor.Community, zime 2023/24–2025/26 in jesen 2026, urno in surovo (2,5 min) z vlago naprave; stolpec `flag` označi okvaro (senzor 21901 od 9. 11. 2026) |
| `senzorji_umerjanje_koeficienti.csv`, `senzorji_umerjeno_urno.csv.gz` | 354 vrstic koef., 153.135 ur | **ocena**: umerjanje vseh 12 občanskih naprav na najbližjo postajo ARSO (5 metod × sezone) in urne vrednosti po umerjanju; linearno umerjanje zniža RMSE z 19 na 9 µg/m³, korekcije po literaturi ga poslabšajo |

### `02_modeli/` – modelske vrednosti (model)

| Datoteka | Obseg | Vsebina |
|---|---|---|
| `cams_openmeteo_urno_2016_2026.csv.gz` | 762.048 vrstic, 82 MB | CAMS Europe 0,1° (regionalni model), urno za 8 točk kotline: PM10, PM2.5, NO2, O3, SO2, CO, prah, evropski indeks |
| `cams_openmeteo_napoved_20261113.csv` | 1.160 vrstic | napoved CAMS, izdana 13. 11. 2026, 4 dni |
| `camx/` | ~260 MB | **ARSO CAMx 4,4 km**: urna polja PM2.5, PM10, O3 za 2023–2026, napoved za danes (ure +1 … +24) in za jutri (+25 … +48, 2023–2025); izrez okoli Ljubljane v NetCDF, dnevna polja za Slovenijo, urne vrednosti v celicah vseh postaj ARSO v CSV; opis in ocena ujemanja v `02_modeli/camx/README.md` |
| `gral/` | ~230 MB | **ARSO GRAL 15 m, Ljubljana**: prispevek malih kurišč (`gral_kurisca_*`) in osebnih vozil (`gral_promet_*`, **samo relativno**, absolutne vrednosti vsaj 10-krat previsoke) h koncentraciji PM10, 8.760 ur leta 2021 (`time_utc`, primerljivo z meritvami 2021), strnjeno v statistiko 15 m (GeoTIFF), dnevni hod 30 m, dnevna polja 60 m, urna polja 250 m (NetCDF) ter urne vrednosti po četrtnih skupnostih, postajah in senzorjih (CSV); `02_modeli/gral/README.md` |

### `03_vreme_inverzija/` – vreme z dna kotline in s hribov (meritev in model)

| Datoteka | Obseg | Vsebina |
|---|---|---|
| `arso_meteo_30min_<postaja>_2016_2026.csv` (6 datotek) | 0,3–0,6 mio vrstic vsaka, 34–68 MB | **meritev** ARSO, 10/30-min: LJ Bežigrad (299 m), LJ Vič (od 2021), Topol (660 m), Pasja ravan (1019 m), Krvavec (1742 m), Kredarica (2514 m); T, vlaga, veter, tlak, padavine, sevanje (nabor se po postajah razlikuje) |
| `arso_meteo_postaje.geojson` | 6 točk | postaje z višinami |
| `inverzija_urno_2016_2026.csv` | 95.240 ur, 11 MB | **izpeljano iz meritev**: urne T vseh postaj, razlike Bežigrad–hribi, oznaka inverzije, veter in sevanje Bežigrad |
| `igra2_lj_profili_2016_2026.csv` | 4.125 sondaž, 76.787 nivojev | **meritev**: radiosondaža Ljubljana (profili do 500 hPa) |
| `igra2_lj_inverzija_dnevno.csv` | 4.125 vrstic | **izpeljano**: vrsta, višina in moč inverzije, višina mešanja, T na višinah Pasje ravni in Krvavca |
| `era5_openmeteo_urno_2016_2020.csv.gz`, `..._2021_2026.csv` | 762.048 vrstic, 100 MB | **model** (reanaliza ERA5) za iste točke kot CAMS: T, vlaga, veter, tlak, padavine, oblačnost, sevanje, višina mejne plasti |

### `04_prostor/` – stavbe, omrežja, meje, relief (stanje registrov)

| Datoteka | Obseg | Vsebina |
|---|---|---|
| `kn_stavbe.gpkg`, `kn_stavbe_atributi.csv.gz` | 146.736 stavb, 91 + 37 MB | kataster nepremičnin za 13 občin kotline: leto izgradnje in obnov, etaže, stanovanja, raba, priključki (plin pri 85 % stavb neznan) |
| `zkgji_vrocevod.gpkg`, `zkgji_plinovod.gpkg` | 24.334 + 72.066 linij, 17 + 57 MB | trase vročevoda in plinovoda v MOL s toplotnimi in regulatorskimi postajami |
| `mol_cetrtne_skupnosti.geojson`, `mol_naselja.geojson`, `mol_meja.geojson`, `mol_meje.gpkg` | 17 ČS, 38 naselij | meje MOL |
| `surs_ogrevanje_obcine.csv`, `surs_ogrevanje_naselja.csv` | 37.514 + 148.651 vrstic | stanovanja po načinu ogrevanja, občine in naselja, 2011–2021 |
| `osm_obcutljive_lokacije.geojson`, `osm_obcutljive_lokacije.csv` | 530 točk | vrtci, šole, bolnišnice, zdravstveni domovi in domovi za starejše v kotlini (OpenStreetMap, ODbL); za "kje in koga" in za izbiro merilnega mesta |
| `evidim_kurilne_naprave_obcine.csv`, `evidim_kurilne_naprave_gorivo_moc_slo.csv` | 9.372 + 255 vrstic | število malih kurilnih naprav po občinah, vrsti in energentu (EviDim, 2026); druga datoteka: Slovenija po gorivu in razredu moči |
| `dem_lj_kotlina_30m.tif`, `..._visina_nad_dnom.tif` | 2 × 8 MB | Copernicus DEM 30 m, izrez kotline, in višina nad dnom (278 m) |
| `emisije/` | 30 MB | **emisije PM10 ARSO (inventar, ocena)**: mala kurišča po mreži 250 m (127,9 t/leto, GPKG/GeoJSON/CSV), 65.521 cestnih odsekov z emisijo na km (GPKG; enote v potrjevanju), vsote po četrtnih skupnostih; `04_prostor/emisije/README.md` |

### `05_zadnji_dnevi/` – zajem v oblaku pred hekatonom

`arso_live_urno_vse_postaje.csv` (vse zajete ure ARSO XML feeda od 13. 11. 2026, 25 postaj, vsi onesnaževalci) in `camx/` (slike dnevne napovedi PM10 ARSO, CAMx 4,4 km). Osveženo na D-1; med hekatonom isto v živo prek `v_zivo/`.

### `primeri/` – sedem zvezkov s primeri

`01_hiter_zacetek` (nalaganje, združevanje, karta), `02_epizode_opozarjanje` (epizode in pravilo za opozorilo), `03_napoved_jutri` (model dnevnega PM2.5 iz vremena), `04_kje_in_koga` (indeks izpostavljenosti po ČS), `05_obcan_zdaj` (sporočilo za točko in naslednjih 12 ur), `06_ucinek_ukrepa` (meteorološka normalizacija), `07_scenariji_ukrepov` (kaj-če po ČS, igrifikacija). Vsi izvedeni z izhodi, tečejo brez interneta; opis v `primeri/README.md`. Namestitev: `pip install -r requirements.txt` (pandas, numpy, requests, geopandas, matplotlib, rasterio, scikit-learn, jupyter).

### `v_zivo/` – med hekatonom

`README.md` z URL-ji in zamiki (ARSO XML feed, zajem v oblaku z zgodovino, Open-Meteo napoved vremena in CAMS, slike CAMx, občanski senzorji), `zrak_v_zivo.py` (preverjen primer, ki vse združi v pandas; potrebuje samo pandas in requests) in `zajem_arso_xml.py` za lastno beleženje.

## Kontrola kakovosti

`KONTROLA.md`: samodejna kontrola vseh 47 datotek (nalaganje, format časa, podvojeni ključi, koordinate, manjkajoče vrednosti, geometrije, rastri), ponovljiva s `skripte/paket/preveri_paket.py`. Stanje: 0 napak, 3 opozorila (lastnosti podatkov, opisane v README map).

## Hiter začetek

```python
import pandas as pd, geopandas as gpd

pm = pd.read_csv("01_meritve/arso_lj_pm_urno_2016_2026.csv.gz", parse_dates=["time_utc"])
inv = pd.read_csv("03_vreme_inverzija/inverzija_urno_2016_2026.csv", parse_dates=["time_utc"])
df = pm[pm.station_code == "E403"].merge(inv, on="time_utc")           # PM Bežigrad + inverzija
zima = df[df.time_utc.dt.month.isin([11, 12, 1, 2])]
print(zima.groupby("inv_pasja_ravan").pm25.mean())                       # PM2.5 ob inverziji in brez nje

stavbe = gpd.read_file("04_prostor/kn_stavbe.gpkg", layer="stavbe_tlorisi")
cs = gpd.read_file("04_prostor/mol_meje.gpkg", layer="cetrtne_skupnosti")
```

## Česa v paketu ni (in zakaj)

- **Vrste ogrevanja ali energenta po stavbi.** Kataster teh polj od 2022 nima. Možna je le ocena po soseskah (bližina vročevoda in plinovoda, starost stavbe, SURS, EviDim); vsaka taka ocena naj bo označena kot ocena.
- **Goste mreže občanskih senzorjev.** V paketu je vse, kar v Ljubljani obstaja: 9 naprav Sensor.Community in 3 PurpleAir. Dovolj za razlike med soseskami in za umerjanje, premalo za karto kotline iz meritev. Pozimi senzorji v Ljubljani uradne vrednosti **podcenjujejo** (razmerje 0,6–0,9), ne precenjujejo; korekcija po literaturi za vlago ujemanje poslabša. Umerite vsako napravo na najbližjo postajo ARSO.
- **Satelitskih meritev PM.** Satelit ne meri PM pri tleh; nočni termalni posnetki (ECOSTRESS) so na voljo kot bonus na zahtevo.
- **Polj CAMx in GRAL v živo.** CAMx je v paketu za 2023–2026 (za jutri do konca 2025), GRAL za leto 2021; v živo ARSO objavlja samo slike CAMx.

## Pošteno opozorilo

Meritve so točkovne, modeli so grobi (CAMS in ERA5 ~10 km; vse tri ljubljanske postaje padejo v isto celico), registri imajo luknje. Del izziva je, da z omejenimi podatki poveste resnično in koristno zgodbo ter jasno označite, kaj je meritev, kaj model in kaj ocena.
