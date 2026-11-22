import {
  ArrowLeft,
  Bookmark,
  Bus,
  Car,
  Download,
  Flame,
  Gauge,
  Layers,
  Map as MapIcon,
  Sparkles,
  Sliders as SlidersIcon,
  Target,
  Wallet,
  Wind,
} from "lucide-react";
import type { ReactNode } from "react";

const SECTIONS = [
  { id: "uvod", label: "Kaj je ZrakVizija" },
  { id: "pot", label: "Uporabniška pot" },
  { id: "izbira", label: "Izbira občine / območja" },
  { id: "zemljevid", label: "Zemljevid in sloji" },
  { id: "drsniki", label: "Drsniki ukrepov" },
  { id: "kazalniki", label: "Ključni kazalniki" },
  { id: "grafi", label: "Grafi" },
  { id: "optimizacija", label: "Optimizacija investicije" },
  { id: "scenariji", label: "Scenariji in izvoz" },
  { id: "gradniki", label: "Prilagajanje gradnikov" },
  { id: "model", label: "Kako model deluje" },
  { id: "pojmi", label: "Slovar pojmov" },
];

export function DocsPage() {
  return (
    <div className="min-h-screen bg-[#f6f8f7]">
      {/* header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3">
          <span className="inline-flex items-center rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white px-2 py-1.5 shadow-card">
            <img src="/zrakvizija-mark.svg" alt="" className="h-7 w-auto" />
          </span>
          <div className="leading-tight">
            <div className="text-[15px] font-bold tracking-tight text-ink">
              ZrakVizija · Dokumentacija
            </div>
            <div className="text-[11px] text-slate-400">Kako uporabljati nadzorno ploščo</div>
          </div>
          <a
            href="/"
            className="ml-auto flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-card transition hover:bg-brand-700"
          >
            <ArrowLeft className="h-4 w-4" /> Nazaj na ploščo
          </a>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-5 py-8">
        {/* sticky TOC */}
        <nav className="sticky top-24 hidden h-max w-56 shrink-0 lg:block">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Vsebina
          </div>
          <ul className="space-y-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="block rounded-lg px-3 py-1.5 text-sm text-slate-600 transition hover:bg-white hover:text-brand-700"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* content */}
        <main className="min-w-0 flex-1 space-y-10">
          <Section id="uvod" icon={<Wind className="h-5 w-5" />} title="Kaj je ZrakVizija">
            <p>
              ZrakVizija je <b>okoljski digitalni dvojček</b> za slovenske občine in
              odločevalce. Omogoča, da <b>pred</b> porabo javnega denarja preizkusite
              okoljske ukrepe in v živo vidite, kako bi vplivali na onesnaženost zraka
              (PM2.5 / PM10) in koliko bi stali.
            </p>
            <Callout>
              Pokrita občina z vsemi podatki je <b>Mestna občina Ljubljana</b> (17
              četrtnih skupnosti iz podatkovnega paketa ADA Hack 2026). Izhodišče je
              izmerjeno zimsko stanje 2025/26; vplivi ukrepov so <b>modelske ocene</b>.
            </Callout>
          </Section>

          <Section id="pot" icon={<Target className="h-5 w-5" />} title="Uporabniška pot">
            <ol className="list-decimal space-y-1.5 pl-5">
              <li>Izberi občino in po želji konkretno četrtno skupnost.</li>
              <li>Poglej zemljevid onesnaženosti.</li>
              <li>Premakni drsnike ukrepov.</li>
              <li>Opazuj spremembe v živo (brez osveževanja strani).</li>
              <li>Primerjaj stroške in učinek.</li>
              <li>Shrani najboljši scenarij in izvozi povzetek.</li>
            </ol>
          </Section>

          <Section id="izbira" icon={<MapIcon className="h-5 w-5" />} title="Izbira občine / območja">
            <Def term="Izberi občino">
              Glavni spustni meni (z iskalnikom). Trenutno je na voljo MO Ljubljana —
              edina občina s polnim naborom podatkov.
            </Def>
            <Def term="Četrtna skupnost (območje)">
              Izberi »Vsa občina« za agregat ali eno od 17 ČS. Izbira <b>samodejno
              posodobi vse gradnike</b>, zemljevid se približa izbranemu območju, grafi
              in kazalniki pa prikažejo samo to območje.
            </Def>
            <p>Območje lahko izbereš tudi z <b>klikom neposredno na zemljevidu</b>.</p>
          </Section>

          <Section id="zemljevid" icon={<Layers className="h-5 w-5" />} title="Zemljevid in sloji">
            <p>Interaktivni zemljevid (Leaflet) je osrednji del plošče.</p>
            <ul className="mt-2 space-y-2">
              <Bullet icon={<Wind className="h-4 w-4 text-brand-600" />} name="Onesnaženost">
                Območja so obarvana po PM2.5 ali PM10 (zeleno = čisto, rdeče = onesnaženo).
              </Bullet>
              <Bullet icon={<Flame className="h-4 w-4 text-orange-500" />} name="Ogrevanje">
                Obarva po emisijah malih kurišč (kg PM10/leto).
              </Bullet>
              <Bullet icon={<Car className="h-4 w-4 text-sky-500" />} name="Promet">
                Obarva po prometnih emisijah (kg PM10/leto).
              </Bullet>
              <Bullet icon={<MapIcon className="h-4 w-4 text-violet-500" />} name="Občutljive lokacije">
                Šole, vrtci, domovi — kje onesnaženost najbolj škodi.
              </Bullet>
            </ul>
            <Callout>
              Preklopnik <Chip>PM2.5</Chip> / <Chip>PM10</Chip> izbere onesnaževalo.
              Preklopnik <Chip>Prej</Chip> / <Chip>Potem</Chip> / <Chip>Δ</Chip> pokaže
              stanje pred ukrepi, po ukrepih ali razliko (temnejše zeleno = večje
              izboljšanje). To je primerjava <b>Before / After</b>.
            </Callout>
          </Section>

          <Section id="drsniki" icon={<SlidersIcon className="h-5 w-5" />} title="Drsniki ukrepov">
            <p>
              Štirje ukrepi. Ob vsaki spremembi se <b>vsi povezani gradniki posodobijo
              takoj</b> (skupno stanje aplikacije).
            </p>
            <ul className="mt-2 space-y-2">
              <Bullet icon={<Bus className="h-4 w-4 text-brand-600" />} name="Elektrifikacija avtobusov (%)">
                Delež dizelskih mestnih avtobusov, zamenjanih z električnimi. Zniža
                prometni del onesnaženosti.
              </Bullet>
              <Bullet icon={<Flame className="h-4 w-4 text-orange-500" />} name="Zamenjava kurišč na trda goriva (št.)">
                Koliko malih kurišč na drva/premog zamenjamo s toplotnimi črpalkami.
                Največ učinka v predmestjih, kjer prevladuje ogrevanje (npr. Sostro).
              </Bullet>
              <Bullet icon={<Car className="h-4 w-4 text-sky-500" />} name="Zamenjava dizlov EURO 4 (št.)">
                Izberete število osebnih dizlov, ki jih na začetku leta umaknemo iz prometa
                in zamenjamo z rabljenimi baterijskimi električnimi vozili. Subvencija
                znaša 3.000 € na avto po referenčni postavki{" "}
                <a className="underline" href="https://borzen.si/enkratne-subvencije/mobilnost/elektricna-vozila/subvencije-za-nakup-elektricnih-vozil-po-javnem-pozivu-sub-ev26">Borzen JP SUB-EV26</a>.
                Zgornja meja je 14.753 dizlov EURO 4, registriranih 30. 6. 2023
                po <a className="underline" href="https://www.ljubljana.si/assets/20260309_EB_MOL_2024.pdf#page=47">tabeli 16 MOL</a>.
              </Bullet>
              <Bullet icon={<Wallet className="h-4 w-4 text-emerald-600" />} name="Razpoložljiv proračun (€)">
                Letna investicija občine. Vrstica »Poraba proračuna« pokaže, ali ukrepi
                ostanejo znotraj proračuna (zeleno) ali ga presežejo (rdeče).
              </Bullet>
            </ul>
          </Section>

          <Section id="kazalniki" icon={<Gauge className="h-5 w-5" />} title="Ključni kazalniki (KPI)">
            <Def term="PM2.5 / PM10 (prej → potem)">
              Povprečna koncentracija za izbrano območje pred in po ukrepih, v µg/m³, z
              odstotno spremembo.
            </Def>
            <Def term="Skupna investicija">
              Vsota stroškov vseh ukrepov. Označeno, ali je znotraj proračuna.
            </Def>
          </Section>

          <Section id="grafi" icon={<Gauge className="h-5 w-5" />} title="Grafi">
            <Def term="PM2.5 prej / potem po območjih">
              Stolpci za vsako ČS: sivo = prej, barvno = potem. Rdeča črta = meja EU
              (25 µg/m³). Klik na stolpec izbere to območje.
            </Def>
            <Def term="Prispevek virov">
              Razdeli onesnaženost na <b>Ozadje</b> (regionalno, nespremenljivo),
              <b> Ogrevanje</b> in <b>Promet</b> — prej in potem. Pokaže, kateri vir ukrep
              dejansko zniža.
            </Def>
            <Def term="Sezonski trend PM2.5">
              Mesečni potek čez leto (zimski vrhovi zaradi inverzij). To je
              <b> modelska ocena</b> na podlagi zimskega sidra, ne meritev.
            </Def>
          </Section>

          <Section id="optimizacija" icon={<Sparkles className="h-5 w-5" />} title="Optimizacija investicije">
            <p>
              Vneseš proračun, gumb <Chip>Optimiziraj</Chip> pa preišče kombinacije
              ukrepov in vrne tisto z <b>največjim znižanjem PM2.5 znotraj proračuna</b>.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><b>Priporočeni scenarij</b> — najboljša kombinacija; gumb »Uporabi ta scenarij« jo nastavi na drsnikih.</li>
              <li><b>Učinkovitost posameznih ukrepov</b> — koliko µg/m³ in € na µg/m³ prinese vsak ukrep posebej.</li>
            </ul>
          </Section>

          <Section id="scenariji" icon={<Bookmark className="h-5 w-5" />} title="Scenariji in izvoz">
            <Def term="Shrani scenarij">
              Poimenuj in shrani trenutne nastavitve. Shranjeni scenariji ostanejo v
              brskalniku (localStorage) in jih lahko primerjaš v tabeli.
            </Def>
            <Def term="Uporabi / Izbriši">
              Kljukica naloži scenarij nazaj na drsnike; koš ga izbriše.
            </Def>
            <Def term="Izvozi povzetek">
              Gumb <Download className="inline h-3.5 w-3.5" /> v glavi ustvari <b>HTML
              povzetek</b> (KPI, ukrepi, tabela po območjih) za deljenje ali tisk.
            </Def>
          </Section>

          <Section id="gradniki" icon={<Layers className="h-5 w-5" />} title="Prilagajanje gradnikov">
            <p>Plošča je sestavljena iz gradnikov, ki jih poljubno urediš:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><b>Premakni</b> — primi gradnik za naslovno vrstico in ga povleci.</li>
              <li><b>Spremeni velikost</b> — povleci spodnji desni rob.</li>
              <li><b>Odstrani</b> — gumb × v naslovni vrstici.</li>
              <li><b>Dodaj</b> — gumb »Dodaj gradnik« zgoraj desno vrne odstranjene.</li>
            </ul>
          </Section>

          <Section id="model" icon={<Target className="h-5 w-5" />} title="Kako model deluje">
            <p>Dva povezana modela:</p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5">
              <li>
                <b>Napovedni model (prediction)</b> — prednaučen RandomForest oceni
                ogrevalni prispevek k PM10 iz značilk stavb, ogrevanja in vremena.
                Izhodišče PM2.5 je <b>izmerjeno</b> zimsko sidro 2025/26.
              </li>
              <li>
                <b>Simulacijski model</b> oceni spremembo koncentracij PM zaradi e-busov,
                zamenjave kurišč, obnove stavb in zamenjave dizlov. Pri dizlih delež
                preprečenih primarnih emisij izračunamo glede na evidenco prometa MOL
                (187,1 t/leto za vsako velikost delcev,{" "}
                <a className="underline" href="https://www.ljubljana.si/assets/20260309_EB_MOL_2024.pdf#page=89">preglednici 30 in 31</a>).
                Za enak delež zmanjšamo ocenjeni prometni prispevek v četrti. To je
                približek ob enakem vremenu in predpostavki, da zamenjana vozila sledijo
                prostorskemu in sezonskemu vzorcu prometa. Zemljevid in izračun stroškov
                na enoto izboljšanja prikazujeta scenarij z vsemi vožnjami v MOL.
                Glavni prikaz poda tudi oceno, če vse vožnje potekajo zunaj MOL. Dejanski
                lokalni delež voženj in odziv koncentracij nista izmerjena.
              </li>
            </ol>
            <p className="mt-2">
              Pri zamenjavi dizlov uporabimo približno 12.907 km na leto za obe vozili.
              To je državno povprečje za dizle, stare 15–19 let, na domačih in tujih cestah
              (<a className="underline" href="https://pxweb.stat.si/SiStatData/pxweb/sl/Data/Data/2282005S.px/">SURS 2282005S</a>).
              Uporabimo faktorje EMEP/EEA za srednje velika vozila,{" "}
              <a className="underline" href="https://copert.emisia.com/wp-content/uploads/2026/09/1.A.3.b.i-iv-Road-transport-June-2026.pdf#page=28">izpušne emisije</a>{" "}
              in <a className="underline" href="https://copert.emisia.com/wp-content/uploads/2025/10/1.A.3.b.vi-vii-Road-tyre-and-brake-wear-2025.pdf#page=18">obrabo</a>{" "}
              pri povprečni hitrosti pod 40 km/h. PM₂.₅ je del PM₁₀. NOₓ je izražen v
              ekvivalentu mase NO₂.
            </p>
            <Callout>
              Približno <b>30 % zimskega PM2.5</b> je regionalno ozadje, ki ga lokalni
              ukrepi ne morejo spremeniti (dokumentirana predpostavka). Preostanek se
              deli na ogrevanje in promet po atribuciji GRAL. Stroški (npr. ~8.000 €/kurišče,
              ~450.000 €/e-bus) so jasno označene <b>demo predpostavke</b>.
            </Callout>
            <p className="mt-2">
              <b>Meritev vs. ocena:</b> 📍 pomeni meritev (ARSO postaja), 〜 pomeni
              modelsko oceno (umerjen senzor). Nobena realna meritev ni izmišljena.
            </p>
          </Section>

          <Section id="pojmi" icon={<Gauge className="h-5 w-5" />} title="Slovar pojmov">
            <dl className="divide-y divide-slate-100">
              <Glossary term="PM2.5" desc="Drobni delci < 2,5 µm; prodrejo globoko v pljuča. Letna meja EU: 25 µg/m³." />
              <Glossary term="PM10" desc="Delci < 10 µm. V aplikaciji izpeljan iz PM2.5 z zimskim razmerjem." />
              <Glossary term="µg/m³" desc="Mikrogrami onesnaževala na kubični meter zraka — enota koncentracije." />
              <Glossary term="Inverzija" desc="Ujetje hladnega zraka v kotlini pozimi; onesnaženost se kopiči." />
              <Glossary term="ČS (četrtna skupnost)" desc="Upravna četrt Ljubljane; aplikacija jih pokriva 17." />
              <Glossary term="GRAL" desc="Model razpršitve, ki loči prispevek kurišč in prometa." />
              <Glossary term="Ozadje" desc="Regionalni/sekundarni delci, ki jih občinski ukrepi ne morejo zmanjšati." />
              <Glossary term="€ / µg/m³" desc="Strošek znižanja koncentracije za 1 µg/m³ — merilo učinkovitosti." />
            </dl>
          </Section>

          <div className="pt-4">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-card transition hover:bg-brand-700"
            >
              <ArrowLeft className="h-4 w-4" /> Nazaj na nadzorno ploščo
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}

function Section({ id, icon, title, children }: { id: string; icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-3 flex items-center gap-2 text-xl font-bold tracking-tight text-slate-800">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          {icon}
        </span>
        {title}
      </h2>
      <div className="space-y-2 leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50 p-3.5 text-sm text-slate-700">
      {children}
    </div>
  );
}

function Def({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-card">
      <div className="mb-0.5 font-semibold text-slate-800">{term}</div>
      <div className="text-sm text-slate-600">{children}</div>
    </div>
  );
}

function Bullet({ icon, name, children }: { icon: ReactNode; name: string; children: ReactNode }) {
  return (
    <li className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-card">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="text-sm text-slate-600">
        <b className="text-slate-800">{name}</b> — {children}
      </span>
    </li>
  );
}

function Glossary({ term, desc }: { term: string; desc: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:gap-4">
      <dt className="w-40 shrink-0 font-semibold text-slate-800">{term}</dt>
      <dd className="text-sm text-slate-600">{desc}</dd>
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[12px] font-medium text-slate-700">
      {children}
    </span>
  );
}
