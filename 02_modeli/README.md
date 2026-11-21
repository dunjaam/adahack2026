# Modeli

Regionalni model CAMS Europe (0,1°) prek Open-Meteo za 8 točk v kotlini, 2016–2026, in napoved. Modelska polja ARSO **CAMx (4,4 km, urno, 2023–2026, napoved za danes in jutri)** so v podmapi `camx/` (opis, luknje in ocena ujemanja v `camx/README.md`). Polja ARSO **GRAL (15 m, Ljubljana, prispevek malih kurišč in osebnih vozil po urah leta 2021; mreža v UTM 33N)** so v podmapi `gral/` (`gral/README.md`; promet samo relativno, ker so absolutne vrednosti ~10-krat previsoke). Emisije, iz katerih GRAL izhaja, so v `04_prostor/emisije/`. Opis vseh podatkov ARSO (CAMx, emisije, GRAL) z njihovimi besedami je v `arso_opis_podatkov.pdf`. V `arso_slike/` so tri slike ARSO (19. 11. 2026): tabela preseganj PM2.5 po postajah glede na novo direktivo o kakovosti zraka (dnevna meja 25 µg/m³, dovoljenih 18 preseganj; letna meja 20 do 2030, nato 10) ter modelski oceni PM2.5 in PM10 za Ljubljano v visoki ločljivosti (letno povprečje; model in leto nista navedena, prikazujeta prostorski vzorec: cestna mreža in središče). Samo slike, brez podatkov; navedba "Vir: ARSO". Slike dnevne napovedi CAMx so v zajemu v oblaku (`v_zivo/README.md`).

Vsi CSV: UTF-8, ločilo vejica, decimalna pika, `time_utc` ISO 8601 (začetek intervala). Vsaka vrstica nosi identifikator in koordinate postaje/točke. Za združevanje virov uporabite `time_utc`.

## CAMS Europe (0,1°) prek Open-Meteo: urne modelske vrednosti za Ljubljansko kotlino (2016–2026) in napoved

**Vir:** Copernicus Atmosphere Monitoring Service (CAMS), evropski ansambel 0,1° (~10 km), prek Open-Meteo Air Quality API
(`https://air-quality-api.open-meteo.com/v1/air-quality`, `domains=cams_europe`, brez ključa).
**Licenca:** CC BY 4.0 (navedite "Open-Meteo.com" in "CAMS / Copernicus").
**Pripravljeno:** 13. 11. 2026 s skripto `skripte/paket/cams_openmeteo.py`.

To je **model**, ne meritev. Celica modela je ~10 km; celotna kotlina je 2–3 celice, zato CAMS ne vidi razlik med soseskami. Uporaben je kot regionalno ozadje, za primerjavo "model proti meritvi" in kot 4-dnevna napoved za zgodnje opozarjanje. Obdobje do oktobra 2023 je CAMS reanaliza/interim, od oktobra 2023 naprej so arhivirane napovede (Open-Meteo ju združuje v en niz).

### Datoteke

| Datoteka | Vsebina | Vrstic |
|---|---|---|
| `cams_openmeteo_urno_2016_2026.csv.gz` | urne vrednosti, 8 točk, 1. 1. 2016 – 12. 11. 2026 | 762.048 |
| `cams_openmeteo_napoved_20261113.csv` | napoved, izdana 13. 11. 2026: 2 dni nazaj + 4 dni naprej (do 17. 11.), iste točke, dodatni stolpec `issued_utc` | 1.160 |

### Točke

| `point_id` | Ime | lat | lon | Opomba |
|---|---|---|---|---|
| E403 | LJ Bežigrad | 46.0655 | 14.5127 | ARSO postaja |
| E405 | LJ Celovška | 46.0721 | 14.4871 | ARSO postaja; ista celica modela kot E403 |
| E404 | LJ Vič | 46.0375 | 14.4893 | ARSO postaja |
| E805 | Brezje pri Grosupljem | 45.9565 | 14.6477 | ARSO postaja |
| PASJA | Pasja ravan | 46.0978 | 14.2281 | ARSO meteorološka postaja, 1030 m |
| KRVAVEC | Krvavec | 46.2974 | 14.5333 | ARSO postaja, 1740 m |
| KAMNIK | Kamnik | 46.2257 | 14.6119 | središče naselja |
| DOMZALE | Domžale | 46.1378 | 14.5950 | središče naselja |

