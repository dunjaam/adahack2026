# Modelska polja GRAL (ARSO), 15 m, Ljubljana: prispevek malih kurišč h koncentraciji PM10

Lokalni disperzijski model ARSO (GRAL) za Ljubljano na mreži **15 m** (1.188 × 1.393 celic, 17,8 × 20,9 km): **koliko µg/m³ PM10 pri tleh prispevajo mala kurišča** (ogrevanje stavb) v vsaki uri enega leta. To je **model**, in to **samo prispevek enega vira**: brez regionalnega ozadja (CAMS, CAMx), brez prometa, industrije in resuspenzije. Izmerjena koncentracija je vsota vseh prispevkov in ozadja, zato vrednosti GRAL **ne primerjajte neposredno z meritvami ARSO**, ampak jih uporabite za prostorsko sliko (kje v mestu kurišča največ prispevajo), za dnevni hod prispevka in za scenarije (prispevek je linearen v emisijah).

**Vir:** ARSO, zagon `stavbe_M2_zabrisano` (emisije stavb po scenariju M2, "zabrisane" po območjih, da posamezne stavbe niso razpoznavne), prejeto 20. 11. 2026; drugi zagon `ceste_1A3bi_osebna_vozila` (promet, samo relativno) je opisan spodaj. **Pri objavi navedite "Vir: ARSO".** Surovi izvoz (8.760 ASCII mrež, 115 GB) ni v paketu; izdelki so strnjeni v enem prehodu s skripto `skripte/paket/arso_gral.py`.

## Časovna os

Izvoz ima 8.760 situacij, eno na uro **leta 2021** (`ura_leta` 1 … 8760 = zaporedna ura leta 2021; potrdil ARSO v `../arso_opis_podatkov.pdf`). V vseh datotekah so stolpci `time_utc` (začetek urnega intervala; ura 1 = 1. 1. 2021 00:00; UTC po predpostavki, ker GRAMM/GRAL teče na meteorologiji v UTC), `mesec`, `dan` in `ura`. Ker je leto znano, lahko GRAL **neposredno združite z meritvami leta 2021** (`01_meritve/arso_lj_pm_urno_2016_2026.csv.gz`: Bežigrad PM10 in PM2.5, Celovška, Vič od 2021) in z vremenom 2021 (`03_vreme/`); glej razdelek Primerjava z meritvami 2021. Emisije so inventar (scenarij M2), ne emisije leta 2021; vzorci so skladni: od junija do septembra je prispevek kurišč nič, največji je decembra in januarja.

## Datoteke

| Datoteka | Vsebina | Ločljivost |
|---|---|---|
| `gral_kurisca_statistika_15m.tif` | GeoTIFF, 8 pasov: `povprecje_leto`, `povprecje_kurilna_sezona_okt_maj`, `povprecje_januar`, `povprecje_vecer_18_23_jan_feb`, `max_urna` (vse µg/m³), `ur_nad_10`, `ur_nad_25`, `ur_nad_50` (število ur v letu) | 15 m, **EPSG:32633 (UTM 33N)** |
| `gral_kurisca_dnevni_hod_30m.nc` | NetCDF `pm10_prispevek(ura, y, x)`: povprečje po uri dneva (0–23) v kurilni sezoni | 30 m, EPSG:32633 |
| `gral_kurisca_dnevno_60m.nc` | NetCDF `pm10_prispevek(dan, y, x)`: dnevna povprečja, `dan` 1 … 365 leta 2021 z `datum`, `mesec`, `dan_v_mesecu` | 60 m, EPSG:32633 |
| `gral_kurisca_urno_250m.nc` | NetCDF `pm10_prispevek(ura_leta, y, x)`: urna povprečja celic 15 m, prebinirana po središčih na **isto mrežo 250 m kot emisije** (`04_prostor/emisije/`, D96/TM, `i` stolpec od zahoda, `j` vrstica od juga); koordinata `time_utc` | 250 m, EPSG:3794, 8.760 ur |
| `gral_kurisca_cs_urno.csv` | urno povprečje po 17 četrtnih skupnostih MOL in za MOL (stolpci po imenih ČS); `time_utc`; dve vrstici glave z `#` (vir, delež površine ČS v mreži) | |
| `gral_kurisca_tocke_urno.csv`, `gral_kurisca_tocke.csv` | urne vrednosti (`time_utc`) v celicah postaj ARSO (E403, E404, E405) in 11 občanskih senzorjev (`point_id`, `vrsta`, `lat`, `lon`, `d96_e/n`, `utm_e/n`, `row`, `col`) | 15 m |
| `gral_kurisca_obcutljive_lokacije.csv` | za 318 lokacij iz `04_prostor/osm_obcutljive_lokacije.csv`, ki ležijo v mreži: letno, sezonsko, januarsko in večerno povprečje, največja ura, ure nad 25 | 15 m |
| `gral_kurisca_mreza.json` | definicija mreže 15 m (okvir, celica, CRS) in mreže 250 m | |
| `arso_conc_map_projekcije.py` | skripta ARSO (nespremenjena): izriše poljubno mrežo ESRI ASCII (GRAL `-101.txt` v UTM 33N ali emisije `.asc` v D96/TM) na podlago OpenTopoMap; potrebuje `contextily`, `pyproj`, `matplotlib` | |
| `gral_promet_*` | iste datoteke za **osebna vozila** (izvoz `ceste_1A3bi_osebna_vozila`); **samo relativno**, glej razdelek Promet | 15 m … 250 m |

