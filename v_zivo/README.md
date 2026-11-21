# Podatki v živo (med hekatonom)

Vse spodaj deluje brez ključa in brez registracije. `zrak_v_zivo.py` je preverjen primer, ki vse troje združi v pandas (`py zrak_v_zivo.py`; potrebuje samo `pip install pandas requests`, celoten seznam za zvezke je v `../requirements.txt`). `zajem_arso_xml.py` potrebuje samo standardno knjižnico.

| Vir | URL | Kaj vrne | Osvežitev / zamik | Opomba |
|---|---|---|---|---|
| ARSO XML feed | https://www.arso.gov.si/xml/zrak/ones_zrak_urni_podatki_zadnji.xml | zadnja ura meritev za vse postaje ARSO v Sloveniji (SO2, CO, O3, NO2, NOx, PM10, PM2.5, benzen), koordinate | ARSO obnovi ~35 min po polni uri; prevzem ob :45 | uradne meritve; čas lokalni UTC+1 brez poletnega premika; `<2` = pod mejo zaznave |
| Zajem v oblaku (ADA Hack) | https://ada-hack-zrak.live-event-recap-spike.workers.dev | `/arso/history.csv` vse zajete ure od 13. 11. 2026; `/arso/latest.xml`; `/camx/latest.json` slike napovedi CAMx | vsako uro ob :50 | rešuje, da feed ARSO vrne samo zadnjo uro; CORS odprt, klic iz brskalnika deluje |
| Open-Meteo vreme | https://api.open-meteo.com/v1/forecast?latitude=46.0655&longitude=14.5127&hourly=temperature_2m,wind_speed_10m,boundary_layer_height&timezone=UTC | urna napoved do 16 dni, tudi višina mejne plasti | vsako uro | model; brez ključa, do 10.000 klicev na dan |
| Open-Meteo kakovost zraka (CAMS) | https://air-quality-api.open-meteo.com/v1/air-quality?latitude=46.0655&longitude=14.5127&hourly=pm10,pm2_5,european_aqi&domains=cams_europe&timezone=UTC | urna napoved CAMS Europe 0,1° do 4 dni + zadnji dnevi | dnevno | model, groba ločljivost (~8 km); ne ujame lokalnih vrhov |
| ARSO modelska napoved PM10 (CAMx) | https://www.arso.gov.si/zrak/kakovost%20zraka/podatki/PM10_napoved.html | slike (gif urne animacije, png dnevna povprečja), 4,4 km; **polj v živo ni**, zgodovina polj 2023–2026 je v `02_modeli/camx/` | dnevno ~05:40 | samo kurilna sezona; shranjene kopije v zajemu v oblaku |
| Sensor.Community | https://data.sensor.community/airrohr/v1/filter/area=46.05,14.5,15 | zadnjih 5 min občanskih senzorjev v krogu 15 km | 2,5 min | 9 zunanjih naprav v Ljubljani (arhiv in umerjanje v `01_meritve/`); pozimi podcenjujejo, senzor 21901 pokvarjen |
| PurpleAir | https://api.purpleair.com (potreben brezplačen ključ) | tri zunanje naprave v kotlini (OBELISK, Ljubljana Vič, Goričica) | 2 min | arhiv in umerjanje v `01_meritve/`; ključ dobite brezplačno na develop.purpleair.com |

## Opozorila za podatke v živo

- **Sensor.Community senzor 21901** (Fužine) je od 9. 11. 2026 pokvarjen in kaže 600–800 µg/m³; v živem API-ju ga filtrirajte (id 21901), dokler lastnik naprave ne popravi. Splošno pravilo: urne vrednosti PM2.5 nad 300 µg/m³ več ur zapored so okvara.
- Občanski senzorji v Ljubljani pozimi uradne vrednosti podcenjujejo; koeficienti za umerjanje po napravah so v `01_meritve/senzorji_umerjanje_koeficienti.csv`.
- Zajem v oblaku lahko vsebuje podvojene zapise iste ure, če ARSO uro ponovno objavi; obdržite zadnjega (`drop_duplicates(["station_code","time_from_local"], keep="last")`).

## Kako združiti

Vse časovne vrste združujte po `time_utc`. ARSO podatki so v lokalnem času UTC+1 brez poletnega premika (pozimi je to isto kot CET), v skripti je pretvorba. Open-Meteo vrača UTC, če podate `timezone=UTC`.

## Če želite sami beležiti ure med hekatonom

`zajem_arso_xml.py` (v tej mapi) vsako uro shrani feed v CSV brez podvajanj; zaženite ga v cronu ali Task Schedulerju ob :50. Ni nujno: isti podatki so v zajemu v oblaku.
