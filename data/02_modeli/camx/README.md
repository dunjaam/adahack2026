# Modelska polja CAMx (ARSO), 4,4 km, 2023–2026

Operativni model kakovosti zraka ARSO (CAMx) za Slovenijo: **urna polja PM2.5, PM10 in O3** v prizemni plasti (najnižja modelska plast, do približno 10 m nad tlemi, odvisno od orografije) na mreži 4,4 km. To je **model**, ne meritev: pove, kako se onesnaženje razporeja v prostoru in času glede na vreme in emisije, ne pa, koliko je bilo izmerjeno. Vsa Mestna občina Ljubljana je v dveh do treh celicah; vse tri ljubljanske postaje so v **isti celici** (vrstica 34, stolpec 55).

**Vir:** ARSO, izvozi 18. in 20. 11. 2026 za potrebe hekatona. **Pri objavi navedite "Vir: ARSO".**
**Pripravljeno:** 20. 11. 2026 s skripto `skripte/paket/arso_camx.py` iz surovih izvozov (179.020 ASCII mrež, 1.418 zagonov, ~11 GB).

## Kako model deluje v času

- Vsak dan en **zagon ob 00 UTC**; ure napovedi `+1 … +24` so **urna povprečja za isti dan** (`+1` = 00–01 UTC, `+48` = 23–24 UTC naslednjega dne; potrdil ARSO v `../arso_opis_podatkov.pdf`). Napoved je operativno na voljo okoli 06 UTC, torej je to **jutranja napoved za danes**, ne napoved dan vnaprej.
- `time_utc` v datotekah je **začetek urnega intervala**, enako kot pri meritvah in CAMS; združujte po `time_utc`.
- Ure `+25 … +48` so **napoved za jutri** (zagon ob 00 UTC dan prej; `+25` = 00–01 UTC naslednjega dne), na voljo za **2023–2025**. V `camx_tocke_urno_2023_2026.csv.gz` so vrstice z `lead_h` 25–48; za isto `time_utc` sta tako **dve vrstici**, iz današnjega (`lead_h` 1–24) in iz včerajšnjega zagona (`lead_h` 25–48). Vedno filtrirajte po `lead_h`. Polja so ločena: `camx_kotlina_urno_<leto>.nc` iz ur +1 … +24, `camx_kotlina_urno_jutri_<leto>.nc` iz ur +25 … +48 (`time` je čas, na katerega se napoved nanaša).
- Za pošteno oceno "napovedi za jutri" uporabite vrstice z `lead_h` 25–48 (znane zjutraj dan prej); vrstice z `lead_h` 1–24 so jutranja napoved za isti dan. ARSO za rekonstrukcijo preteklega stanja priporoča ure `+1 … +24` naslednjega dne (natančnejše) in, kjer so, meritve.
- **V živo polj ni:** ARSO objavlja le slike (glej `v_zivo/README.md`, zajem slik teče). Zgodovina polj je v tem paketu do 18. 11. 2026.

## Datoteke

