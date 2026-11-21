# Zadnji dnevi pred hekatonom (zajem v oblaku)

Posodobljeno 21. 11. 2026 09:15 UTC s skripto `skripte/paket/arso_dopolnitev_2026.py`. Isti podatki so med hekatonom v živo na https://ada-hack-zrak.live-event-recap-spike.workers.dev (glej `v_zivo/README.md`).

- `arso_live_urno_vse_postaje.csv` – vse zajete ure ARSO XML feeda od 13. 11. 2026 13:00 (lokalni čas UTC+1, stolpec `time_from_local`), 25 postaj po Sloveniji, vsi onesnaževalci (SO2, CO, O3, NO2, NOx, PM10, PM2.5, benzen). Vrednosti `<2` pomenijo pod mejo zaznave. 4606 vrstic.
- `camx/` – slike modelske napovedi PM10 ARSO (CAMx 4,4 km), ena animacija (gif, urne ravni danes in jutri) in dve dnevni povprečji (png) na dan; ime datoteke nosi čas objave (UTC). 24 datotek.
- Za Ljubljano je urna dopolnitev uradnih meritev od 1. 11. 2026 naprej v `01_meritve/arso_lj_pm_urno_2026_11_dopolnitev.csv` (EEA UTD + ta zajem, stolpec `source`).

Vir: ARSO. Pri objavi navedite "Vir: ARSO".