Mreža: **UTM 33N (EPSG:32633)**, `xllcorner` 453.640, `yllcorner` 5.090.000, celica 15 m, vrstica 0 na severu (`y` = 5.110.895). To ni D96/TM s premikom: isti par števil v D96/TM leži 1,5 km južneje in 14 m zahodneje (preverjeno s cestnimi odseki proti tlorisom stavb in z lego prometne postaje Celovška). Rastrske izdelke 15–60 m zato združujte z drugimi sloji paketa (D96/TM, EPSG:3794) s preslikavo (`gdf.to_crs(32633)` ali `rasterio.warp`); izdelek 250 m in vse CSV so že v D96/TM oziroma z lat/lon. Celice brez podatka v izvoru (13,7 %) so po ARSO celice, kjer je bilo premalo stavb in so bile zaradi varstva osebnih podatkov izločene (maska `maska_izbris_101.csv` pri ARSO); so NaN in se v povprečjih ne upoštevajo. Vzhodni del MOL (Sostro, del Polja) je zunaj mreže; delež pokritosti po ČS je v glavi `gral_kurisca_cs_urno.csv`.

## Kaj polja kažejo

Vse številke so **prispevek malih kurišč h PM10** (µg/m³), brez ozadja, za leto 2021 (zagon 20. 11. 2026 zvečer s pravilno georeferenco UTM 33N, 8.760 ur, 71 min; prejšnje številke z napačno lego mreže so bile 1,5 km zamaknjene in ne veljajo).

**Po mestu.** Povprečje čez vse celice MOL v mreži: leto 2,2, kurilna sezona (okt–maj) 3,2, januar 9,1 µg/m³. Mesečni potek je izrazito dvovršen: december 9,3 in januar 9,1, februar le 1,5, marec 1,3, november 1,9, oktober 0,9, od junija do septembra 0. Razlika med januarjem in februarjem je **meteorologija leta 2021** in od nje odvisen časovni profil emisij: januar 2021 je imel na Bežigradu povprečno 1,1 °C, december 1,2 °C, februar pa 5,7 °C (`03_vreme_inverzija/`). Izmerjeni PM10 na Bežigradu je bil februarja 2021 kljub temu enak januarskemu (27 µg/m³; `01_meritve/`), kar pomeni, da so februarja prevladovali drugi viri in ozadje (tudi epizode puščavskega prahu); to je dober primer, zakaj prispevka enega vira ne enačite z meritvijo.

**Dnevni hod (kurilna sezona, MOL).** Najnižje ob 2–5 h (0,2–0,8 µg/m³), skok ob 6 h (2,9), visoko 7–12 h (4,5–4,6), padec ob 13–14 h (1,2–2,1), spet visoko 15–23 h (3,8–4,7), vrh ob 16 h in 23 h. To je **profil emisij** (kurjenje zjutraj in popoldne/zvečer), ki ga model pomnoži z razmerami za razredčenje; zvečer se sešteje z nižjo mejno plastjo. Izmerjeni PM na Bežigradu ima vrh ob 21–23 h, jutranjega skoraj ne; GRAL torej samo za kurišča napove močnejše jutro, kot ga meritve kažejo za vsoto virov.

