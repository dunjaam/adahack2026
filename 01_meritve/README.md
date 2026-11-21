# Meritve kakovosti zraka

Uradne meritve ARSO (urni PM10/PM2.5 za tri ljubljanske postaje neposredno od ARSO, 2016–2026; validirani podatki EEA za vse postaje v kotlini in okolici, 2013–2025, in tekoče leto 2026) ter občanski senzorji (PurpleAir: 3 naprave 2021–2026; Sensor.Community: 9 zunanjih naprav, zadnje tri kurilne sezone). Uradne meritve so referenca; občanski senzorji so dopolnilo za prostorsko sliko po soseskah in jih je treba umeriti na ARSO (razmerja po napravah in zimah so v spodnjih razdelkih).

Vsi CSV: UTF-8, ločilo vejica, decimalna pika, `time_utc` ISO 8601 (začetek urnega intervala). Oznake ur ARSO so preverjene proti EEA (ujemanje 100 % pri zamiku 0). Vsaka vrstica nosi identifikator in koordinate postaje ali naprave. Za združevanje uporabite `time_utc`.

## ARSO: urne meritve PM10 in PM2.5, Ljubljana (čista datoteka)

**Vir:** Agencija RS za okolje, Sektor za kakovost zraka (Mateja Gjerek), podatki prejeti 3. 11. 2026. Pripravljeno 04. 11. 2026 s skripto `skripte/priprava_arso_pm.py` iz izvornih datotek `podatki/ARSO/20261103-ARSO_LJ_*.csv`.

**Pogoji uporabe:** podatki so za potrebe hekatona ADA Hack 2026. Pri vsaki objavi navedite "Vir: ARSO". Podatki so urna povprečja samodejnih merilnikov in niso formalno validirani; dnevna povprečja se z validiranimi gravimetričnimi meritvami (EEA) ujemajo z r = 0,97.

### Datoteke

- `arso_lj_pm_urno_2026_11_dopolnitev.csv` – nadaljevanje iste tabele od 1. 11. 2026 do jutra hekatona (21. 11. 08:00 UTC) (isti stolpci + `source`: `eea_utd` = nevalidirane urne vrednosti iz EEA do 13. 11. 5:00 UTC, `arso_xml` = zajem ARSO XML feeda v oblaku od 13. 11. 12:00 UTC; vmes manjka 6 ur). Vrednosti pod mejo zaznave (`<2`) so zapisane kot polovica meje (1). Skripta `skripte/paket/arso_dopolnitev_2026.py`, osvežena na D-1.
- `arso_lj_pm_urno_2016_2026.csv.gz` – 197021 vrstic, ena vrstica = postaja × ura. UTF-8, ločilo vejica, decimalna pika.
- `arso_lj_postaje.geojson` – tri točke merilnih mest (WGS84) z istimi atributi.

### Postaje

| Koda | Ime | EEA koda | Tip | PM10 urno | PM2.5 urno | Odstranjenih negativnih PM10 |
|---|---|---|---|---|---|---|
| E403 | LJ Bežigrad | SI0003A | mestno ozadje | 01. 01. 2016 – 01. 11. 2026 | 11. 01. 2021 – 01. 11. 2026 | 1058 |
| E405 | LJ Celovška | SI0072A | promet | 04. 06. 2020 – 01. 11. 2026 | 04. 06. 2020 – 01. 11. 2026 | 0 |
| E404 | LJ Vič | SI0075A | mestno ozadje | 07. 07. 2021 – 01. 11. 2026 | 07. 07. 2021 – 01. 11. 2026 | 0 |

Koordinate (WGS84 in D96/TM, EPSG:3794) so iz uradnega ARSO XML feeda `ones_zrak_urni_podatki_zadnji.xml`.

### Stolpci

| Stolpec | Pomen |
|---|---|
| `time_utc` | začetek urnega intervala v UTC, ISO 8601 (npr. `2026-01-15T20:00:00Z`) |
| `time_local` | isti čas v izvornem lokalnem času, fiksni UTC+1 (ARSO ne premika na poletni čas) |
| `station_code` | koda ARSO merilnega mesta (E403, E405, E404) |
| `station_name` | ime merilnega mesta |
| `eea_code` | koda postaje v evropski bazi EEA (za spajanje z EEA podatki) |
| `station_type` | mestno ozadje / promet |
| `lat`, `lon` | WGS84 (EPSG:4326) |
| `alt_m` | nadmorska višina merilnega mesta |
| `d96_e`, `d96_n` | slovenske državne koordinate D96/TM (EPSG:3794), za spajanje s podatki GURS |
| `pm10` | PM10, µg/m³, urno povprečje; prazno, če meritve ni |
| `pm25` | PM2.5, µg/m³, urno povprečje; prazno, če meritve ni |
| `pm10_flag` | `neg_removed`, kjer je bila izvorna vrednost PM10 negativna in je `pm10` zato prazen |
| `pm10_raw` | izvorna negativna vrednost (samo pri `neg_removed`), da se nič ne izgubi |

### Opozorila

- Negativne vrednosti PM10 (1058, vse na Bežigradu 2016–2021, večinoma poleti) so merilni artefakt instrumenta; odstranjene so iz `pm10`, ohranjene v `pm10_raw`.
- Luknje: Bežigrad največ 3,4 dni (junij 2019, januar 2024, marec 2020), Celovška in Vič do 5 ur.
- PM2.5 na Bežigradu je urno na voljo šele od 11. 1. 2021; prej samo dnevno (EEA).
- Za spajanje z vremenom (Open-Meteo, ERA5) in CAMS uporabite `time_utc`. Za spajanje z ARSO meteorološkim arhivom (lokalni čas) uporabite `time_local`.
- Zimski večerni vrh PM2.5 (21.–23. h) je prisoten na vseh treh postajah, enako ob delovnikih in vikendih; razmerje PM2.5/PM10 je pozimi ~0,9, poleti ~0,6.

