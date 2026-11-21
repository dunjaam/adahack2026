# Izziv: Zrak, ki ga dihamo – podatki za boljše odločitve v Ljubljanski kotlini

## Ozadje

Ljubljanska kotlina ima zaradi svoje oblike in pogostega brezvetrja posebnost: ob hladnem zraku in temperaturni inverziji se onesnaženje z delci PM hitro ujame pri tleh in tam ostane. To se ne dogaja le ob izjemnih dogodkih, ampak skozi celotno kurilno sezono, pogosto prav v urah, ko so ljudje zunaj ali prezračujejo stanovanja.

Podatki o tem obstajajo: uradne merilne postaje, občanski senzorji, vremenske meritve z doline in hribov, modeli, podatki o stavbah in omrežjih. A so razpršeni po virih in institucijah, surovi in za večino ljudi neberljivi. Občan ne ve, kaj diha na svoji poti v službo. Občina nima enostavnega orodja, s katerim bi predvidela naslednjo epizodo ali preverila, ali je ukrep pomagal.

## Namen izziva

Iz razpršenih podatkov narediti orodja, ki občanom in odločevalcem **pravočasno, razumljivo in na njihovem kraju** povedo, kakšen zrak dihajo, zakaj in kaj lahko glede tega storijo.

Bistvo izziva je prevajanje podatkov v odločitve. Ne iščemo novih meritev in ne krivcev. Iščemo rešitve, ki podatke:

1. **razložijo** – kdaj in zakaj se zrak v kotlini poslabša, kje in koga to najbolj prizadene;
2. **informirajo ob pravem času na pravem mestu** – občana, preden gre na sprehod ali prezrači stanovanje; občino, preden se epizoda začne;
3. **spodbudijo ravnanje** – osebne odločitve občanov in ciljno usmerjene ukrepe ter komunikacijo odločevalcev;
4. **omogočijo preverjanje** učinka ukrepov s podatki, ne z občutkom.

## Tvoja misija

V 24 urah razvijte podatkovno podprt prototip, ki naslovi vsaj eno od zgornjih točk za vsaj eno od dveh ciljnih skupin. Ne pričakujemo končnega izdelka, temveč delujoč prototip na realnih podatkih in jasno idejo, ki ima potencial za resnični družbeni učinek in nadaljnji razvoj po hekatonu.

Rešitev je lahko spletna ali mobilna aplikacija, interaktivna vizualizacija, napovedni model, analitična plošča, simulacijsko orodje ali komunikacijski koncept, podprt s podatki.

## Kje lahko ustvarite učinek

**Za občane in lokalno skupnost**

- *Lokalni vpogled:* kako občanu razumljivo pokazati, kakšen je zrak v njegovi okolici zdaj in v naslednjih urah, s pošteno oznako, kaj je meritev in kaj ocena.
- *Pravočasno opozorilo:* kdaj je najbolje iti na sprehod, prezračiti stanovanje, kdaj naj ranljive skupine ostanejo notri.
- *Občutek, da ravnanje šteje:* prijazno, ne moralizirajoče spodbujanje odgovornega ravnanja in prikaz, kaj sprememba navad prinese.

**Za odločevalce in mestne načrtovalce**

- *Zgodnje opozarjanje:* napoved kritičnih ur in dni iz vremenske napovedi, podatkov o inverziji in modelov, s predlogom, kdaj in koga obvestiti.
- *Kje in koga zrak najbolj prizadene:* povezava meritev, vremena, reliefa in podatkov o stavbah, soseskah in ranljivih skupinah v karto tveganja, ki usmerja ukrepe in ozaveščanje.
- *Preverjanje učinka:* orodje, ki občini pokaže, kako bi se stanje spremenilo ob določenem ukrepu, in kako bi učinek izmerili.
- *Kje postaviti merilno mesto:* model, ki glede na koncentracije, vire emisij in lego občutljivih stavb (vrtci, šole, bolnišnice, domovi za starejše) predlaga najprimernejšo lokacijo za novo merilno mesto ali senzor.
- *Kateremu modelu verjeti:* različne modelske napovedi imajo različne negotovosti; orodje, ki na podlagi meritev izbere najboljšo napoved ali modelske rezultate prilagodi meritvam.

