# Primeri: sedem zvezkov za hiter začetek

Vsak zvezek je izveden in shranjen z izhodi (berljiv tudi brez zagona), teče brez interneta (celice v živo so v try/except) v manj kot minuti in se konča z razdelkom "Kaj lahko ekipa iz tega naredi". Vsak jasno označi, kaj je **meritev**, **model** in **ocena**. Skupne funkcije za nalaganje so v `paket.py`.

| Zvezek | Namen izziva | Ciljna skupina |
|---|---|---|
| `01_hiter_zacetek.ipynb` | nalaganje, združevanje, prvi grafi, karta, umerjanje senzorja, klic v živo | vsi |
| `02_epizode_opozarjanje.ipynb` | razložiti, informirati: epizode in zgodnje opozarjanje | odločevalci |
| `03_napoved_jutri.ipynb` | informirati: napoved dnevnega PM2.5 za jutri | oba |
| `04_kje_in_koga.ipynb` | razložiti: indeks izpostavljenosti po četrtnih skupnostih | odločevalci |
| `05_obcan_zdaj.ipynb` | informirati, spodbuditi: stanje na točki in naslednjih 12 ur | občani |
| `06_ucinek_ukrepa.ipynb` | preveriti: učinek ukrepa z izločitvijo vremena | odločevalci |
| `07_scenariji_ukrepov.ipynb` | spodbuditi: scenariji "kaj če" po ČS, igrifikacija | odločevalci |

## Zagon

```
pip install -r ../requirements.txt
cd podatki/paket/primeri
jupyter notebook
```

Seznam paketov je v `../requirements.txt` (pandas, numpy, requests, matplotlib, jupyter; geopandas, rasterio za karte v 01, 04, 07; scikit-learn za modele v 03 in 06). Python 3.10 ali novejši.

Poti v zvezkih so relativne na mapo `podatki/paket/` (`../01_meritve/...`), zato jih zaženite iz mape `primeri/`. Datoteke `zgradi_*.py` zvezke ponovno ustvarijo iz kode (nbformat); izvedba z izhodi: `py -m jupyter nbconvert --to notebook --execute --inplace <zvezek>.ipynb`. `cs_kazalniki.csv` je vmesni izhod zvezka 04 (tabela po ČS), ki ga uporablja zvezek 07.

## 01 Hiter začetek (`01_hiter_zacetek.ipynb`)

Osem korakov: nalaganje ARSO PM, inverzije, ERA5 in CAMS ter združevanje po `time_utc`; zimski dnevni hod PM2.5 po postajah; PM2.5 ob inverziji in brez ter proti višini mejne plasti; CAMS (model) proti ARSO (meritev) za zimo 2025/26; karta (relief, ČS, vročevod, postaje, senzorji); občanski senzor pred in po umerjanju; klic podatkov v živo. Izvedba ~15 s. Korak 6: polje modela CAMx ARSO (4,4 km) za eno zimsko uro čez ČS in postaje ter urna vrsta model proti meritvi (model precenjuje, jutranji vrh ob 6–8 UTC, ki ga meritve nimajo).

## 02 Epizode onesnaženja in zgodnje opozarjanje (`02_epizode_opozarjanje.ipynb`)

Za odločevalce. Definira epizode (dnevni PM10 > 50 µg/m³ na Bežigradu): 195 dni s preseganjem in 80 epizod v letih 2016–2026, najdaljša 7 dni (januar 2022). Kompozitni potek vremena in inverzije ob začetku in koncu desetih najdaljših epizod; kaj epizodo konča (veter ali padavine). Preprosto pravilo za opozorilo "jutri" (veter < 6 km/h, mejna plast < 300 m, brez padavin) ujame okoli tri četrtine preseganj, a so tri četrtine opozoril lažne, ker je preseganje redek dogodek (11 % zimskih dni); prag CAMS ujame 94 % z 70 % lažnih; tabela občutljivosti na pragove. ERA5 je analiza, ne napoved, zato je uspešnost zgornja meja. Izvedba ~10 s. Četrto pravilo: CAMx PM10 > 50 za jutri (ure +25 … +48, zime 2023–2025): ujame 18 od 29 preseganj, 78 % opozoril je lažnih, ker precenjuje (35 proti 25 µg/m³); za isti dan (ure +1 … +24) ni boljši.

## 03 Napoved za jutri (`03_napoved_jutri.ipynb`)

Za občane in odločevalce. Dnevni PM2.5 Bežigrad (EEA dnevno 2018–2020 + ARSO 2021–2026) napovedan za jutri iz vremena (ERA5 za jutri kot nadomestek napovedi), CAMS, vztrajnosti in koledarja z gradient boostingom (scikit-learn); učenje do oktobra 2025, test zima 2025/26. Rezultat: model (MAE 6,7 µg/m³) in vztrajnost (6,0) sta blizu, a model ujame 91 % slabih dni (> 25 µg/m³) proti 58 % pri vztrajnosti in je boljši ob prehodih (MAE 8,5 proti 10,0); CAMS brez umerjanja je neuporaben (MAE 16,7). Permutacijska pomembnost spremenljivk; zadnja celica isti model požene na resnični napovedi Open-Meteo (potrebuje internet). Izvedba ~35 s. CAMx za jutri (ure +25 … +48, v testu do 31. 12. 2025) kot napoved in kot značilka: brez umerjanja MAE 25 µg/m³ (precenjuje za 24 v nov–dec 2025); CAMx za isti dan MAE 16,7.

