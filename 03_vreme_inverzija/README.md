# Vreme in temperaturna inverzija

Meritve ARSO (10/30-minutne, 6 postaj z dna kotline in s hribov), izpeljana urna tabela inverzije, radiosondaža Ljubljana (IGRA2) z metrikami inverzije in reanaliza ERA5 z višino mejne plasti. Meritve in model sta jasno ločena po datotekah.

Vsi CSV: UTF-8, ločilo vejica, decimalna pika, `time_utc` ISO 8601 (začetek intervala). Vsaka vrstica nosi identifikator in koordinate postaje/točke. Za združevanje virov uporabite `time_utc`.

## Vreme in inverzija: ARSO samodejne postaje in radiosondaža Ljubljana

Del README-ja za mapo `03_vreme_inverzija/` (ERA5 je opisan posebej). Pripravljeno 13. 11. 2026 s skriptama `skripte/paket/arso_meteo_arhiv.py` in `skripte/paket/igra2_radiosondaza.py`.

Vsi časi: stolpec `time_utc` je ISO 8601 v UTC (`2026-01-15T20:00:00Z`). Pri podatkih ARSO je zraven še `time_local`, izvorni čas ARSO, ki je **UTC+1 brez poletnega premika** (ARSO ne premika ure; preverjeno s korelacijo sevanja in temperature z ERA5, najboljše ujemanje pri zamiku 0). Za spajanje z ARSO urnimi PM (`01_meritve`) uporabite `time_utc` na obeh straneh.

### 1. `arso_meteo_30min_<postaja>_2016_2026.csv` (6 datotek)