## Podatki, ki jih boste imeli na voljo

Organizatorji vnaprej pripravimo podatkovni paket, da prvo uro ne izgubite z registracijami in formati. Vsi podatki so v odprtih formatih (CSV, GeoJSON, GeoPackage, GeoTIFF) z opisom stolpcev, koordinatnih sistemov in licenc. Poleg paketa objavimo tudi povezave do API-jev v živo za demo.

- **Meritve kakovosti zraka:** uradne postaje ARSO v Ljubljani (Bežigrad, Celovška, Vič) in okolici z večletno zgodovino ter urni tok v živo; občanski senzorji (Sensor.Community, PurpleAir) kot dopolnilo na nekaj lokacijah.
- **Vreme in inverzija:** 10-minutne meritve ARSO z dna kotline in s hribov (Bežigrad, Pasja ravan, Krvavec), radiosondaža Ljubljana, reanaliza ERA5 z višino mejne plasti in vremenska napoved.
- **Modeli:** evropski model CAMS (reanaliza od 2013 in napoved) kot regionalno ozadje; urna polja operativnega modela ARSO CAMx (4,4 km) za Slovenijo 2023–2026 z napovedjo za danes in jutri; polja modela ARSO GRAL (15 m) za prispevek malih kurišč v Ljubljani za eno leto po urah.
- **Stavbe, omrežja in meje:** stavbe z letom izgradnje, obnov in priključkom na plin (GURS), trase vročevoda in plinovoda, stanovanja po načinu ogrevanja (SURS), lokacije vrtcev, šol, bolnišnic in domov za starejše (OpenStreetMap), število malih kurilnih naprav po občinah (EviDim), emisije PM10 malih kurišč po mreži 250 m in cestnega prometa po odsekih (ARSO), četrtne skupnosti in naselja MOL, relief kotline.
- **Partner ARSO:** Agencija RS za okolje je za hekaton prispevala urne meritve, modelska polja CAMx in GRAL ter emisije malih kurišč in prometa za Ljubljano, njeni strokovnjaki pa bodo na dogodku na voljo kot mentorji in del komisije.

Pošteno opozorilo: meritve so točkovne, modeli so grobi, nekaterih podatkov (na primer energenta po stavbi) ni. Del izziva je, da z omejenimi podatki poveste resnično in koristno zgodbo in jasno označite, kaj je meritev, kaj model in kaj ocena.

## Kaj pričakujemo ob koncu

Do nedelje do 13:00 oddate:

1. **Delujoč prototip:** koda, model ali vizualizacija, ki na realnih podatkih pokaže delovanje vaše ideje.
2. **Kratek pitch (3–5 minut)** pred komisijo in publiko ob 14:00, ki odgovori na vprašanja:
   - Komu je rešitev namenjena in katero odločitev ji pomaga sprejeti?
   - Katere podatke ste uporabili, kako ste jih povezali in kje so njihove meje?
   - Kakšen je družbeni učinek in kako bi rešitev razvijali naprej?

**Merila ocenjevanja:** uporabnost za ciljno skupino, pravilna in poštena raba podatkov, jasnost sporočila, potencial za nadaljnji razvoj.

## Časovnica

- **Sobota ob 12:00:** začetek 24-urnega sprinta.
- **Nedelja ob 13:00:** konec razvoja in oddaja projektov.
- **Nedelja ob 14:00:** predstavitve, vprašanja komisije in razglasitev zmagovalcev.
- **Po hekatonu:** najboljšim ekipam mentorji in partnerji (Abelium, ARSO) pomagamo razviti prototip naprej in ga predstaviti deležnikom.