| Datoteka | Vsebina | Velikost |
|---|---|---|
| `camx_tocke_urno_2023_2026.csv.gz` | urne vrednosti v celici vsake točke: `run_utc`, `lead_h` (1–48), `time_utc`, `point_id`, `camx_pm25`, `camx_pm10`, `camx_o3` (µg/m³); 1.687.000 vrstic | 109 MB |
| `camx_tocke.csv` | 28 točk: 24 postaj ARSO po Sloveniji (`E403` Bežigrad, `E404` Vič, `E405` Celovška, …) in 4 točke iz `cams_openmeteo_*` (`PASJA`, `KRVAVEC`, `KAMNIK`, `DOMZALE`), z `lat`, `lon`, `row`, `col` | |
| `camx_kotlina_urno_<leto>.nc` | izrez **21 × 21 celic (92 km) okoli Ljubljane**, urno, 2023–2026, iz ur **+1 … +24** (napoved za isti dan); NetCDF4, spremenljivke `camx_pm25`, `camx_pm10`, `camx_o3` (time, y, x), koordinate `x`, `y` (m, projekcija modela), `lat`, `lon` (2D), `row`, `col` | 9–13 MB na leto |
| `camx_kotlina_urno_jutri_<leto>.nc` | isti izrez iz ur **+25 … +48** (napoved za jutri), 2023–2025; `time` je čas, na katerega se napoved nanaša | 13 MB na leto |
| `camx_slo_dnevno_2023_2026.nc` | dnevna povprečja (dan UTC, iz ur +1 … +24, vsaj 18 ur) za **celotno mrežo SLO** (109 × 75 celic), 1.417 dni | 35 MB |
| `camx_slo_dnevno_jutri_2023_2025.nc` | dnevna povprečja iz ur +25 … +48 (napoved za jutri) za celotno mrežo SLO, 1.092 dni | 28 MB |
| `camx_zimsko_povprecje_slo.tif` | GeoTIFF, 2 pasova: zimsko (nov–mar) povprečje PM2.5 in PM10 po celicah, 2023–2026; CRS modela | 58 KB |
| `camx_mreza_kotlina.geojson` | 441 celic izreza kot poligoni (WGS84) z `row`, `col`, `bezigrad` | 105 KB |

Mreža: Lambertova konformna projekcija `+proj=lcc +lat_0=46.244 +lon_0=17 +lat_1=46.244 +lat_2=46.244 +x_0=0 +y_0=0 +R=6367470 +units=m +no_defs`, levi zgornji vogal (−437.832, 133.972), celica 4400 m; vrstica 0 je sever, stolpec 0 zahod. Isto je zapisano v atributih NetCDF in v GeoTIFF.

## Branje

```python
import pandas as pd, xarray as xr
t = pd.read_csv("camx_tocke_urno_2023_2026.csv.gz", parse_dates=["time_utc"])
bez = t[(t.point_id == "E403") & (t.lead_h <= 24)]          # Bežigrad, napoved za isti dan
jutri = t[(t.point_id == "E403") & (t.lead_h >= 25)]        # Bežigrad, napoved za jutri (izdana dan prej)
k = xr.open_dataset("camx_kotlina_urno_2024.nc")             # polje okoli Ljubljane
polje = k.camx_pm25.sel(time="2024-01-15T18:00")             # ena ura
polje.plot(x="lon", y="lat")                                 # karta
```

V `primeri/paket.py` so `nalozi_camx(point_id)` (ure +1 … +24), `nalozi_camx_jutri(point_id)` (ure +25 … +48) in `nalozi_camx_polje(leto)`. `xarray` in `netCDF4` sta v `requirements.txt`; CSV s točkami deluje tudi brez njiju.

## Luknje v podatkih

| Obdobje | Manjka |
|---|---|
| pred 1. 1. 2023 | ni podatkov (mape za nov–dec 2022 so bile prazne) |
| 26. 11. – 31. 12. 2024 | **PM10 in O3** (PM2.5 je, iz dopolnilnega izvoza) |
| 1. 1. 2026 naprej | ure +25 … +48 (napoved za jutri je le za 2023–2025) |
| 20. 7. 2024, 25. 11. 2024 | del ur (12 oz. 18 od 24) |

Dopolnilni izvoz 20. 11. 2026 je zapolnil PM2.5 za leto 2025 in za 26. 11. – 31. 12. 2024 ter dodal ure +25 … +48 za 2023–2025.

Manjkajoče vrednosti so v CSV prazne, v NetCDF NaN. PM10 v modelu vedno vključuje ves PM2.5.

## Kako dobro se model ujema z meritvami v Ljubljani

