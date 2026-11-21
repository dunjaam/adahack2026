# 04_prostor – stavbe, omrežja, soseske, ogrevanje, relief

Prostorski kontekst za Ljubljansko kotlino: kdo kje živi, kakšne so stavbe, kje sta vročevod in plinovod, koliko je kurišč in kakšen je relief. Vsi sloji so bili preneseni in pretvorjeni 13. 11. 2026 s skriptami v `skripte/paket/` (zagon `py -I <skripta>`), brez registracije.

**Koordinatni sistemi.** GeoPackage: EPSG:3794 (D96/TM, slovenske državne koordinate, metri). GeoJSON: EPSG:4326 (WGS84). GeoTIFF: EPSG:4326. Za spajanje z meritvami ARSO uporabite `lat`/`lon` (4326) ali `d96_e`/`d96_n` (3794) iz paketa meritev.

**Najpomembnejše opozorilo.** V katastru nepremičnin **ni podatka o vrsti ogrevanja ali energentu** (ukinjen z ZKN 2022). Polje `plin` (priključek na plin) je v Ljubljani izpolnjeno le pri ~15 % stavb (`ni podatka` pri 85 %). Način ogrevanja po soseskah se lahko le **oceni** iz bližine vročevoda/plinovoda, starosti stavbe in tipa stavbe ter kalibrira na SURS (naselja) in EviDim (občina). Vsako tako oceno označite kot oceno.

| Datoteka | Vsebina | Vir, stanje | Licenca |
|---|---|---|---|
| `kn_stavbe.gpkg` | 146.736 stavb v 13 občinah kotline; sloj `stavbe_tlorisi` (poligoni z vsemi atributi), sloj `stavbe_tocke` (vse stavbe kot točka, samo id) | GURS, Kataster nepremičnin, stanje 13. 11. 2026, prenos JGP | CC BY 4.0 |
| `kn_stavbe_atributi.csv.gz` | isti atributi brez geometrije, za vse stavbe (tudi 821 brez tlorisa), s stolpcema `x_d96`, `y_d96` | GURS KN | CC BY 4.0 |
| `zkgji_vrocevod.gpkg` | infrastruktura za toplotno energijo v MOL: `linije` (24.334: vročevod 20.534, kineta 3.342, parovod 428), `tocke` (23.007: toplotne postaje 4.823, jaški …) | GURS, Zbirni kataster GJI, stanje 11. 11. 2026 | CC BY 4.0 |
| `zkgji_plinovod.gpkg` | infrastruktura za zemeljski plin v MOL: `linije` (72.066, plinovod 71.917), `tocke` (79.180), `poligoni` (47: regulatorske postaje …) | GURS ZKGJI, 11. 11. 2026 | CC BY 4.0 |
| `mol_cetrtne_skupnosti.geojson`, `mol_naselja.geojson`, `mol_meja.geojson` | 17 četrtnih skupnosti, 38 naselij, meja MOL (WGS84) | MOL ArcGIS portal, prenos 13. 11. 2026 | MOL odprti podatki |
| `mol_meje.gpkg` | isti trije sloji v EPSG:3794 (`cetrtne_skupnosti`, `naselja`, `meja_mol`) | MOL | MOL odprti podatki |
| `surs_ogrevanje_obcine.csv` | stanovanja po naseljenosti × vrsti ogrevanja (daljinsko / centralno / drugo / brez), vse občine, 2011, 2015, 2018, 2021; število in uporabna površina | SURS SiStat 0861120S | CC BY 4.0 |
| `surs_ogrevanje_naselja.csv` | stanovanja po načinu ogrevanja (centralno ali daljinsko / drugo ali brez), vsa naselja Slovenije, 2011–2021 | SURS SiStat 0871205S | CC BY 4.0 |
| `evidim_kurilne_naprave_obcine.csv` | število malih kurilnih naprav po občini × vrsta goriva / tip naprave / območje moči | ARSO, EviDim, stanje 3. 8. 2026 (objava 9. 10. 2026) | javni podatki ARSO (ZDIJZ) |
| `evidim_kurilne_naprave_gorivo_moc_slo.csv` | isto po vrsti goriva × moči, samo Slovenija | ARSO, EviDim | javni podatki |
| `dem_lj_kotlina_30m.tif` | digitalni model površja 30 m, izrez 14,20–14,85 E, 45,90–46,30 N (2340 × 1440 celic), m n. v. | Copernicus DEM GLO-30 (AWS) | prosta uporaba z navedbo |
| `osm_obcutljive_lokacije.geojson`, `osm_obcutljive_lokacije.csv` | 530 občutljivih lokacij v kotlini kot točke (WGS84): 177 vrtcev, 239 šol, 48 bolnišnic, 38 zdravstvenih domov in klinik, 28 domov za starejše; stolpci `osm_id`, `kategorija` (vrtec, sola, bolnisnica, zdravstveni_dom, dom_za_starejse), `ime`, `naslov`, `naselje`, `operator`, izvirne oznake OSM | OpenStreetMap prek Overpass API, prenos 19. 11. 2026, izsek 45,85–46,30 N, 14,25–14,85 E | ODbL, "© OpenStreetMap contributors" |
| `dem_lj_kotlina_30m_visina_nad_dnom.tif` | višina nad dnom kotline (2. percentil izreza = 278 m); uporabno za obris hladnega jezera ob inverziji | izpeljano | kot zgoraj |