## 04 Kje in koga zrak najbolj prizadene (`04_kje_in_koga.ipynb`)

Po 17 četrtnih skupnostih MOL združi kataster stavb (stanovanjske stavbe, leto izgradnje, stanovanja), bližino vročevoda in plinovoda (ZKGJI), število kurilnih naprav na trda goriva iz EviDim (razporejeno po stavbah z utežmi, umerjeno na občinsko vsoto), lego v kotlini (DEM, višina nad dnom) in zimske koncentracije najbližje postaje ARSO ali umerjenega senzorja. Rezultat je sestavljen indeks izpostavljenosti (ocena, uteži v eni celici) s tabelo in karto; tabela po ČS se shrani v `cs_kazalniki.csv` za zvezek 07. Razdelek "Kaj manjka za koga" našteje podatke o prebivalcih (starost, vrtci, šole, DSO) in kje jih dobiti. Teče ~15 s. Razdelka 7 in 8 (20. 11.): ocena kurišč preverjena z emisijskim inventarjem ARSO (`04_prostor/emisije/`) in z modelom GRAL (`02_modeli/gral/`, prispevek kurišč h PM10 po ČS v kurilni sezoni); razvrstitev ČS po oceni iz registrov se z inventarjem ujema zmerno (Spearman 0,60), z GRAL šibko (0,36; inventar proti GRAL 0,06), ker GRAL meri koncentracijo, ne emisij: Trnovo je prvo po oceni in inventarju, po GRAL pa Center (gosto, nizko) tik pred Trnovim; Šmarna gora je po emisijah visoko in po GRAL zadnja (razpršeno, prevetreno). Drugi indeks (`indeks_gral`) uporabi GRAL namesto ocene kurišč; karta dobi desno ploščo z januarskim poljem GRAL (60 m).

## 05 Občan zdaj in naslednjih 12 ur (`05_obcan_zdaj.ipynb`)

Za občane: za poljubno točko sestavi sporočilo iz najbližje postaje ARSO (meritev), najbližjega umerjenega občanskega senzorja (ocena), stanja inverzije in tipičnega poteka naslednjih 12 ur iz zadnjih treh zim v podobnih razmerah, s smerjo iz CAMS (model). Pet razredov kakovosti zraka, prijazna sporočila s predlogom, kdaj prezračiti; graf zadnjih 24 h in ocene naslednjih 12; pošten test na zimi 2025/26 (predlagana najboljša ura za prezračevanje je med tremi dejansko najboljšimi v 45 % primerov, naključje 25 %); celica v živo prek `v_zivo/zrak_v_zivo.py`. Izvedba ~20 s. Dodana smer iz CAMx s popravkom pristranskosti (30-dnevna drseča razlika): v testu slabša od CAMS (MAE 14,6 proti 11,6), ker ima lažni jutranji vrh in sega le do konca dneva; v živem delu ostane CAMS.

## 06 Preverjanje učinka ukrepa (`06_ucinek_ukrepa.ipynb`)

Za odločevalce: meteorološka normalizacija (gradient boosting iz vremena ERA5, inverzije, dneva v tednu, letnega časa in leta; ostanek = del, ki ga vreme ne pojasni) z bootstrap intervalom. Naravni poskus zaprtja spomladi 2020 na Bežigradu: NO2 surovo −52 %, normalizirano −33 % (−37 … −30 %); PM10 brez učinka. Trend zimskih povprečij PM10 2016–2026: surovo −1,5 µg/m³ na zimo, ob povprečnem vremenu −0,6; 85 % medletnih nihanj je vreme. Predloga `ucinek(...)` za lasten ukrep, s kontrolo na obdobju brez ukrepa (+1 %, −8 … +9 %). Potrebuje scikit-learn. Izvedba ~35 s.

## 07 Scenariji ukrepov po četrtnih skupnostih, "kaj če" (`07_scenariji_ukrepov.ipynb`)

Linearen model prispevkov virov (deleži za mesto v eni celici `VIRI`, po redu velikosti iz objavljenih ocen; emisijski inventar ARSO daje emisije, ne koncentracij, zato deležev ne nadomešča), umerjen na izmerjeno zimo 2025/26 na Bežigradu in **prostorsko razporejen po modelu GRAL ARSO** (prispevek kurišč po ČS; stikalo `PROSTOR_KURISCA` izbere GRAL, emisije ali oceno iz zvezka 04; tabela pokaže vse tri). Z GRAL se relativni prispevek kurišč premakne k Centru in Trnovem (1,7-kratnik mestnega povprečja), Mostam in Bežigradu (1,2), stran od Sostra, Šmarne gore in Črnuč (0,3–0,4). Funkcija `scenarij()` sprejme ukrepe (zamenjava peči po ČS, priključitev na vročevod, manj prometa, elektrifikacija, prepoved kurjenja ob epizodah, regionalni ukrep) in vrne zimsko povprečje PM2.5 in dni nad mejo po ČS pred in po. Trije pripravljeni scenariji s karto pred/po, prioritizacija ČS po učinku 1.000 zamenjanih peči in igra s proračunom (cene v celici `CENE`, privzete). Vsi rezultati so ocene za primerjavo ukrepov med seboj, ne napoved absolutnih vrednosti. Teče ~20 s.