**Po četrtnih skupnostih (kurilna sezona / januar, µg/m³).** Center 7,4 / 21,4, Trnovo 7,3 / 19,1, Moste 5,1 / 15,5, Bežigrad 5,1 / 14,9, Rožnik 4,7 / 12,1, Šiška 4,7 / 12,8, Vič 4,0 / 9,9, Jarše 3,7 / 11,1, Golovec 3,5 / 10,3, Rudnik 3,0 / 8,3, Polje (75 % mreže) 2,9 / 8,8, Dravlje 2,4 / 6,3, Šentvid 2,4 / 6,6, Posavje 2,4 / 6,8, Črnuče 1,7 / 5,4, Sostro (23 %) 1,6 / 4,5, Šmarna gora 1,6 / 4,5. Največje razmerje med ČS je približno 5-kratno. **Razvrstitev po GRAL se le šibko ujema z razvrstitvijo po emisijah na km²** (`04_prostor/emisije/emisije_po_cs.csv`, Spearman 0,18): Šmarna gora in Jarše imata velike emisije na km² in majhen oziroma zmeren prispevek (razpršeno, prevetreno), Center najmanjše emisije med osrednjimi ČS in največji prispevek (gosto, nizko, slabo prevetreno); Trnovo je visoko pri obeh. Emisije povedo, *kje se kuri*, GRAL pa, *kje se to pozna v zraku*; za ukrepe sta potrebna oba pogleda (`primeri/04_kje_in_koga.ipynb`, razdelka 7 in 8).

**Po celicah 15 m.** Januarsko povprečje: mediana celic 2,4 µg/m³, 90. percentil 12,7, 99. percentil 27, največ 274 (celica ob viru); 17 % celic nad 10 in 4 % nad 20 µg/m³. Največja urna vrednost po celicah: mediana 46, 99. percentil 145, največ 1.279 µg/m³. Število ur v letu s prispevkom nad 25 µg/m³: mediana 14, 90. percentil 248, največ 3.402. Vrednosti ob virih so modelske in jih ne primerjajte z meritvami (glej Opozorila).

**Postaje in senzorji (kurilna sezona / januar / največja ura).** Bežigrad 7,3 / 21,0 / 88, Vič 9,7 / 25,8 / 137, Celovška 4,6 / 12,9 / 82. Na Viču in Bežigradu model pripiše kuriščem v januarju 21–26 µg/m³, kar je blizu celotnega izmerjenega januarskega PM10 2021 (Bežigrad 27 µg/m³); primerjava z meritvijo je v razdelku Primerjava z meritvami 2021 in je dobra naloga za ekipe. Vseh enajst občanskih senzorjev v mreži ima vrednosti (noben ne leži v izločeni celici); PurpleAir Goričica je zunaj mreže.

**Občutljive lokacije (318 v mreži).** Povprečni januarski prispevek: bolnišnice 17,4, zdravstveni domovi 16,6, šole 13,8, vrtci 13,5, domovi za starejše 8,8 µg/m³ (letno 2,5–4,6). Največ v Trnovem (Osnovna šola Trnovo, Vrtec Trnovo, DEOS Center starejših Trnovo: 32 µg/m³ januarja, 840–880 ur nad 25 µg/m³ na leto) in na Viču (Zdravstveni dom Vič-Rudnik 30 µg/m³), v `gral_kurisca_obcutljive_lokacije.csv`.

## Promet: osebna vozila (`gral_promet_*`), samo relativno

Drugi zagon ARSO (izvoz `ceste_1A3bi_osebna_vozila`, prejeto 20. 11. 2026): **prispevek izpušnih in obrabnih delcev osebnih vozil (NFR 1A3bi) h PM10**, ista mreža 15 m, istih 8.760 ur leta 2021, iste datoteke s predpono `gral_promet_` namesto `gral_kurisca_` (statistika 15 m, dnevni hod 30 m, dnevno 60 m, urno 250 m, po ČS, po postajah in senzorjih, občutljive lokacije, mreža). Pasovi in stolpci so enaki, le "kurilna sezona" za promet nima posebnega pomena. Ceste niso izločene kot stavbe, zato izvoz nima celic brez podatka.