Navedba virov pri objavi: "Geodetska uprava RS, Kataster nepremičnin in Zbirni kataster GJI, 11.–13. 11. 2026", "SURS", "ARSO, EviDim", "Mestna občina Ljubljana", "© DLR / Airbus, Copernicus DEM, EU/ESA".

## kn_stavbe.gpkg in kn_stavbe_atributi.csv.gz

Občine: 061 Ljubljana (70.418 stavb), 023 Domžale, 043 Kamnik, 071 Medvode, 138 Vodice, 186 Trzin, 072 Mengeš, 022 Dol pri Ljubljani, 037 Ig, 123 Škofljica, 008 Brezovica, 021 Dobrova - Polhov Gradec, 032 Grosuplje. Vir paketa: JGP portal, "Stavbe za območje občine" (SHP + CSV), pretvorba s `skripte/paket/gurs_kn_stavbe.py`.

Geometrija tlorisa: za vsako stavbo je vzet prvi razpoložljivi od (1) tloris zemljišča pod stavbo (ZPS), (2) nadzemni tloris, (3) tloris; stolpec `tloris_vir`. 821 stavb (0,6 %) nima nobenega poligona in je le v sloju `stavbe_tocke` in v CSV.

| Stolpec | Pomen |
|---|---|
| `eid_stavba` | enolični identifikator stavbe (ključ za spajanje s CSV in z drugimi podatki KN) |
| `obcina_sifra` | šifra občine (RPE), npr. 061 |
| `ko_id`, `st_stavbe` | katastrska občina in številka stavbe |
| `stevilo_etaz`, `stevilo_stanovanj`, `stevilo_poslovnih_prostorov` | iz KN |
| `tip_stavbe_id` / `tip_stavbe_txt` | 1 samostoječa, 2 krajna vrstna, 3 vmesna vrstna, 0 ni podatka |
| `elektrika`, `plin`, `vodovod`, `kanalizacija` + `_txt` | priključki: 1 da, 2 ne, 0 ni podatka, -1 neznano. **`plin` je večinoma "ni podatka".** |
| `leto_izgradnje`, `leto_obnove_fasade`, `leto_obnove_strehe` | leto; 0 ali prazno = ni podatka |
| `visina_h1`, `visina_h2`, `visina_h3` | višine stavbe po KN (m n. v.): H1 najnižja točka stavbe ob terenu, H3 najvišja točka stavbe; razlika H3 - H1 je približna višina stavbe |
| `bruto_tlorisna_povrsina` | m² |
| `nosilna_konstrukcija_id` / `_txt` | 1 opeka, 2 beton, 3 kamen, 4 les, 5 kombinacija, 6 kovina, 7 montažna, 8 drugo |
| `status_vpisa_id` / `_txt` | 1 katastrski ZEN, 2 ZENDMPE, 3 registrski (največ), 4 ZKN … |
| `datum_sys`, `kn_stanje` | datum zadnje spremembe zapisa; datum stanja paketa |
| `n_delov` | število delov stavbe (iz tabele delov stavb) |
| `n_stanovanj_deli` | število delov z rabo stanovanje (rabe 1, 2, 3, 4, 47) |
| `stanovanjska` | True, če ima vsaj en stanovanjski del |
| `prevladujoca_raba_id` / `prevladujoca_raba` | najpogostejša dejanska raba delov stavbe (šifrant VRSTE_DEJANSKIH_RAB_DEL_ST) |
| `uporabna_povrsina_vsota` | vsota uporabne površine delov, m² |
| `leto_obnove_instalacij_max`, `leto_obnove_oken_max` | največje leto obnove med deli stavbe |
| `x_d96`, `y_d96` | koordinati centroida (EPSG:3794), samo v CSV |

