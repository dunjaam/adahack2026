# Licence in navedba virov

Podatki v tem paketu so zbrani iz javnih virov za potrebe hekatona ADA Hack 2026. Vsak vir ima svoje pogoje; pri objavi rezultatov navedite vir po spodnji tabeli. Skripte in dokumentacija paketa (Abelium d.o.o., 2026) so pod licenco MIT.

| Vir | Datoteke | Licenca / pogoji | Navedba |
|---|---|---|---|
| Agencija RS za okolje (ARSO), Sektor za kakovost zraka | `01_meritve/arso_lj_*`, `05_zadnji_dnevi/`, `v_zivo` (XML feed) | podatki pripravljeni za hekaton; prosta uporaba z navedbo vira; urni podatki niso formalno validirani | "Vir: ARSO" |
| ARSO, meteorološki arhiv | `03_vreme_inverzija/arso_meteo_*`, `inverzija_urno_*` | prosto dostopni podatki z navedbo vira | "Vir: ARSO" |
| ARSO, modelska napoved CAMx | `05_zadnji_dnevi/camx/` (slike), `02_modeli/camx/` (polja) | slike javno objavljene; polja pripravljena za hekaton, prosta uporaba z navedbo vira | "Vir: ARSO" |
| Evropska agencija za okolje (EEA) | `01_meritve/eea_*` | EEA standardna ponovna uporaba (prosto z navedbo vira) | "Vir: EEA / ARSO" |
| Sensor.Community | `01_meritve/sensor_community_*` | Open Database License (ODbL) 1.0 | "Vir: Sensor.Community, ODbL" |
| PurpleAir | `01_meritve/purpleair_*` | podatki lastnikov naprav prek PurpleAir API; nekomercialna raba, Terms of Service PurpleAir | "Vir: PurpleAir" |
| Umerjanje (izpeljano) | `01_meritve/senzorji_umerjanje_*`, `senzorji_umerjeno_urno.csv.gz` | izpeljano iz zgornjih virov; ocena, ne meritev | "Vir: ADA Hack 2026 (Abelium) iz ARSO, Sensor.Community, PurpleAir" |
| Copernicus Atmosphere Monitoring Service (CAMS) prek Open-Meteo | `02_modeli/cams_*` | CC BY 4.0 (Open-Meteo), Copernicus licenca | "Vir: Open-Meteo.com, CAMS / Copernicus" |
| ERA5 (Copernicus C3S) prek Open-Meteo | `03_vreme_inverzija/era5_*` | CC BY 4.0 (Open-Meteo), Copernicus licenca | "Vir: Open-Meteo.com, ERA5 / Copernicus C3S" |
| NOAA NCEI, IGRA2 (izvajalec meritev ARSO) | `03_vreme_inverzija/igra2_*` | javni podatki NOAA, brez omejitev | "Vir: NOAA NCEI IGRA2, ARSO" |
| Geodetska uprava RS (GURS), Kataster nepremičnin, ZKGJI | `04_prostor/kn_*`, `zkgji_*` | CC BY 4.0 (pogoji JGP) | "Vir: GURS, stanje 11.–13. 11. 2026" |
| Mestna občina Ljubljana (MOL) | `04_prostor/mol_*` | odprti podatki MOL (ArcGIS), navedba vira | "Vir: MOL" |
| Statistični urad RS (SURS), SiStat | `04_prostor/surs_*` | CC BY 4.0 | "Vir: SURS" |
| ARSO, EviDim | `04_prostor/evidim_*` | javni podatki (gov.si), navedba vira | "Vir: ARSO, EviDim" |
| OpenStreetMap | `04_prostor/osm_obcutljive_lokacije.*` | Open Database License (ODbL) 1.0 | "© OpenStreetMap contributors" |
| ARSO, modelska ocena PM in tabela preseganj | `02_modeli/arso_slike/` | slike ARSO za hekaton; za ilustracijo | "Vir: ARSO" |
| ARSO, model GRAL (mala kurišča, osebna vozila) | `02_modeli/gral/` | polja pripravljena za hekaton, prosta uporaba z navedbo vira; promet samo relativno (enote v potrjevanju) | "Vir: ARSO" |
| ARSO, emisijski inventar (mala kurišča, cestni promet) | `04_prostor/emisije/` | podatki pripravljeni za hekaton, prosta uporaba z navedbo vira; enote cest v potrjevanju | "Vir: ARSO" |
| Copernicus DEM GLO-30 | `04_prostor/dem_*` | Copernicus DEM licenca (prosta uporaba z navedbo) | "Vir: Copernicus DEM GLO-30, ESA/Airbus" |


Omejitev odgovornosti: podatki so posredovani takšni, kot so; organizatorji ne jamčijo za popolnost ali pravilnost. Jasno ločite meritev, model in oceno.