**Absolutne vrednosti so vsaj 10-krat previsoke in jih ne uporabljajte.** Letno povprečje čez MOL samo iz osebnih vozil je 26 µg/m³ PM10, v Centru in na Bežigradu 64, v celici prometne postaje Celovška 138 (največja ura 917); izmerjeni celotni PM10 na Celovški v letu 2021 je bil 30 µg/m³ z vsemi viri vred. Isti faktor ima vsota emisij cest v `04_prostor/emisije/` (1.495 t/leto, 10-krat več kot kurišča), zato je vzrok verjetno v enotah emisijske datoteke (kg/(km·h) za konično uro namesto povprečne); vprašanje je pri ARSO. Umerjanje na meritve 2021 (razdelek spodaj) da faktor 0,03–0,2. Ker je model linearen v emisijah, je **prostorski vzorec in časovni potek pravilen, lestvica ne**: polja delite z mestnim povprečjem (relativni indeks) ali jih umerite na meritve (npr. razlika Celovška − Bežigrad kot prometni prispevek).

Kaj polja kažejo (relativno):

- Dnevni hod prometa, ne kurjenja: minimum ob 3 h (0,1 mestnega povprečja), strm vzpon ob 6 h, vrh ob 8 h (1,8-kratnik), popoldne 1,2–1,4, zvečer upad, brez poletne ničle. **Tedenski hod** je prometni: delovni dnevi 29–32 µg/m³, sobota 20, nedelja 11. Mesečno višje jeseni in pozimi (december 1,5-kratnik, januar 0,8), kar je meteorologija (nižja mejna plast), ne promet.
- Po ČS (letno povprečje, relativno na MOL = 1): Bežigrad 2,5, Center 2,5, Moste 2,1, Šiška 2,1, Jarše 2,0, Trnovo 1,5, Rožnik 1,3, Vič 1,2, Dravlje 1,1, Posavje 1,1, Golovec 0,9, Šentvid 0,9, Črnuče 0,7, Rudnik 0,7, Polje 0,6, Šmarna gora 0,4, Sostro 0,2. Obrobje (Šmarna gora, Sostro, Polje) je nizko pri obeh virih; Bežigrad, Šiška in Jarše (vpadnice, obvoznica) so pri prometu visoko in pri kuriščih srednje, Trnovo obratno.
- Po celicah je prispevek zelo koncentriran ob cestah: mediana celic 4,7, 90. percentil 47, največ 355 (letno). Postaje: Celovška (prometna postaja) 138 = 5,3-kratnik mestnega povprečja, Bežigrad 60 (2,3), Vič 45 (1,8); razmerje je pričakovano in potrjuje lego mreže (s prejšnjo, 1,5 km zamaknjeno mrežo je bilo obrnjeno).
- Občutljive lokacije (letno povprečje, relativno): zdravstveni domovi 68, bolnišnice 54, šole 44, vrtci 39, domovi za starejše 31; največ ob vpadnicah (Vrtec France Prešeren, enota Vrtača 139, Glasbena šola Franca Šturma v Zgornji Šiški 115; v `gral_promet_obcutljive_lokacije.csv`).

Branje je enako kot za kurišča (zamenjajte predpono). Za skupni lokalni prispevek obeh virov polja seštejte šele po umerjanju vsakega posebej.

## Primerjava z meritvami 2021

Ker je GRAL leto 2021, smo urne vrednosti v celicah postaj (`gral_*_tocke_urno.csv`) združili z meritvami PM10 2021 (`01_meritve/arso_lj_pm_urno_2016_2026.csv.gz`; Vič meri od maja 2021). Zima = januar–marec in oktober–december, dnevna povprečja; linearna regresija `PM10 = a + b · kurišča + c · promet`:

| Postaja | dni | PM10 izmerjeno | GRAL kurišča | GRAL promet | r (kurišča) | r (promet) | a (ozadje) | b | c | R² |
|---|---|---|---|---|---|---|---|---|---|---|
| Bežigrad (E403) | 182 | 26,0 | 9,1 | 65 | 0,30 | 0,44 | 11,2 | 0,45 | 0,17 | 0,27 |
| Vič (E404) | 92 | 29,8 | 13,1 | 62 | 0,38 | 0,54 | 13,9 | 0,24 | 0,21 | 0,33 |
| Celovška (E405) | 182 | 29,6 | 5,7 | 154 | 0,24 | 0,34 | 19,1 | 0,53 | 0,05 | 0,15 |

Kaj to pove (in kaj je naloga za ekipe):