Primer: stavbe v Ljubljani, stanovanjske, brez priključka na plin ali brez podatka, dlje kot 50 m od vročevoda:

```python
import geopandas as gpd
st = gpd.read_file("kn_stavbe.gpkg", layer="stavbe_tlorisi")
st = st[(st.obcina_sifra == "061") & st.stanovanjska]
vr = gpd.read_file("zkgji_vrocevod.gpkg", layer="linije")
vr = vr[vr.vrsta_objekta.isin(["Vročevod", "Toplovod"])]
blizu = st.sjoin_nearest(vr[["geometry"]], how="left", max_distance=50, distance_col="d_vrocevod")
kandidati = blizu[blizu.d_vrocevod.isna() & (blizu.plin != 1)]   # OCENA, ne meritev
```

## zkgji_vrocevod.gpkg, zkgji_plinovod.gpkg

Samo območje MOL (paket "GJI za območje občine 061"). Stolpci: `eid`, `gji_id`, `vrsta_objekta_sifra` (2302 vročevod, 2301 toplovod, 2303 parovod, 2304 kineta, 2201 plinovod …), `vrsta_objekta`, `atr1` (lega: v zemlji / v kineti / prosto; pri plinovodu vrsta plina), `atr2` (razred premera DN; pri plinovodu omrežni/priključni), `atr3`, `atr4`, `opuscenost`, `leto_izgradnje` (izpolnjeno pri 99 %), `zunanja_tlorisna_dimenzija` (mm), `vir`, `datum_vira`, `natancnost_polozaja_id`, `upravljavec_maticna` (matična številka upravljavca; 5226406 = Energetika Ljubljana, 9999999 = ni podatka), `opis`, `datum_sys`. Izvorne kode `gji_*_id` so ohranjene. Geometrija je 2D (Z odstranjen).

Območja "obvezne priključitve" na vročevod ali plin kot GIS-sloj ne obstajajo; lahko jih le aproksimirate z razdaljo do omrežja.

## mol_* (četrtne skupnosti, naselja, meja)

`cetrtne_skupnosti`: `cs_id`, `cs_ime` (17 ČS), `pe_sifra`, `pe_ime`, `povrsina`. `naselja`: `naselje_sifra` (šifra naselja RPE, združljiva s `surs_ogrevanje_naselja.csv` prek `061` + šifra), `naselje_ime`, `naselje_ime_kratko`, `eid_obcina`, `sestavljena_sifra`. `meja_mol`: en poligon, izpeljan kot unija ČS, ker je sloj Meja_MOL na portalu prazen. Sloj STAVBE_2D na portalu MOL je zastarela kopija KN (2022–2023) in ni vključen; uporabite `kn_stavbe.gpkg`.

## surs_ogrevanje_*.csv