Primerjava celice Bežigrad z meritvami ARSO (urne vrednosti, zimski meseci nov–mar, dnevna povprečja iz vsaj 18 ur). Preseganje: PM2.5 dnevno > 25 µg/m³, PM10 dnevno > 50 µg/m³.

| Zima | Onesnaževalo | Dni | Korelacija dnevno | Model / meritev (µg/m³) | Pristranskost | MAE | Preseganja meritev / model / zadetki / lažni / zgrešeni |
|---|---|---|---|---|---|---|---|
| 2022/23 (jan–mar) | PM2.5 | 90 | 0,85 | 24,7 / 21,9 | +2,8 | 6,4 | 31 / 38 / 29 / 9 / 2 |
| 2022/23 (jan–mar) | PM10 | 90 | 0,86 | 26,2 / 26,6 | −0,4 | 6,5 | 11 / 4 / 3 / 1 / 8 |
| 2023/24 | PM2.5 | 142 | 0,70 | 29,1 / 21,6 | +7,5 | 10,3 | 47 / 74 / 40 / 34 / 7 |
| 2023/24 | PM10 | 142 | 0,73 | 31,5 / 26,8 | +4,7 | 9,4 | 14 / 21 / 9 / 12 / 5 |
| 2024/25 (do 25. 11.) | PM10 | 115 | 0,73 | 33,6 / 23,0 | +10,7 | 12,4 | 9 / 21 / 3 / 18 / 6 |
| 2025/26 (nov–mar, 2026 do 18. 11.) | PM2.5 | 90 | 0,55 | 28,9 / 18,4 | +10,5 | 12,6 | 18 / 51 / 16 / 35 / 2 |
| 2025/26 | PM10 | 151 | 0,56 | 35,9 / 23,1 | +12,8 | 15,1 | 4 / 37 / 3 / 34 / 1 |

Vič in Celovška (ista celica) dajo enake ocene v okviru ±1 µg/m³. Urna korelacija je 0,4–0,65.

Kaj to pomeni:

- **Model precenjuje in pristranskost raste.** V zimi 2022/23 se je ujemal skoraj brez napake, od 2023/24 naprej precenjuje za 8–13 µg/m³. Meritve v Ljubljani v istem času padajo (letna povprečja PM2.5 Bežigrad 2023: 15,9, 2024: 13,7, 2025: 12,3 µg/m³), model pa ne sledi. Enak vzorec kaže CAMS (`../README.md`). Verjeten razlog so emisijski vhodi, ki se ne posodabljajo tako hitro kot dejanske emisije; potrditve ARSO nimamo.
- **Dnevni hod je napačen.** Model ima glavni vrh ob **6–8 UTC** (jutranje kurjenje in promet), meritve pa ga nimajo; izmerjeni vrh je ob **22 UTC**, ki ga model ujame, a prezgodaj in prešibko. Urne vrednosti modela za občana brez umerjanja niso uporabne.
- **Kot opozorilo za dan je model delno uporaben:** ujame večino dni s preseganjem PM2.5 (zadetki 40 od 47 v zimi 2023/24), a z veliko lažnimi alarmi, ker precenjuje; pri PM10 > 50 ujame manj kot polovico preseganj (`primeri/02_epizode_opozarjanje.ipynb`). Preprost popravek pristranskosti (odštetje povprečne razlike zadnjih 30 dni) urnega poteka ne reši (`05_obcan_zdaj.ipynb`: še vedno slabši od CAMS); pravo umerjanje (dnevni hod, odvisnost od vremena) je dobra naloga za ekipe.
- **Prostorsko** model pokaže, kje v kotlini se onesnaženje zadržuje (karta v `primeri/01_hiter_zacetek.ipynb`), a 4,4 km ne loči sosesk. Za primerjavo med četrtnimi skupnostmi je pregrob.

### Napoved za jutri (ure +25 … +48) proti napovedi za isti dan

