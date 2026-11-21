import { BookOpen, Download, MapPin, RotateCcw } from "lucide-react";
import { useStore } from "../store";
import { SearchableSelect } from "./SearchableSelect";
import { exportSummary } from "../lib/export";

/** Simplified ZrakVizija mark (leaf + hills) that stays crisp at ~36px. */
function BrandIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="zi-leaf" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EEF6FA" />
          <stop offset="0.45" stopColor="#B8DCEA" />
          <stop offset="1" stopColor="#7FC98A" />
        </linearGradient>
        <linearGradient id="zi-hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A9DCA0" />
          <stop offset="1" stopColor="#4FAE60" />
        </linearGradient>
        <linearGradient id="zi-hill2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D6EED0" />
          <stop offset="1" stopColor="#93D193" />
        </linearGradient>
      </defs>
      <path d="M2 74 C 34 60, 68 58, 98 72 L98 100 L2 100 Z" fill="url(#zi-hill2)" />
      <path d="M2 82 C 40 67, 74 74, 98 88 L98 100 L2 100 Z" fill="url(#zi-hill)" />
      <path d="M27 87 C 12 50, 42 16, 86 14 C 86 54, 60 86, 27 87 Z" fill="url(#zi-leaf)" />
      <path d="M33 81 C 49 55, 65 40, 80 25" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.82" />
    </svg>
  );
}

export function Topbar() {
  const municipality = useStore((s) => s.municipality);
  const selected = useStore((s) => s.selectedDistrict);
  const selectDistrict = useStore((s) => s.selectDistrict);
  const resetParams = useStore((s) => s.resetParams);
  const result = useStore((s) => s.result);
  const simulating = useStore((s) => s.simulating);

  const districtOpts =
    municipality?.districts
      .slice()
      .sort((a, b) => b.pm25_winter - a.pm25_winter)
      .map((d) => ({
        value: d.cs_ime,
        label: d.cs_ime,
        sub: `${d.pm25_winter} µg/m³`,
      })) ?? [];

  return (
    <header className="sticky top-0 z-[1000] border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-2.5">
        {/* brand — horizontal lockup, left aligned */}
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-100 bg-gradient-to-br from-white to-brand-50 shadow-card">
            <BrandIcon className="h-8 w-8" />
          </span>
          <span className="text-[22px] font-semibold leading-none tracking-tight text-ink">
            ZrakVizija
          </span>
        </div>

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        <SearchableSelect
          value={selected}
          options={[{ value: "__all__", label: "Vsa občina", sub: "agregat" }, ...districtOpts]}
          onChange={(v) => selectDistrict(v === "__all__" ? null : v)}
          icon={<MapPin className="h-4 w-4 text-teal-500" />}
          placeholder="Vsa občina"
          width="w-60"
        />

        <div className="ml-auto flex items-center gap-2">
          <span
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
              simulating ? "bg-amber-50 text-amber-600" : "bg-brand-50 text-brand-600"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${simulating ? "bg-amber-500 animate-pulse" : "bg-brand-500"}`} />
            {simulating ? "Računam …" : "Simulacija v živo"}
          </span>
          <a
            href="/docs"
            target="_blank"
            rel="noopener noreferrer"
            title="Navodila"
            aria-label="Navodila"
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50"
          >
            <BookOpen className="h-4 w-4" />
          </a>
          <button
            onClick={resetParams}
            title="Ponastavi"
            aria-label="Ponastavi"
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => result && exportSummary(result, selected)}
            disabled={!result}
            title="Izvozi povzetek"
            aria-label="Izvozi povzetek"
            className="flex items-center justify-center rounded-xl bg-brand-600 p-2 text-white shadow-card transition hover:bg-brand-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