Dolg format. `surs_ogrevanje_obcine.csv`: `obcina_sifra` (3-mestna, 0 = Slovenija), `obcina_ime`, `leto`, `naseljenost_koda`/`naseljenost` (0 skupaj, 1 naseljena, 2 nenaseljena, 21 sezonska, 22 prazna), `ogrevanje_koda`/`ogrevanje` (0 skupaj, 1 daljinsko, 2 centralno, 3 drugo, 4 ni ogrevanja), `meritev_koda`/`meritev` (1 število stanovanj, 5 uporabna površina m²), `vrednost`. Ljubljana 2021: 129.816 stanovanj, 47.846 daljinsko, 73.369 centralno, 6.871 drugo, 1.730 brez.

`surs_ogrevanje_naselja.csv`: `naselje_sifra` (6-mestna = občina + naselje), `obcina_sifra`, `naselje_ime`, `raven` (drzava / obcina / naselje), `leto`, `ogrevanje_koda`/`ogrevanje` (0 skupaj, 1 centralno ali daljinsko, 2 drugo ali brez), `meritev_koda`/`meritev`, `vrednost`. "Centralno" pomeni centralno kurjavo v stavbi na kateri koli energent; energenta (drva, olje, plin) SURS po občinah in naseljih ne objavlja.

## evidim_kurilne_naprave_obcine.csv

Dolg format: `obcina_sifra` (po SURS/GURS; prazno pri "(NI_OBČINE)"), `obcina_ime`, `dimenzija` (vrsta_goriva / tip_naprave / obmocje_moci), `kategorija`, `stevilo_naprav`. Kategorija `SKUPAJ` je vsota. Ljubljana: 75.328 naprav, od tega 49.257 plinasto, 11.679 tekoče (kurilno olje), 14.141 trdno (drva, peleti, premog), ostalo kombinacije. Pri `tip_naprave` se imena nekaterih kategorij v izvorni tabeli ponavljajo (hierarhija centralnih naprav); ponovitve so označene z `(2)`, `(3)`, vsota vseh 21 kategorij je enaka `SKUPAJ`. Edini uradni vir o številu kurišč na trda goriva; ni ravni naselij in ni geometrije.

## dem_lj_kotlina_30m*.tif

GLO-30 je model površja (DSM, vključuje drevesa in stavbe), ločljivost 1 arc-sekunda (~30 m × 22 m), float32, nodata -32767. Razpon v izrezu 228–1849 m. Za analizo hladnega jezera uporabite `visina_nad_dnom`: 2. percentil izreza (278 m) je približek dna kotline; vrednosti pod 0 so doline Save in Ljubljanice južno od mesta.

```python
import rasterio
with rasterio.open("dem_lj_kotlina_30m_visina_nad_dnom.tif") as r:
    h = r.read(1); h[h == r.nodata] = float("nan")
    # delež kotline pod 50 m nad dnom (tipična debelina inverzijske plasti pozimi)
```

## Kaj v tej mapi NI (in se tega ne da dobiti)

- vrsta ogrevanja ali energent po stavbi;
- GIS-sloj območij obvezne priključitve na vročevod ali plin;
- podatki Energetike Ljubljana o priključenih stavbah;
- register energetskih izkaznic kot tabela;
- emisijski inventar po soseskah (ARSO bo za hekaton posebej posredoval, kar ima).

## osm_obcutljive_lokacije.geojson in .csv

Vrtci, šole, bolnišnice, zdravstveni domovi in domovi za starejše iz OpenStreetMap (oznake `amenity=kindergarten|school|hospital|clinic` in `amenity=social_facility` s `social_facility=nursing_home|assisted_living|group_home`). Poligoni so skrčeni na središče. **Omejitve:** popolnost OSM ni zagotovljena (49 lokacij je brez imena, nekatere šole so vpisane kot stavba in kot območje, zasebni vrtci so pogosto manjkajoči); `naselje` je izpolnjeno samo, kjer ima OSM naslov (156 od 530 z "Ljubljana"). Za uradni seznam uporabite razvid MIZŠ (vrtci, šole) ali register izvajalcev zdravstvene dejavnosti; za hekaton OSM zadošča za karto in za oceno izpostavljenosti po četrtnih skupnostih (`primeri/04_kje_in_koga.ipynb` to navaja kot manjkajoči vhod). Skripta: `skripte/paket/osm_obcutljive_lokacije.py`.