### Primer branja

```python
import pandas as pd
df = pd.read_csv("arso_lj_pm_urno_2016_2026.csv.gz", parse_dates=["time_utc"])
vic_winter = df[(df.station_code == "E404") & df.time_utc.dt.month.isin([12, 1, 2])]
vic_winter.groupby(vic_winter.time_utc.dt.hour).pm25.mean()
```

## EEA: validirane in tekoče meritve kakovosti zraka, Ljubljanska kotlina in okolica (2013–2026)

**Vir:** European Environment Agency, Air Quality Download Service (podatki, ki jih ARSO poroča v evropsko bazo).
API: `POST https://eeadmz1-downloads-api-appservice.azurewebsites.net/ParquetFile/urls` (dataset 2 = validirani E1a 2013–2025, dataset 1 = tekoče leto, nevalidirano). Metapodatki postaj: https://discomap.eea.europa.eu/map/fme/metadata/PanEuropean_metadata.csv
**Licenca:** EEA standardna ponovna uporaba (prosto z navedbo vira: "Vir: EEA / ARSO").
**Pripravljeno:** 13. 11. 2026 s skripto `skripte/paket/eea_meritve.py`.

### Razmerje do datoteke ARSO

`arso_lj_pm_urno_2016_2026.csv.gz` (glej razdelek ARSO zgoraj) ima **urne** PM10/PM2.5 za LJ Bežigrad, Celovško in Vič neposredno od ARSO. V EEA so za Bežigrad do 2025 samo **dnevne** PM vrednosti (gravimetrija, referenčna metoda), urne pa šele za 2026. Zato EEA uporabite za:

- okolico kotline (Kranj, Iskrba, Krvavec, Zasavje) in zaprte ljubljanske postaje (Biotehniška, LJ Center);
- NO2 in O3, ki jih v datoteki ARSO ni;
- dnevna gravimetrična povprečja PM (validirana referenčna vrednost; dnevna povprečja urnih ARSO podatkov se z njimi ujemajo z r ≈ 0,97);
- Bežigrad pred 2016.

Ne seštevajte obeh virov za isto postajo in isti parameter.

### Datoteke

| Datoteka | Vsebina | Vrstic |
|---|---|---|
| `eea_si_validirano_dnevno_2013_2025.csv` | dnevna povprečja (PM10, PM2.5 gravimetrija; NO2 Iskrba 2013–14), validirano | 45.174 |
| `eea_si_validirano_urno_2013_2019.csv.gz` | urne vrednosti 2013–2019, validirano | 592.435 |
| `eea_si_validirano_urno_2020_2025.csv.gz` | urne vrednosti 2020–2025, validirano | 660.756 |
| `eea_si_utd_2026.csv` | tekoče leto 2026 (1. 1. – 13. 11. 2026), urno, **nevalidirano** (up-to-date tok) | 179.812 |
| `eea_postaje.geojson` | 13 postaj (WGS84) z lastnostmi in pokritostjo po parametru | |

### Postaje in pokritost

| Koda EEA | Postaja | Tip / okolje | n. v. (m) | Parametri in obdobja |
|---|---|---|---|---|
| SI0003A | LJ Bežigrad | background/urban | 299 | NO2 urno 2013–2026; O3 urno 2013–2026; PM10 dnevno 2013–2025; PM10 urno 2026; PM2.5 dnevno 2018–2025; PM2.5 urno 2026 |
| SI0072A | LJ Celovška | traffic/urban | 305 | NO2 urno 2021–2026; PM10 dnevno 2020–2025; PM10 urno 2026; PM2.5 urno 2022–2026 |
| SI0075A | LJ Vič | background/urban | 293 | PM10 dnevno 2021–2023; PM10 urno 2023–2026; PM2.5 urno 2022–2026 |
| SI0058A | LJ Biotehniška (zaprta 2021) | background/urban | 297 | PM10 dnevno 2013–2020; PM2.5 dnevno 2013–2017 |
| SI0062A | LJ Center (MOL/EIMV) | traffic/urban | 299 | PM10 dnevno 2017–2020 |
| SI0060A | Kranj (do 2021) | background/urban | 391 | PM10 dnevno 2013–2021 |
| SI0073A | Kranj | background/urban | 388 | PM10 dnevno 2021–2025; PM10 urno 2026; PM2.5 urno 2022–2026 |
| SI0008R | Iskrba (podeželsko ozadje) | background/rural | 540 | NO2 dnevno 2013–14, urno 2015–2026; O3 urno 2013–2026; PM10 dnevno 2013–2025, urno 2026; PM2.5 dnevno 2013–2025, urno 2026 |
| SI0032R | Krvavec (višinska) | background/rural | 1740 | O3 urno 2013–2026 |
| SI0036A | Zagorje | traffic/urban | 241 | NO2 urno 2013–2026; O3 urno 2013–2026; PM10 dnevno 2013–2025, urno 2026; PM2.5 urno 2022–2026 |
| SI0037A | Hrastnik | background/urban | 290 | O3 urno 2013–2019; PM10 dnevno 2013–2025, urno 2026; PM2.5 urno 2022–2026 |
| SI0054A | Trbovlje (do 2021) | background/suburban | 250 | NO2, O3 urno 2013–2021; PM10 dnevno 2013–2021 |
| SI0074A | Trbovlje | background/suburban | 284 | PM10 dnevno 2021–2024, urno 2024–2026; PM2.5 urno 2022–2026 |