Stolpca `model_lat`, `model_lon` povesta, katero celico modela je Open-Meteo dejansko vrnil (mreža 0,1°), `model_elev_m` pa njeno višino.

### Stolpci

| Stolpec | Enota | Pomen |
|---|---|---|
| `time_utc` | | ura v UTC, ISO 8601 |
| `issued_utc` | | samo napoved: čas izdaje (klica API) |
| `point_id`, `point_name`, `lat`, `lon` | | zahtevana točka |
| `model_lat`, `model_lon`, `model_elev_m` | °, m | celica modela |
| `pm10`, `pm2_5`, `nitrogen_dioxide`, `ozone`, `sulphur_dioxide`, `carbon_monoxide` | µg/m³ | koncentracije pri tleh |
| `dust` | µg/m³ | puščavski prah (od 2018; 2016–2017 prazno) |
| `european_aqi` | indeks 0–100+ | evropski indeks kakovosti zraka (EAQI), računa Open-Meteo |

Stolpec `aerosol_optical_depth` je bil zahtevan, a je za `cams_europe` v arhivu povsod prazen, zato je izpuščen.

### Opozorila

- **Odstopanje od meritev se s časom spreminja** (urne vrednosti, Bežigrad E403, nov–mar, µg/m³):

| zima | ARSO PM10 | CAMS PM10 | r | ARSO PM2.5 | CAMS PM2.5 | r |
|---|---|---|---|---|---|---|
| 2016/17 | 41,5 | 38,4 | 0,70 | | 35,1 | |
| 2018/19 | 32,2 | 29,3 | 0,77 | | 25,1 | |
| 2020/21 | 24,9 | 27,6 | 0,89 | 20,7 | 20,9 | 0,78 |
| 2022/23 | 23,9 | 31,5 | 0,77 | 19,9 | 28,1 | 0,77 |
| 2024/25 | 23,6 | 29,5 | 0,58 | 19,7 | 26,7 | 0,59 |
| 2025/26 | 23,1 | 40,0 | 0,40 | 18,7 | 34,8 | 0,44 |

  Do 2019/20 je model rahlo podcenjeval, od 2022/23 vedno bolj **precenjuje**, v zimi 2025/26 za 70 % s šibko korelacijo. Verjetni razlog: za zadnji dve leti Open-Meteo nima CAMS *reanalize* (ta zaostaja ~2 leti), ampak arhiv operativne *analize/napovedi*, ki uporablja drug nabor emisij. Posledica za ekipe: CAMS je uporaben kot regionalno ozadje in za obliko epizod, ne kot vrednost na postaji; vsak model je treba pred uporabo preveriti proti meritvam za isto obdobje (glej zvezek `primeri/01_hiter_zacetek.ipynb`, korak 4).
- Napoved je shranjena enkrat; za svežo napoved uporabite klic v živo (spodaj).
- Ne združujte CAMS in meritev v isto spremenljivko; CAMS je vedno "model".

### Klic v živo (brez ključa)

```
https://air-quality-api.open-meteo.com/v1/air-quality?latitude=46.0655&longitude=14.5127&hourly=pm10,pm2_5,nitrogen_dioxide,ozone,european_aqi&domains=cams_europe&past_days=2&forecast_days=5&timezone=UTC
```

Omejitev: 10.000 klicev na dan, nekomercialna raba. Dodajte `&format=csv` za CSV.

### Primer branja

```python
import pandas as pd
cams = pd.read_csv("cams_openmeteo_urno_2016_2026.csv.gz", parse_dates=["time_utc"])
arso = pd.read_csv("../01_meritve/arso_lj_pm_urno_2016_2026.csv.gz", parse_dates=["time_utc"])
m = arso[arso.station_code == "E403"].merge(cams[cams.point_id == "E403"], on="time_utc", suffixes=("_arso", "_cams"))
print(m[["pm10_arso", "pm10_cams"]].corr())
print(m.groupby(m.time_utc.dt.month)[["pm10_arso", "pm10_cams"]].mean().round(1))   # model proti meritvi po mesecih
```