**Vir:** ARSO, arhiv meritev samodejnih meteoroloških postaj (https://meteo.arso.gov.si/met/sl/archive/), prevzeto prek XML končne točke spletne aplikacije. **Licenca:** podatki ARSO so prosto dostopni z navedbo vira; pri objavi navedite "Vir: ARSO".

**Postaje** (koordinate in višine v `arso_meteo_postaje.geojson`):

| station_id | datoteka | postaja | višina | vloga |
|---|---|---|---|---|
| 1828 | `lj_bezigrad` | Ljubljana Bežigrad | 299 m | dno kotline, ob postaji za kakovost zraka E403 in radiosondaži |
| 964 | `lj_vic` | Ljubljana Vič | 293 m | dno kotline, jugozahod mesta (ob E404) |
| 2842 | `topol` | Topol pri Medvodah | 692 m | nizek hrib nad kotlino (vrh plitve inverzije) |
| 2658 | `pasja_ravan` | Pasja ravan | 1019 m | referenčni hrib za inverzijo (nad vrhom tipične zimske inverzije) |
| 2210 | `krvavec` | Krvavec | 1742 m | visok hrib, prosta atmosfera |
| 1820 | `kredarica` | Kredarica | 2513 m | visokogorje, sinoptično ozadje |

**Obseg (stanje 13. 11. 2026):** 1. 1. 2016 do 12. 11. 2026. Vrstic: Bežigrad 396.783, Vič 291.264, Topol 571.407, Pasja ravan 571.407, Krvavec 571.023, Kredarica 571.407.

**Ločljivost:** 10 minut na hribovskih postajah ves čas; Bežigrad 30 minut 2016–2020 in 10 minut od 2021; Vič ima do 2020 le nekaj dni na leto (arhiv za to obdobje ni popoln), zato ga uporabljajte od 2021 naprej. Padavine in sevanje so pri 10-minutnih zapisih podane le na polne pol ure (vmes prazno). Vrednost ob času `t` je povprečje/vsota intervala, ki se konča ob `t`.

**Stolpci:**

| stolpec | pomen | enota |
|---|---|---|
| `time_utc`, `time_local` | čas (glej zgoraj) | |
| `station_id`, `station_name`, `lat`, `lon`, `alt_m` | postaja (WGS84, m n. v.) | |
| `pressure_hpa` | povprečen zračni tlak na postaji (ne reduciran na morje) | hPa |
| `temp_c` | povprečna temperatura zraka na 2 m | °C |
| `rh_pct` | povprečna relativna vlaga | % |
| `rh_termin_pct` | terminska (trenutna) relativna vlaga | % |
| `wind_speed_ms` | povprečna hitrost vetra (10 m) | m/s |
| `wind_dir_deg` | povprečna smer vetra (0 = sever, 90 = vzhod) | ° |
| `wind_gust_ms` | največji sunek vetra v intervalu | m/s |
| `precip_mm` | količina padavin v intervalu | mm |
| `global_rad_wm2` | povprečen tok globalnega sončnega sevanja | W/m² |

**Katere spremenljivke ima katera postaja:** vse imajo `temp_c`, `rh_pct`, `rh_termin_pct`. Tlak: samo Bežigrad in Kredarica. Veter: Bežigrad, Vič, Pasja ravan, Krvavec, Kredarica (Topol ga nima). Padavine: vse razen Viča. Globalno sevanje: vse razen Pasje ravni. Stolpci, ki jih postaja nima, v datoteki manjkajo.

**Opozorila:** prazna celica = ni meritve. Manjkajo posamezni dnevi ali meseci (izpad postaje); Pasja ravan ima podatke od 2015. Tlak na hribih je postajni, zato ni primerljiv z dolino brez redukcije. Podatki so iz spletnega arhiva in niso nujno dokončno validirani.

### 2. `inverzija_urno_2016_2026.csv`

Izpeljana urna tabela iz zgornjih datotek: urno povprečje temperature na vseh šestih postajah ter razlike dolina–hrib.

| stolpec | pomen |
|---|---|
| `time_utc` | začetek ure (UTC) |
| `temp_lj_bezigrad`, `temp_lj_vic`, `temp_topol`, `temp_pasja_ravan`, `temp_krvavec`, `temp_kredarica` | urno povprečje T (°C) |
| `wind_speed_lj_bezigrad`, `wind_gust_lj_bezigrad`, `rh_lj_bezigrad`, `pressure_lj_bezigrad`, `precip_lj_bezigrad`, `global_rad_lj_bezigrad` | urno povprečje (padavine: vsota) na Bežigradu |
| `dt_bezigrad_<hrib>` | T(Bežigrad) − T(hrib), K; **negativno = hrib toplejši od doline = temperaturna inverzija** |
| `inv_<hrib>` | 1, če je T(Bežigrad) < T(hrib); 0 sicer; prazno, če manjka ena od meritev |
| `lapse_bezigrad_pasja_ravan_k_per_km` | navidezni vertikalni gradient med Bežigradom (299 m) in Pasjo ravnjo (1019 m), K/km; normalno okoli −6,5, pri inverziji pozitiven |

Za orientacijo: pozimi (DJF) je `inv_pasja_ravan` = 1 v 21 % ur (največ med 7. in 10. uro UTC, 34 %), `inv_topol` v 33 %, `inv_krvavec` v 17 %. Tabela ima 95.240 ur.

Najbolj uporaben indikator za Ljubljansko kotlino je `dt_bezigrad_pasja_ravan` (Pasja ravan je tik nad vrhom tipične zimske inverzije). `inv_topol` zazna plitve nočne inverzije, `inv_krvavec` globoke.

### 3. `igra2_lj_profili_2016_2026.csv`

**Vir:** NOAA NCEI, Integrated Global Radiosonde Archive v2 (IGRA2), postaja SIM00014015 Ljubljana/Bežigrad (WMO 14015), https://www.ncei.noaa.gov/pub/data/igra/ (datoteki `data-por/SIM00014015-data.txt.zip` in `data-y2d/SIM00014015-data-beg2026.txt.zip`). Format: `igra2-data-format.txt`. **Licenca:** javni podatki NOAA, brez omejitev; navedite "NOAA NCEI IGRA2" in ARSO kot izvajalca meritev.

Vsak nivo vsake sondaže od 1. 1. 2016 do 31. 10. 2026 (4.125 sondaž, 76.787 nivojev; datoteka tekočega leta pri NOAA zaostaja približno dva tedna), samo nivoji s tlakom ≥ 500 hPa (do približno 5,5 km).

| stolpec | pomen |
|---|---|
| `time_utc` | nominalni termin sondaže (do 2025 ena dnevno ob 06 UTC, od 2026 ob 00 in 12 UTC) |
| `release_time_utc` | dejanski čas izpusta balona (praviloma 30–70 min pred terminom) |
| `level_type1` | 1 = standardni tlačni nivo, 2 = drug nivo (značilni, površje), 3 = nivo po višini |
| `level_type2` | 1 = površje, 2 = tropopavza, 0 = drugo |
| `pressure_hpa` | tlak | 
| `height_m` | geopotencialna višina (m n. v.); prazno pri mnogih značilnih nivojih, površje = 299 m |
| `temp_c`, `dewpoint_c` | temperatura in rosišče (°C) |
| `wind_dir_deg`, `wind_speed_ms` | veter |
| `station_id`, `lat`, `lon`, `alt_m` | postaja |

### 4. `igra2_lj_inverzija_dnevno.csv`

Ena vrstica na sondažo (4.125) z metrikami stabilnosti. V zimskih sondažah (DJF) je delež `surface` 40 %, `elevated` 12 %. Metode so namerno preproste in prozorne; niso uradne ARSO metrike.

| stolpec | pomen |
|---|---|
| `time_utc`, `release_time_utc`, `hour_nominal`, `n_levels` | termin, izpust, nominalna ura, število nivojev |
| `p_sfc_hpa`, `t_sfc_c`, `wind_sfc_dir_deg`, `wind_sfc_speed_ms` | površje (299 m) |
| `t_925_c`, `t_850_c`, `t_700_c` | temperatura na standardnih nivojih (interpolacija v ln p, če nivo ni podan) |
| `wind_925_*`, `wind_850_*`, `wind_700_*` | veter na standardnem nivoju (brez interpolacije; prazno, če nivoja ni) |
| `dt_sfc_850_k` | T(površje) − T(850 hPa); pozitivno velik = labilno, negativen = močna stabilnost/inverzija |
| `t_at_1019m_c`, `t_at_1742m_c` | T iz profila na višinah Pasje ravni in Krvavca (linearna interpolacija po višini) – neposredno primerljivo z `dt_bezigrad_*` iz ARSO postaj |
| `dt_sfc_1019m_k`, `dt_sfc_1742m_k` | T(površje) − T(višina) |
| `inv_type` | `surface` (T narašča že od tal), `elevated` (prva plast z naraščanjem T je dvignjena), `none` (v spodnjih 3000 m ni plasti z naraščanjem T) |
| `inv_base_m_agl`, `inv_top_m_agl`, `inv_depth_m` | spodnja in zgornja meja prve inverzijske plasti nad tlemi (m nad tlemi) |
| `inv_strength_k` | T(vrh) − T(dno) inverzijske plasti, K |
| `mixing_height_m_agl` | nadomestna ocena višine mešanja: prva višina, kjer potencialna temperatura preseže prizemno za 1 K (interpolirano). Pri sondaži ob 06 UTC pozimi to meri globino nočne stabilne plasti, ne popoldanske mejne plasti. Za dnevno mejno plast uporabite `boundary_layer_height` iz ERA5. |

**Metoda inverzije:** profil (višina, T) od tal navzgor do 3000 m nad tlemi; prva plast, v kateri T z višino narašča, je "prva inverzija"; če se začne na površju, je `surface`, sicer `elevated`. Izotermna plast ne šteje. Nivoji brez višine so pri tem izpuščeni.

**Opozorila:** termin 06 UTC (07 lokalno) ujame jutranjo inverzijo blizu njenega maksimuma; od 2026 sta termina 00 in 12 UTC, zato niz ni homogen. Vrednosti vetra nad 60 m/s na površju (4 primeri) so odstranjene kot napake senzorja. Relativne vlage IGRA2 za to postajo ne vsebuje (samo rosišče).

### Primer branja

```python
import pandas as pd
inv = pd.read_csv("inverzija_urno_2016_2026.csv", parse_dates=["time_utc"])
zima = inv[inv.time_utc.dt.month.isin([12, 1, 2])]
print(zima.groupby(zima.time_utc.dt.hour).inv_pasja_ravan.mean())   # delež ur z inverzijo po urah dneva

pm = pd.read_csv("../01_meritve/arso_lj_pm_urno_2016_2026.csv.gz", parse_dates=["time_utc"])
m = pm[pm.station_code == "E403"].merge(inv, on="time_utc")
print(m.groupby(m.dt_bezigrad_pasja_ravan.round()).pm10.mean())      # PM10 proti razliki T dolina–hrib

snd = pd.read_csv("igra2_lj_inverzija_dnevno.csv", parse_dates=["time_utc"])
print(snd[snd.inv_type == "surface"].inv_strength_k.describe())
```

## ERA5 prek Open-Meteo: urna reanaliza vremena za Ljubljansko kotlino (2016–2026), z višino mejne plasti

**Vir:** ECMWF ERA5 / ERA5-Land (Copernicus Climate Change Service) prek Open-Meteo Historical Weather API
(`https://archive-api.open-meteo.com/v1/archive`, brez ključa).
**Licenca:** CC BY 4.0 (navedite "Open-Meteo.com" in "ERA5 / Copernicus C3S").
**Pripravljeno:** 13. 11. 2026 s skripto `skripte/paket/era5_openmeteo.py`.

To je **reanaliza (model)**, ne meritev. Za izmerjeno vreme uporabite datoteke ARSO v tej mapi (`arso_meteo_30min_*.csv`). ERA5 je koristen, ker je popoln (brez lukenj), ima iste spremenljivke v napovedi (klic v živo spodaj) in ima **`boundary_layer_height`** (višina mejne plasti), ki je neposreden model­ski kazalnik inverzije: ponoči pozimi 10–60 m, opoldne nekaj sto metrov.

### Datoteke

| Datoteka | Vsebina | Vrstic |
|---|---|---|
| `era5_openmeteo_urno_2016_2020.csv.gz` | urno, 8 točk, 2016–2020 | 350.784 |
| `era5_openmeteo_urno_2021_2026.csv.gz` | urno, 8 točk, 1. 1. 2021 – 12. 11. 2026 | 411.264 |

### Točke

Iste kot v `../02_modeli/README.md` (razdelek CAMS): E403 LJ Bežigrad, E405 LJ Celovška, E404 LJ Vič, E805 Brezje pri Grosupljem, PASJA Pasja ravan (1030 m), KRVAVEC Krvavec (1740 m), KAMNIK, DOMZALE.
Pozor: tri ljubljanske točke (E403, E405, E404) padejo v **isto celico** reanalize (`model_lat` 46.08, `model_lon` 14.45); razlikujejo se le po višinski korekciji temperature (`model_elev_m` 300/309/296). Za Ljubljano torej uporabite eno od njih.

### Stolpci

| Stolpec | Enota | Pomen |
|---|---|---|
| `time_utc` | | ura v UTC, ISO 8601 |
| `point_id`, `point_name`, `lat`, `lon` | | zahtevana točka |
| `model_lat`, `model_lon`, `model_elev_m` | °, m | celica modela in njena višina |
| `temperature_2m`, `dew_point_2m` | °C | temperatura in rosišče na 2 m |
| `relative_humidity_2m` | % | |
| `surface_pressure`, `pressure_msl` | hPa | tlak na postaji / reduciran na morje |
| `precipitation` | mm | padavine v uri |
| `wind_speed_10m`, `wind_gusts_10m` | km/h | **km/h, ne m/s** |
| `wind_direction_10m` | ° | smer, od koder piha |
| `cloud_cover` | % | |
| `shortwave_radiation` | W/m² | sončno obsevanje (povprečje ure) |
| `boundary_layer_height` | m | višina mejne plasti (samo ERA5, celica 0,25°) |

### Opozorila

- `boundary_layer_height` **manjka za 1. 1. – 30. 6. 2024** pri vseh točkah (luknja v arhivu Open-Meteo, preverjeno pri vseh modelih 13. 11. 2026). Za to obdobje uporabite razliko temperatur Bežigrad – Pasja ravan iz ARSO datotek ali radiosondažo.
- Temperature na tlačnih nivojih (925/850 hPa) arhivski API ne vrača; za vertikalni profil uporabite radiosondažo (`igra2_*.csv`).
- Relief v ERA5 je zglajen: Krvavec in Pasja ravan imata v modelu 1725 oziroma 1018 m, kar je blizu, a dolinske inverzije so v modelu šibkejše kot v resnici.

### Klic v živo: napoved vremena (brez ključa, 7–16 dni)

```
https://api.open-meteo.com/v1/forecast?latitude=46.0655&longitude=14.5127&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure,precipitation,cloud_cover,shortwave_radiation,boundary_layer_height&forecast_days=7&timezone=UTC
```

Iste spremenljivke kot v arhivu, zato lahko model, naučen na arhivu, uporabite neposredno na napovedi. Preteklih dni v napovedi: dodajte `&past_days=2`.

### Primer branja

```python
import pandas as pd
e = pd.concat(pd.read_csv(f, parse_dates=["time_utc"]) for f in
              ["era5_openmeteo_urno_2016_2020.csv.gz", "era5_openmeteo_urno_2021_2026.csv.gz"])
lj = e[e.point_id == "E403"].set_index("time_utc")
winter = lj[lj.index.month.isin([12, 1, 2])]
print(winter.groupby(winter.index.hour).boundary_layer_height.median())   # dnevni hod mejne plasti pozimi
# inverzija kot razlika T(Bežigrad) - T(Pasja ravan) v modelu:
pr = e[e.point_id == "PASJA"].set_index("time_utc").temperature_2m
print((lj.temperature_2m - pr).describe())
```
