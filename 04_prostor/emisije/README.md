# Emisije PM10 v Ljubljani: mala kurišča po mreži 250 m in cestni promet po odsekih (ARSO)

**Vrsta podatka: emisijski inventar (ocena), ne meritev in ne koncentracija.** Emisija pove, koliko delcev vir izpusti v zrak (kg na leto); kakšna koncentracija iz tega nastane, je odvisno od vremena in razpršitve (to računata modela GRAL v `02_modeli/gral/` in CAMx v `02_modeli/camx/`).

**Vir:** ARSO, prejeto 19. 11. 2026 za potrebe hekatona; opis ARSO je v `../../02_modeli/arso_opis_podatkov.pdf`. **Pri objavi navedite "Vir: ARSO".** Pripravljeno 20. 11. 2026 s skripto `skripte/paket/arso_emisije.py` iz izvornih datotek `M2_emisije_mreza_zdruzeno.csv` in `emisije_ceste_1A3bi_line.dat`.

## Datoteke

| Datoteka | Vsebina | Opombe |
|---|---|---|
| `emisije_kurisca_250m.gpkg` (sloj `celice`), `.geojson`, `.csv` | mreža **250 m** (72 × 84 celic, 6.048) nad Ljubljano: `pm10_kg_leto` emisija PM10 iz **malih kurišč** (stavbe), `st_stavb` število stavb v celici, `id_obmocja` območje, po katerem so emisije "zabrisane" (razdeljene), `n_celic_obmocja`, `st_stavb_obmocja`, `cs_ime` četrtna skupnost (po središču celice; prazno zunaj MOL) | GPKG v EPSG:3794, GeoJSON v WGS84; CSV ima robove celice (`x_min` … `y_max`), središče (`x_d96`, `y_d96`, `lat`, `lon`). Izvor ARSO: g/leto na celico (v paketu kg/leto), ločljivost 250 m, celice z malo stavbami združene po območjih. 2.032 celic z emisijo, skupaj **127,9 t PM10/leto**, od tega 127,4 t v MOL. |
| `emisije_ceste_odseki.gpkg` (sloj `odseki`) | **65.521 odsekov cest** (1.289 km, mediana 13 m) kot linije v EPSG:3794: `cesta_id` (16.759 cest), `pm10_kg_km_h` emisija na km ceste na uro (izvorna vrednost), `dolzina_km`, `pm10_kg_h` (odsek), `pm10_kg_leto`, `cs_ime`, celica `i`, `j` (po sredini odseka) | koda vira 1A3bi = cestni promet, osebna vozila; po ARSO "izpusti PM10 na posameznih segmentih cest v kg/h/km", izvorne koordinate UTM 33N, v paketu preslikane v D96/TM. **Glej opozorilo o enotah.** |
| `emisije_ceste_po_cesti.csv` | vsote po `cesta_id` (odsekov, dolžina, kg/h, kg/leto, povprečna kg/(km·h)) | imena cest niso priložena |
| `emisije_mreza_250m_skupaj.csv` | po celici 250 m: `kurisca_pm10_kg_leto`, `promet_pm10_kg_leto` (odseki po sredinski točki), `promet_km`, `delez_prometa` | ista mreža kot GRAL `02_modeli/gral/*_urno_250m.nc` (`i` stolpec od zahoda, `j` vrstica od juga) |
| `emisije_po_cs.csv` | po 17 četrtnih skupnostih in MOL skupaj: kurišča, stavbe, kg na stavbo, promet, km cest, deleži | |
| `M2_zemljevid_zdruzeno_PM10.png` | karta ARSO: emisije kurišč po celicah, robovi = območja "zabrisanja" | |