Ista celica Bežigrad, zimski meseci, dnevna povprečja (dopolnilni izvoz 20. 11. 2026; zima 2025/26 le nov–dec 2025, 2024/25 ima zdaj tudi PM2.5).

| Zima | Onesnaževalo | Dni | Korelacija dnevno jutri / isti dan | Jutri / meritev (µg/m³) | Pristranskost jutri | MAE jutri / isti dan | Preseganja meritev / jutri / zadetki / lažni / zgrešeni |
|---|---|---|---|---|---|---|---|
| 2022/23 (jan–mar) | PM2.5 | 89 | 0,77 / 0,85 | 26,4 / 22,1 | +4,4 | 8,0 / 6,5 | 31 / 44 / 29 / 15 / 2 |
| 2022/23 (jan–mar) | PM10 | 89 | 0,76 / 0,86 | 28,0 / 26,8 | +1,2 | 8,1 / 6,6 | 11 / 7 / 3 / 4 / 8 |
| 2023/24 | PM2.5 | 142 | 0,68 / 0,70 | 30,4 / 21,6 | +8,8 | 11,5 / 10,3 | 47 / 82 / 39 / 43 / 8 |
| 2023/24 | PM10 | 142 | 0,71 / 0,73 | 32,9 / 26,8 | +6,1 | 10,5 / 9,4 | 14 / 26 / 11 / 15 / 3 |
| 2024/25 | PM2.5 | 150 | 0,75 / 0,75 | 34,7 / 19,5 | +15,2 | 15,7 / 14,4 | 41 / 95 / 41 / 54 / 0 |
| 2024/25 | PM10 | 150 | 0,75 / 0,73 | 36,6 / 23,4 | +13,2 | 14,1 / 12,5 | 12 / 34 / 9 / 25 / 3 |
| 2025/26 (nov–dec) | PM2.5 | 62 | 0,59 / 0,67 | 43,2 / 19,2 | +24,0 | 24,9 / 22,6 | 16 / 48 / 16 / 32 / 0 |
| 2025/26 (nov–dec) | PM10 | 62 | 0,58 / 0,65 | 45,2 / 23,1 | +22,2 | 23,3 / 20,9 | 1 / 28 / 1 / 27 / 0 |

- **Napoved za jutri je skoraj enaka napovedi za isti dan** (urna korelacija med njima 0,94): en dan starejši zagon izgubi le 1–2 µg/m³ MAE in nekaj stotink korelacije. Kar velja za "danes", velja za "jutri": model potek ujame (dnevna korelacija 0,6–0,77, urna 0,5), a **precenjuje in pristranskost raste iz zime v zimo** (PM2.5 +4, +9, +15, +24 µg/m³), v nov–dec 2025 napove skoraj vsak drugi dan preseganje PM2.5 25 µg/m³ (48 od 62 dni, izmerjenih 16).
- Zato je CAMx kot **pravilo za jutri brez umerjanja** slab (`primeri/02_epizode_opozarjanje.ipynb`: PM10 > 50 ujame 18 od 29 preseganj, 78 % opozoril je lažnih) in kot **napoved PM2.5 za jutri** najslabši od primerjanih (`03_napoved_jutri.ipynb`: MAE 25 proti 6 za vztrajnost). **Z umerjanjem** (odštetje drseče pristranskosti zadnjih 30 dni, prag glede na ciljno občutljivost) ali kot značilka modela je uporaben; to je dobra naloga za ekipe.
- Za oceno prave napovedi "za jutri" vedno uporabite vrstice z `lead_h` 25–48, ker so vrstice 1–24 znane šele zjutraj istega dne.

Ocene so izračunane iz `camx_tocke_urno_2023_2026.csv.gz` in `01_meritve/arso_lj_pm_urno_*.csv`; koda v `primeri/02_epizode_opozarjanje.ipynb` (pravilo CAMx za jutri in za isti dan) in `03_napoved_jutri.ipynb` (CAMx za jutri kot napoved in kot značilka modela).