Postaja Brezje pri Grosupljem (ARSO E805) v EEA ni; njene meritve so samo v živem feedu ARSO.

### Stolpci (vse datoteke CSV)

| Stolpec | Pomen |
|---|---|
| `time_utc` | začetek intervala v UTC, ISO 8601 (`2025-01-15T20:00:00Z`); pri dnevnih vrednostih dan (`T00:00:00Z`) |
| `station_code` | koda EEA (EoI), npr. SI0003A |
| `station_name` | ime postaje (po ARSO) |
| `lat`, `lon` | WGS84 (EPSG:4326) |
| `pollutant` | PM10, PM2.5, NO2, O3 |
| `aggregation` | `hour` (urno povprečje), `day` (dnevno povprečje), `var` (spremenljivo, le nekaj nizov 2020) |
| `value` | koncentracija v **µg/m³** (vse enote so µg/m³); prazno, če meritve ni ali ni veljavna |
| `validity` | EEA: 1 veljavno, 2 veljavno pod mejo zaznave, 3 veljavno pod mejo zaznave (vrednost = MZ/2), 4 veljavno (tekoči tok), −1 neveljavno, −99 neveljavno zaradi vzdrževanja; pri −1/−99 je `value` prazen |
| `verification` | 1 verificirano, 2 predhodno verificirano, 3 neverificirano |

Vrednosti, ki jih je EEA označil z −999 (manjka), so prazne. Majhne negativne vrednosti (do −4 µg/m³, predvsem NO2 Iskrba, O3) so merilni šum pod mejo zaznave in so ohranjene z `validity` 2.

### Opozorila

- Urne datoteke vsebujejo majhne negativne vrednosti NO2 in O3 (do −4,3 µg/m³); skoraj vse imajo `validity = 2` (veljavno, pod mejo zaznave), 373 vrstic v UTD 2026 pa `validity = 1`. Pri analizi jih obravnavajte kot 0 ali izločite. Urne vrednosti 2013–2019 imajo 6 % manjkajočih.

- 2026 (`eea_si_utd_2026.csv`) je nevalidiran tok; vrednosti se lahko še spremenijo. Pri Bežigradu so to isti merilniki kot v datoteki ARSO.
- Dnevna povprečja PM so gravimetrična (filter, tehtanje), urna so iz samodejnih merilnikov; razlike nekaj µg/m³ so normalne.
- Urne vrednosti za Zasavje in Kranj za PM2.5 obstajajo šele od 2022.
- Postaje SI0054A, SI0058A, SI0060A, SI0062A so zaprte; nasledniki so SI0074A, SI0075A, SI0073A.

### Primer branja

```python
import pandas as pd
day = pd.read_csv("eea_si_validirano_dnevno_2013_2025.csv", parse_dates=["time_utc"])
bez = day[(day.station_code == "SI0003A") & (day.pollutant == "PM10")].set_index("time_utc").value
print(bez.resample("YE").apply(lambda s: (s > 50).sum()))   # dnevi nad 50 µg/m³ po letih

h = pd.concat(pd.read_csv(f, parse_dates=["time_utc"]) for f in
              ["eea_si_validirano_urno_2020_2025.csv.gz", "eea_si_utd_2026.csv"])
no2 = h[(h.pollutant == "NO2") & (h.station_code == "SI0072A")]
print(no2.groupby(no2.time_utc.dt.hour).value.mean())        # dnevni hod NO2 na Celovški
```

## PurpleAir: urne meritve treh občanskih naprav v Ljubljanski kotlini (2021–2026)