- GRAL pojasni **15–33 % dnevne variance** zimskega PM10; preostanek je regionalno ozadje in meteorologija, ki ju lokalni model enega vira nima (ozadje `a` 11–19 µg/m³). To je pričakovano in je glavni razlog, da polj GRAL ne primerjate neposredno z meritvami.
- Koeficient `b` za kurišča je 0,25–0,5: model pripiše kuriščem v januarju 21–26 µg/m³ na Bežigradu in Viču, regresija pa jim pripiše približno polovico tega. Možni razlogi: emisije inventarja (scenarij M2) višje od dejanskih v 2021, časovni profil emisij ali kolinearnost s prometom in ozadjem. Koeficient `c` za promet (0,05–0,2) potrjuje, da je lestvica prometa vsaj 5- do 20-krat previsoka.
- **Dnevni hod se ne ujema.** Izmerjeni PM10 ima pozimi vrh ob 19–23 h (Bežigrad 32–33, Vič 39–41 µg/m³) in najnižje vrednosti ob 6 h (23–26). GRAL kurišča imajo enako visok jutranji (8–10 h) in večerni vrh, GRAL promet pa vrh 8–16 h. Jutranji vrh, ki ga model napove za oba vira, se v meritvah ne pozna (ali pa ga dvig mejne plasti izniči); večerni izmerjeni vrh se ujema s kurišči.
- Urna korelacija je šibka (0,15–0,3 za kurišča, 0,26–0,37 za promet) in je najvišja, če GRAL zamaknemo za +1 do +2 h (meritev zaostaja za modelom). To ne kaže na zamenjan časovni pas; UTC ostane predpostavka.
- Razlika **Celovška − Bežigrad** (prometna proti mestni postaji) je v letu 2021 v povprečju le 2,4 µg/m³ PM10, GRAL promet pa med celicama napove razliko 78 µg/m³; dnevni potek razlike se z modelom ne ujema (r 0,01). Za PM10 prometna postaja v 2021 torej skoraj ne izstopa; umerjanje prometa na to razliko da faktor 0,03.

Izhodišče za ekipe: zgornjo regresijo ponoviti z ozadjem (npr. CAMS za 2021 iz `02_modeli/cams_openmeteo_urno_2016_2026.csv.gz`) namesto konstante, po mesecih in po urah dneva; primerjava GRAL z občanskimi senzorji 2023–2026 ni mogoča po urah (drugo leto), je pa po dnevnem hodu in prostorsko.

## Branje

```python
import rasterio, xarray as xr, pandas as pd
with rasterio.open("gral_kurisca_statistika_15m.tif") as r:
    jan = r.read(3)                                   # januarsko povprečje, 15 m
    print(r.descriptions)
hod = xr.open_dataset("gral_kurisca_dnevni_hod_30m.nc").pm10_prispevek   # (ura, y, x)
urno = xr.open_dataset("gral_kurisca_urno_250m.nc").pm10_prispevek       # (ura_leta, y, x)
cs = pd.read_csv("gral_kurisca_cs_urno.csv", comment="#")
cs.groupby("ura")[["ČETRTNA SKUPNOST ŠIŠKA", "ČETRTNA SKUPNOST SOSTRO"]].mean()   # dnevni hod po ČS
```

Za karto s postajami in ČS glej `primeri/01_hiter_zacetek.ipynb` (karta slojev) in `04_kje_in_koga.ipynb`; GRAL dopolni indeks izpostavljenosti s prispevkom kurišč iz modela namesto ocene iz katastra.

## Opozorila

- Prispevek, ne koncentracija: za primerjavo z meritvami dodajte ozadje (npr. CAMS ali meritev na postaji brez lokalnih kurišč) in prispevke drugih virov.
- Vrednosti ob virih (do nekaj sto µg/m³ v posamezni celici in uri) so modelska posledica postavitve emisij v celice 15 m; ne razlagajte jih kot izmerjene vrednosti pred hišo.
- Emisije so "zabrisane" po območjih, zato prostorski vzorec znotraj območja ni natančnejši od območja (glej `04_prostor/emisije/README.md`).
- Mreža 15 m je v UTM 33N, ne v D96/TM: pri združevanju s sloji paketa preslikajte (razlika 1,5 km). Leto je 2021; časovni pas UTC je predpostavka (razlika do CET je ena ura; primerjava z meritvami ji ne nasprotuje).
- Scenarij emisij "M2" ARSO ni posebej pojasnil; emisije so inventar, ne emisije leta 2021.
- Promet (`gral_promet_*`) je samo relativen: absolutne vrednosti so vsaj 10-krat previsoke (glej razdelek Promet in primerjavo z meritvami).