Mreža: `x_min` = 453.640 + 250·i, `y_min` = 90.000 + 250·j (EPSG:3794, D96/TM). **Izvorni cestni odseki so v UTM 33N (EPSG:32633)**, enako kot mreža GRAL (potrdil ARSO 20. 11. 2026); v paketu so preslikani v D96/TM (razlika med sistemoma je približno 1,5 km v smeri N in 14 m v smeri E, zato ne odštevajte 5.000.000). Inventar pokriva MOL brez najbolj vzhodnega dela.

## Kaj podatki povedo

- **Mala kurišča: 127,9 t PM10/leto**, 53.431 stavb v celicah z emisijo. Mediana 2,3 kg na stavbo na leto; po četrtnih skupnostih od 0,7 (Center) do 13 kg na stavbo (Sostro). Največ emisij imajo Sostro, Šmarna gora, Polje, Rudnik in Trnovo (po 9–13 % MOL), najmanj Moste in Center. Primerjava z EviDim (`../evidim_kurilne_naprave_obcine.csv`): 14.141 naprav na trda goriva v MOL → okoli 9 kg PM10 na napravo na leto, kar je realna vrednost za peči na drva.
- **"Zabrisano":** ARSO je emisije stavb razporedil po 135 območjih (`id_obmocja`), da posamezne stavbe niso razpoznavne. Zato 567 celic nosi emisijo brez stavb in 1.107 celic ima stavbe brez emisije (območja z daljinskim ogrevanjem ali plinom). Celica je najmanjša smiselna enota; ne pripisujte emisij posamezni stavbi.
- **Promet:** 1.290 km odsekov z emisijo PM10 na km in uro. Prostorsko so to vse glavne ceste, obvoznica in mestne vpadnice; vsote po ČS kažejo Bežigrad, Jarše, Rudnik, Vič in Center na vrhu (po km cest Rudnik, Šentvid, Bežigrad).

## Opozorila

- **Lestvica pri cestah še ni potrjena.** ARSO je potrdil enoto kg/h/km na odsek, ne pa, ali je to povprečna ali konična ura. Če je to povprečna ura leta, je vsota 170,6 kg/h oziroma **1.495 t/leto**, kar je desetkrat več kot kurišča in več, kot bi pričakovali za Ljubljano (državni inventar ARSO pripisuje cestnemu prometu nekaj sto ton PM10 na leto za vso Slovenijo). Dokler ARSO ne potrdi enote, leta in vsebine (samo izpuh ali tudi obraba zavor, pnevmatik in resuspenzija), uporabljajte cestne emisije **relativno** (kateri odseki in katere ČS so bolj obremenjeni), ne kot absolutno vrednost in ne za primerjavo s kurišči. Stolpec `pm10_kg_leto` je izračunan z množenjem z 8.760 in to predpostavko nosi s seboj.
- Leto inventarja ni navedeno; PM10 kurišč predvidoma vključuje PM2.5 (pri kuriščih okoli 90 % mase).
- Mreža pokriva 17,8 × 20,9 km (MOL brez vzhodnega dela Sostrega in roba Polja); `emisije_po_cs.csv` ima stolpec `celic`, iz katerega je vidna pokritost.
- Drugih virov (industrija, gradbišča, kmetijstvo, ozadje) v teh datotekah ni.

## Primer branja

```python
import geopandas as gpd, pandas as pd
k = gpd.read_file("emisije_kurisca_250m.gpkg", layer="celice")
c = gpd.read_file("emisije_ceste_odseki.gpkg", layer="odseki")
cs = pd.read_csv("emisije_po_cs.csv")
k.plot(column="pm10_kg_leto", legend=True)                 # karta emisij kurišč
c[c.pm10_kg_km_h > c.pm10_kg_km_h.quantile(0.9)].plot()     # 10 % najbolj obremenjenih odsekov
```

Za zvezke: `primeri/04_kje_in_koga.ipynb` (indeks izpostavljenosti) in `07_scenariji_ukrepov.ipynb` (scenariji) lahko oceno kurišč iz katastra zamenjata z `emisije_kurisca_250m`, kar je neposredno iz inventarja ARSO.