**Vir:** PurpleAir API (https://api.purpleair.com, končna točka `sensors/{id}/history`, `average=60`), prenos 17. 11. 2026 s skripto `skripte/paket/purpleair_lj.py` (brezplačni ključ READ, ni v paketu). **Licenca:** podatki lastnikov naprav, objavljeni prek PurpleAir; za nekomercialno rabo z navedbo "Vir: PurpleAir" (glej PurpleAir Terms of Service). **Vrsta:** meritev občanskega senzorja, nekalibrirana.

Naprave PA-II (senzor Plantower PMS5003, dva neodvisna kanala A in B, vlaga, temperatura, tlak). Vse tri so zunanje.

### Datoteke

- `purpleair_lj_urno.csv` – 74.769 vrstic (ena vrstica = naprava × ura), 5 MB.
- `purpleair_lj_naprave.geojson` – tri točke z metapodatki.

| sensor_index | ime | lokacija | nadm. v. | podatki od | do | ur |
|---|---|---|---|---|---|---|
| 96479 | OBELISK | vzhodna Ljubljana (Polje/Zalog), 46,0576 N 14,5844 E | 281 m | 28. 1. 2023 | 17. 11. 2026 | 32.915 |
| 126385 | Ljubljana Vič | 46,0440 N 14,4666 E, 1,8 km Z od postaje ARSO Vič | 314 m | 19. 12. 2021 | 17. 11. 2026 | 35.306 |
| 298869 | Goričica | južni rob kotline, 45,9502 N 14,3800 E | 299 m | 9. 2. 2026 | 17. 11. 2026 | 6.548 |

Luknje v nizih (OBELISK pred 2023, Goričica pred februarjem 2026) pomenijo, da naprava ni oddajala.

### Stolpci

| Stolpec | Pomen |
|---|---|
| `time_utc` | začetek urnega intervala, UTC |
| `sensor_index`, `name`, `lat`, `lon`, `alt_m` | naprava (nadmorska višina preračunana iz čevljev) |
| `pm1_atm`, `pm25_atm`, `pm10_atm` | PM1, PM2.5, PM10 v µg/m³, povprečje kanalov A in B, tovarniška pretvorba "ATM" (za zunanji zrak) |
| `pm25_atm_a`, `pm25_atm_b` | PM2.5 po kanalih; velika razlika med njima pomeni okvaro ali umazanijo (naprava Vič ima `confidence` 71) |
| `pm25_cf1` | PM2.5 s pretvorbo "CF=1"; to je vhod za korekcijo US EPA (glej spodaj) |
| `humidity_pct`, `temperature_c`, `pressure_hpa` | notranji senzor naprave (BME280); **vlaga je zaradi segrevanja v ohišju sistematično prenizka** (tu največ 91 %, povprečje 46 %) in ne odraža megle; za korekcijo uporabite vlago ARSO (`03_vreme_inverzija/arso_meteo_30min_lj_bezigrad_...`) ali ERA5 |

### Primerjava z uradno postajo ARSO Vič (E404), urni PM2.5, naprava 126385

| zima (nov–mar) | n ur | korelacija r | mediana PurpleAir ATM / ARSO | mediana CF1 / ARSO |
|---|---|---|---|---|
| 2022/23 | 3.615 | 0,81 | 1,23 | 1,38 |
| 2023/24 | 2.439 | 0,81 | 1,19 | 1,35 |
| 2024/25 | 3.623 | 0,87 | 0,92 | 1,02 |
| 2025/26 (do 31. 10. 2026 pri ARSO) | 2.376 | 0,86 | 0,86 | 0,92 |

Časovni potek se dobro ujema, absolutna raven pa se med zimami razlikuje do 40 odstotkov (od 1,23 do 0,86) (umazanija senzorja, menjava, mikrolokacija). Zato naprave ne uporabljajte kot "pravo vrednost", ampak jo umerite na bližnjo postajo ARSO za obdobje, ki ga analizirate.

### Korekcija

Standardna korekcija US EPA za PurpleAir (Barkjohn et al. 2021, *Atmos. Meas. Tech.* 14, 4617): `PM2.5 = 0,524 · pm25_cf1 − 0,0862 · RH + 5,75`, kjer je RH relativna vlaga v %. Z notranjo vlago naprave formula podceni vpliv megle; v kotlini uporabite zunanjo vlago ARSO. Enostavnejša možnost je linearno umerjanje na ARSO Vič po zimah.

### Primer branja

```python
import pandas as pd
pa = pd.read_csv("purpleair_lj_urno.csv", parse_dates=["time_utc"], low_memory=False)
arso = pd.read_csv("arso_lj_pm_urno_2016_2026.csv.gz", parse_dates=["time_utc"])
vic = arso[arso.station_code == "E404"][["time_utc", "pm25"]]
m = pa[pa.sensor_index == 126385].merge(vic, on="time_utc", suffixes=("_pa", "_arso"))
print(m[["pm25_atm", "pm25"]].corr())
```

## Sensor.Community (Luftdaten): občanski senzorji PM v Ljubljani

**Vrsta podatkov: meritev (nizkocenovni optični senzorji, nekalibrirani).** Ne zamenjujte z uradnimi meritvami ARSO.

Arhiv vseh senzorjev prašnih delcev omrežja Sensor.Community, ki so v zadnjih treh kurilnih sezonah in letošnji jeseni oddajali iz Ljubljanske kotline, skupaj z meritvami vlage, temperature in tlaka iz senzorja na isti napravi. Zajeto **17. 11. 2026** s skripto `skripte/paket/sensor_community_lj.py`.

### Vir in licenca

- Arhiv: `https://archive.sensor.community/YYYY-MM-DD/` (tekoče leto, `.csv`) in `https://archive.sensor.community/YYYY/YYYY-MM-DD/` (pretekla leta, `.csv.gz`). Ena datoteka na senzor in dan: `YYYY-MM-DD_<tip>_sensor_<id>.csv`.
- Živi API (zadnjih 5 min, za čas hekatona): `https://data.sensor.community/airrohr/v1/filter/box=45.95,14.35,46.15,14.70`
- Licenca: **ODbL 1.0** (Open Database License). Pri objavi navedite "Vir: Sensor.Community (sensor.community), ODbL". Izpeljane baze podatkov morajo ostati pod ODbL.

### Kako so bile naprave najdene

Seznam je **popoln** za štiri referenčne dni. Za vsakega smo pregledali glave vseh PM datotek v dnevnem indeksu arhiva in vzeli lat/lon iz prve vrstice (HTTP Range, 600 bajtov). Brez napak so bile pregledane vse datoteke:

| Dan | PM datotek v svetovnem arhivu | Zadetkov v kotlini |
|---|---|---|
| 15. 1. 2024 | 12.705 | 8 |
| 15. 1. 2025 | 11.659 | 9 |
| 15. 1. 2026 | 10.710 | 8 |
| 10. 11. 2026 | 9.901 | 6 |

Pregledu smo dodali še živi API na dan 17. 11. 2026. Območje je bbox 45,95–46,15 N, 14,35–14,70 E. Vse najdene naprave so v Ljubljani, zunaj mesta v kotlini ni nobene. Senzor, ki je oddajal samo med referenčnimi dnevi, bi lahko ostal neopažen.

Senzor vlage na isti napravi smo poiskali med datotekami z ID-jem ±3 od PM senzorja, ki imajo enake koordinate. Pri vseh osmih najdenih je to PM id + 1. Naprave 74650 in 75285 senzorja vlage nimajo.

### Naprave

Vse naprave so tipa SDS011 (Nova Fitness). Koordinate je lastnik vnesel sam in jih arhiv zaokroži na 3 decimalke (~100 m). Med obdobji se nobena naprava ni premaknila.

| PM id | Lokacija (približno) | lat, lon | Senzor vlage | Dni 23/24 | 24/25 | 25/26 | jesen 26 | Opomba |
|---|---|---|---|---|---|---|---|---|
| 9821 | Vič / Rožna dolina | 46.042, 14.472 | 9822 BME280 | 152 | 149 | 151 | 47 | najbližji ARSO Vič (1,4 km) |
| 14576 | Šiška | 46.072, 14.470 | 14577 DHT22 | 0 | 149 | 0 | 0 | samo zima 2024/25 |
| 21901 | Moste / Polje | 46.038, 14.612 | 21902 BME280 | 110 | 107 | 96 | 37 | **okvara od 9. 11. 2026** (glej `flag`) |
| 44606 | Šiška | 46.072, 14.474 | 44607 DHT22 | 136 | 108 | 147 | 47 | meri ~4-krat manj od ARSO |
| 56181 | Center / Tabor | 46.052, 14.544 | 56182 BME280 | 119 | 140 | 74 | 0 | zadnji dan 19. 3. 2026 |
| 64688 | Celovška / Šiška | 46.070, 14.492 | 64689 DHT22 | 152 | 149 | 151 | 47 | 0,4 km od ARSO Celovška; DHT22 skoraj vedno 99,9 % |
| 67867 | Dravlje / Šentvid | 46.096, 14.470 | 67868 SHT31 | 152 | 149 | 151 | 28 | zadnji dan 28. 10. 2026 |
| 74650 | Fužine | 46.042, 14.592 | ni | 152 | 149 | 150 | 47 | brez senzorja vlage |
| 75285 | Bežigrad / Center | 46.064, 14.532 | ni | 152 | 131 | 28 | 0 | zadnji dan 20. 3. 2026 |
| 74152 | (notranji) | 46.070, 14.492 | 74153 DHT22 | 150 | 149 | 151 | 47 | **notranji senzor, ni v CSV**, samo v geojson |

Polne sezone imajo 152 dni (2023/24), 151 dni (2024/25, 2025/26) in 47 dni za jesen 2026 (1. 10.–16. 11.). Imena četrti so približna, določena iz koordinat.

### Datoteke

| Datoteka | Obseg | Velikost |
|---|---|---|
| `sensor_community_lj_urno_2023_2026.csv` | 79.607 vrstic (naprava × ura), 9 zunanjih naprav, 1. 11. 2023 – 16. 11. 2026, samo obdobja spodaj | 6,8 MB |
| `sensor_community_lj_surovo_2025_26.csv.gz` | 504.983 posamičnih meritev (~2,5 min), 1. 11. 2025 – 31. 3. 2026 | 41 MB |
| `sensor_community_lj_surovo_2026_27.csv` | 141.473 posamičnih meritev, 1. 10. – 16. 11. 2026 | 11,5 MB |
| `sensor_community_lj_naprave.geojson` | 10 točk (vključno z notranjim senzorjem) | 8 KB |

Obdobja: 1. 11. 2023 – 31. 3. 2024, 1. 11. 2024 – 31. 3. 2025, 1. 11. 2025 – 31. 3. 2026 in 1. 10. 2026 – 16. 11. 2026. Poletij ni.

**Surove meritve so samo za zadnjo zimo in tekočo jesen.** Surove meritve vseh štirih sezon bi skupaj zavzele ~148 MB (2023/24: 47 MB, 2024/25: 48 MB), kar je več od dogovorjene meje ~100 MB. Starejše surove datoteke ustvarite z `py -I skripte/paket/sensor_community_lj.py build --surovo-vse`. Prenesene dnevne datoteke ostanejo v predpomnilniku, zato ukaz ne prenaša ničesar znova.

### Stolpci

#### `sensor_community_lj_urno_2023_2026.csv` (urna povprečja)

| Stolpec | Pomen | Enota |
|---|---|---|
| `time_utc` | začetek ure, ISO 8601 (`2026-01-15T20:00:00Z`) | UTC |
| `sensor_id` | ID PM senzorja v Sensor.Community | |
| `sensor_type` | tip PM senzorja (`sds011`) | |
| `location_id` | ID lokacije v Sensor.Community (ostane enak, če lastnik zamenja senzor) | |
| `lat`, `lon` | koordinate naprave, WGS84, zaokrožene na 0,001° | ° |
| `pm10` | PM10, povprečje meritev v uri (izvorni stolpec `P1`) | µg/m³ |
| `pm25` | PM2.5, povprečje meritev v uri (izvorni stolpec `P2`) | µg/m³ |
| `n_meritev` | število meritev PM2.5 v uri (polna ura ≈ 24) | |
| `humidity_pct` | relativna vlaga iz senzorja vlage na napravi, urno povprečje | % |
| `temperature_c` | temperatura iz istega senzorja | °C |
| `pressure_hpa` | zračni tlak na višini naprave (samo BME280) | hPa |
| `humidity_sensor_id` | ID senzorja vlage; prazno, če ga naprava nima | |
| `flag` | `okvara`: urni PM2.5 > 300 µg/m³ vsaj 6 zaporednih ur (sumljiva okvara); prazno = brez oznake | |

#### `sensor_community_lj_surovo_<sezona>.csv` (posamične meritve)

Stolpci so enaki kot v urni datoteki, le brez `n_meritev`. `time_utc` je trenutek meritve s sekundami. Vlaga, temperatura in tlak so pripisani iz paketa iste naprave, ki je prišel največ 60 s narazen.

#### `sensor_community_lj_naprave.geojson`

Točke so v WGS84. Vsaka ima te lastnosti: `sensor_id`, `sensor_type`, `lat`, `lon`, `indoor`, `humidity_sensor_id`, `humidity_sensor_type`, `prvi_dan`, `zadnji_dan`, `dni_z_meritvami` (v obdobjih zgoraj), `dni_2023_24`, `dni_2024_25`, `dni_2025_26`, `dni_2026_27`, `lokacije` (vse različne koordinate v podatkih) in `najden_na` (referenčni dnevi, na katere je bil senzor najden).

#### Čiščenje

- Vrednosti PM < 0 in ≥ 999 µg/m³ (nasičenje SDS011) so izbrisane.
- Vlaga zunaj 0–100 %, temperatura zunaj −40–60 °C in tlak zunaj 850–1100 hPa so izbrisani.
- Podvojeni časovni žigi so odstranjeni.
- Vse drugo je ohranjeno, tudi očitne okvare. Te so samo označene v `flag`.

### Opozorila

- **SDS011 ni referenčni merilnik.** Optično šteje delce in iz tega oceni maso. Pri visoki vlagi delci vpijejo vodo in se povečajo, zato bi moral senzor v megli precenjevati, saj kapljice šteje kot delce. V naši primerjavi senzor 9821 relativno res naraste v megli (razmerje do ARSO 0,74 pri RH < 80 % in 0,91 pri RH ≥ 95 %). V absolutnem smislu pa ljubljanski senzorji pozimi 2025/26 v povprečju **podcenjujejo** (glej primerjavo spodaj).
- **Absolutnih vrednosti ne primerjajte neposredno z ARSO ali z mejnimi vrednostmi** (npr. 50 µg/m³ za PM10). Uporabljajte jih za časovni potek, relativne razlike med soseskami in večerne vrhove, ali pa jih prej kalibrirajte proti ARSO.
- **Med napravami so velike razlike v občutljivosti.** 44606 meri ~4-krat manj od ARSO Vič, čeprav je korelacija dobra (r = 0,85). Vzrok je verjetno postavitev, zamašena cev ali star laser. Vsako napravo kalibrirajte posebej.
- **Postavitev ni znana**: višina, zaklon, bližina kurišča ali ceste. Koordinate so ročni vnos lastnika, natančne na ~100 m.
- **Senzorji vlage so v ohišju.** Lastna toplota naprave segreva BME280, zato kaže manj od zunanje vlage (9821: mediana 68 %, ARSO pa je pozimi > 80 % v 70 % ur). DHT22 se pogosto nasiči in skoraj vedno kaže 99,9–100 % (64689: mediana 99,9 %). Za korekcijo vlage je zato bolje uporabiti zunanjo vlago ARSO (`03_vreme_inverzija/arso_meteo_30min_lj_vic_2016_2026.csv.gz`, `rh_pct`).
- **Okvare**: 21901 od 9. 11. 2026 ~09 UTC kaže 600–800 µg/m³ PM2.5, ko drugi senzorji kažejo ~10 µg/m³. Te ure (185) imajo `flag = okvara`. Ista napaka se med hekatonom lahko pokaže v živem API-ju, zato jo filtrirajte tudi tam.
- **Menjave in prekinitve**: naprave izpadajo za dneve ali tedne, glej število dni v tabeli. 14576 je oddajal samo pozimi 2024/25, 56181 in 75285 sta utihnila marca 2026. Lastnik lahko zamenja senzor in s tem dobi nov `sensor_id` pri istem `location_id`.
- Pokritost je **9 zunanjih točk, vse v Ljubljani**. To zadošča za primerjavo sosesk in časovne vzorce, ne pa za prostorsko karto kotline.

### Primerjava z ARSO (zima 2025/26, izmerjeno)

Primerjali smo urni PM2.5 senzorjev z ARSO (`arso_lj_pm_urno_2016_2026.csv.gz`, `pm25`) za ure, ki imajo pri obeh vrednost. Obdobje je 1. 11. 2025 – 31. 3. 2026. Upoštevane so samo ure z vsaj 12 meritvami senzorja in brez `flag`. "Razmerje" je povprečje senzorja, deljeno s povprečjem ARSO. Vlago smo razvrstili na dva načina: po senzorju vlage na napravi in po zunanji vlagi ARSO Ljubljana Vič.

**Najbližji senzor ARSO Vič (E404): 9821, oddaljen 1,4 km**

| Razred | Ur | r (Pearson) | Razmerje SC/ARSO | Povprečje SC | Povprečje ARSO |
|---|---|---|---|---|---|
| vse ure | 3.619 | 0,87 | 0,83 | 15,2 | 18,4 |
| RH senzorja < 80 % | 3.458 | 0,87 | 0,82 | 15,0 | 18,4 |
| RH senzorja ≥ 80 % | 161 | 0,94 | 1,02 | 18,5 | 18,2 |
| RH ARSO Vič < 80 % | 1.110 | 0,90 | 0,74 | 11,2 | 15,1 |
| RH ARSO Vič ≥ 80 % | 2.509 | 0,86 | 0,85 | 16,9 | 19,8 |
| RH ARSO Vič ≥ 95 % (megla) | 941 | 0,82 | 0,91 | 17,7 | 19,4 |

**Druga dva senzorja ob ARSO Vič**

| Senzor | Razdalja | r vse ure | Razmerje vse ure | r / razmerje pri RH ARSO < 80 % | r / razmerje pri RH ARSO ≥ 80 % |
|---|---|---|---|---|---|
| 64688 | 3,6 km | 0,64 | 0,63 | 0,53 / 0,71 | 0,70 / 0,60 |
| 44606 | 4,0 km | 0,85 | 0,26 | 0,89 / 0,23 | 0,83 / 0,27 |

**ARSO Celovška (E405) proti 64688, oddaljenemu 0,4 km**: r = 0,71, razmerje 0,65. Pri RH ARSO < 80 % je r = 0,54 (razmerje 0,69), pri RH ≥ 80 % pa r = 0,80 (razmerje 0,63). Pri senzorjih 64688 in 44606 vlaga na napravi ni uporabna za razvrščanje, ker je 64689 vedno nasičen.

Ugotovitve:

- Časovni potek se z ARSO dobro ujema (r = 0,85–0,90 pri 9821 in 44606). Absolutna raven pa je od naprave do naprave različna (razmerja 0,26–0,85).
- Pri 9821 je največja korelacija pri zamiku 1 ure: ura `t` senzorja proti uri `t+1` ARSO (r = 0,887 namesto 0,871). Vzrok je lahko zakasnitev merilnika ARSO ali označevanje ure. Pri natančnih analizah to preverite.
- Z naraščajočo zunanjo vlago razmerje do ARSO raste (0,74 → 0,85 → 0,91). To je pričakovani učinek vlage, vendar je pri teh napravah premajhen, da bi senzor prešel v precenjevanje.
- Korekcija Crilley et al. (2018) s κ = 0,38 v tej obliki **poslabša** ujemanje: razmerje pade na 0,2–0,5. Formula predpostavlja, da senzor brez korekcije meri pravilno, tu pa senzor že sam podcenjuje. Uporabite jo skupaj s kalibracijskim faktorjem, prilagojenim na ARSO (glej spodaj).

Številke ponovno izračunate z `py -I skripte/paket/sensor_community_lj.py compare`. Rezultat se zapiše v JSON v scratchpad.

### Predlog korekcije vlage

Rast delcev zaradi vlage opisuje kappa-Köhlerjeva teorija (Crilley et al., 2018, *Atmos. Meas. Tech.* 11, 709–720, doi:10.5194/amt-11-709-2018):

```
PM_korigiran = PM_surov / C,   C = 1 + (κ / 1,65) / (1 / a_w − 1),   a_w = RH / 100
```

κ ≈ 0,38 je vrednost za mešanico anorganskih in organskih aerosolov. RH omejite na ≤ 95 %, ker pri višji vlagi C eksplodira. Priporočamo naslednji postopek:

1. Za RH vzemite zunanjo vlago ARSO (Vič ali Bežigrad), ne senzorja na napravi.
2. Za vsako napravo posebej prilagodite na ARSO (zima 2025/26) linearni model `pm25_arso ~ a · pm25_sc / C(RH) + b` ali preprosto regresijo `pm25_arso ~ pm25_sc · (1 + c · RH²/(100 − RH))`. Druga možnost je empirična korekcija za SDS011, npr. Barkjohn et al. (2021, *AMT* 14, 4617) za PurpleAir.
3. Model preverite na zimi 2024/25, ki je niste uporabili za prilagajanje.

To je lep mini izziv za ekipe.

### Primer branja

```python
import pandas as pd

h = pd.read_csv("sensor_community_lj_urno_2023_2026.csv", parse_dates=["time_utc"], dtype={"flag": str})
h = h[h["flag"].isna()]                         # brez označenih okvar
vic = h[h.sensor_id == 9821].set_index("time_utc")

arso = pd.read_csv("arso_lj_pm_urno_2016_2026.csv.gz", parse_dates=["time_utc"], low_memory=False)
arso_vic = arso[arso.station_code == "E404"].set_index("time_utc").pm25

m = vic[["pm25", "humidity_pct"]].join(arso_vic.rename("pm25_arso"), how="inner").dropna()
print(m.pm25.corr(m.pm25_arso), m.pm25.mean() / m.pm25_arso.mean())

# večerni vrh po soseskah (lokalni čas)
h["ura_lokalno"] = h.time_utc.dt.tz_convert("Europe/Ljubljana").dt.hour
h.pivot_table(index="ura_lokalno", columns="sensor_id", values="pm25", aggfunc="median")

naprave = pd.json_normalize(pd.read_json("sensor_community_lj_naprave.geojson")["features"])
```

### Ponovitev

```
py -I skripte/paket/sensor_community_lj.py            # scan, download, build, compare
py -I skripte/paket/sensor_community_lj.py download build   # samo dopolni nove dni
```

Skripta je idempotentna. Indeksi, pregledi glav, dnevne datoteke in seznam 404 so shranjeni v scratchpad (`paket_dl/sensor_community/`), zato se ob ponovnem zagonu prenesejo samo manjkajoči dnevi. `--force` vse ponovi. Odgovor 404 pomeni, da senzor tisti dan ni oddajal. V prenosu je bilo 7.386 dnevnih datotek in 1.632 odgovorov 404.

## Umerjanje občanskih senzorjev na ARSO (OCENA)

**Datoteki:** `senzorji_umerjanje_koeficienti.csv` (naprava × sezona × onesnaževalo × metoda: koeficienti in mere ujemanja) in `senzorji_umerjeno_urno.csv.gz` (urne vrednosti vseh 12 naprav po umerjanju; **to je ocena, ne meritev**). Skripta: `skripte/paket/senzorji_umerjanje.py`.

**Metoda.** Za vsako napravo je referenca najbližja postaja ARSO (razdalja v stolpcu `distance_km`). Primerjane so ure, ko imata obe veljavno vrednost (brez ur z oznako `flag`, brez ur z manj kot 6 meritvami). Metode: (a) razmerje median, (b) linearna regresija `ARSO = a·senzor + b`, (c) linearna z zunanjo vlago ARSO Bežigrad `ARSO = a·senzor + c·RH + b`, (d) razmerje po razredih vlage (< 70, 70–90, ≥ 90 %), (e) pri PurpleAir korekcija US EPA (Barkjohn 2021) iz `pm25_cf1`. Sezone: 2023/24, 2024/25, 2025/26 (nov–mar) in `vse` (vse razpoložljive ure). V `senzorji_umerjeno_urno.csv.gz` je uporabljena metoda (c) s koeficienti sezone `vse`; kjer vlage ni, metoda (b). Naprave z r < 0,6 ali manj kot 500 skupnimi urami imajo `pm25_cal` prazen in `cal_note = nezanesljivo`. Negativne vrednosti so porezane na 0.

**Rezultat (PM2.5, sezona `vse`, metoda c):**

| Naprava | Vir | Postaja ARSO | Razdalja | n ur | r | mediana senzor/ARSO | RMSE pred | RMSE po | a | c (na % RH) | b |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 44606 | Sensor.Community | Celovška | 1,0 km | 8.720 | 0,89 | 0,29 | 16,8 | 6,0 | 3,37 | −0,086 | 8,0 |
| 14576 | Sensor.Community | Celovška | 1,3 km | 3.443 | 0,89 | 0,57 | 10,4 | 6,4 | 1,36 | −0,055 | 7,9 |
| 56181 | Sensor.Community | Bežigrad | 2,8 km | 6.910 | 0,88 | 0,58 | 12,5 | 7,4 | 1,59 | −0,108 | 10,0 |
| 9821 | Sensor.Community | Vič | 1,4 km | 11.370 | 0,86 | 0,81 | 9,6 | 8,2 | 1,14 | −0,039 | 5,5 |
| 67867 | Sensor.Community | Celovška | 3,0 km | 11.286 | 0,75 | 0,41 | 15,7 | 9,4 | 1,67 | −0,022 | 8,5 |
| 64688 | Sensor.Community | Celovška | 0,4 km | 11.427 | 0,70 | 0,59 | 12,6 | 10,1 | 1,13 | +0,080 | −0,6 |
| 74650 | Sensor.Community | Bežigrad | 6,7 km | 11.173 | 0,70 | 0,39 | 17,1 | 10,5 | 2,06 | +0,064 | −0,7 |
| 21901 | Sensor.Community | Bežigrad | 8,3 km | 7.661 | 0,64 | 0,46 | 14,7 | 10,8 | 1,00 | +0,101 | 1,8 |
| 75285 | Sensor.Community | Bežigrad | 1,5 km | 4.088 | 0,42 | 0,20 | 22,2 | 14,0 | nezanesljivo | | |
| 126385 Vič | PurpleAir | Vič | 1,9 km | 34.887 | 0,85 | 0,82 | 7,8 | 7,5 | 0,85 | −0,015 | 3,6 |
| 96479 OBELISK | PurpleAir | Bežigrad | 5,6 km | 32.245 | 0,88 | 1,62 | 13,3 | 5,5 | 0,58 | −0,040 | 3,3 |
| 298869 Goričica | PurpleAir | Vič | 12,9 km | 6.146 | 0,10 | 1,97 | 79,3 | 6,6 | nezanesljivo | | |

Povprečje RMSE po napravah (PM2.5, `vse`): pred umerjanjem 19,3; (a) razmerje 12,3; (b) linearna 8,6; (c) linearna + vlaga 8,5; (d) razredi vlage 12,5; (e) US EPA 26,1.

**Kaj to pomeni.**
- Linearno umerjanje (b) odpravi večino napake; vlaga (c) doda le malo, ker SDS011 v Ljubljani pozimi uradne vrednosti *podcenjuje* in se z vlago razmerje k 1 približuje, ne oddaljuje. Korekcije po literaturi (Crilley κ, US EPA) ujemanje poslabšajo, ker predpostavljajo precenjevanje v vlagi. Verjetni razlogi: nizek pretok ventilatorja SDS011, postavitev v zavetju, zelo fini delci kurišč (del mase pod zaznavo senzorja).
- Mikrolokacija omeji ujemanje: senzor 44606 ima odlično korelacijo (0,89), a kaže le 29 % vrednosti Celovške, ki je prometna postaja. Senzor 64688 je 400 m od Celovške in se ujema slabše (0,70) kot 9821, ki je 1,4 km od Viča. Umerjanje popravi raven, ne pa lokalnih razlik, ki so ravno tisto, kar občanski senzorji dodajo.
- Koeficienti se med zimami spreminjajo (glej sezone v datoteki); za analizo ene zime uporabite koeficiente te zime.
- OBELISK (PurpleAir, vzhod) kaže 1,6-krat več kot Bežigrad, kar je lahko realna razlika med Polj­em in centrom, ne napaka; umerjanje na 5,6 km oddaljeno postajo tega ne more ločiti.

**Stolpci `senzorji_umerjeno_urno.csv.gz`:** `source`, `sensor_id`, `sensor_type`, `lat`, `lon`, `time_utc`, `pm25`, `pm10` (surovo), `pm25_cal`, `pm10_cal` (ocena), `pm25_cal_r`, `pm25_cal_n` (kakovost prileganja), `pm25_cal_note`, `cal_station`, `cal_distance_km`, `cal_method`, `rh_arso_bezigrad`.

```python
import pandas as pd
cal = pd.read_csv("senzorji_umerjeno_urno.csv.gz", parse_dates=["time_utc"], dtype={"pm25_cal_note": str, "pm10_cal_note": str})
ok = cal[cal.pm25_cal_note.isna()]                      # samo zanesljive naprave
koef = pd.read_csv("senzorji_umerjanje_koeficienti.csv")
koef[(koef.pollutant == "pm25") & (koef.season == "2025/26") & (koef.method == "b_linearna")]
```
