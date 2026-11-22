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

  const tool =
    "flex h-7 w-7 items-center justify-center rounded-md border border-line bg-surface text-ink-2 transition hover:border-ink-3 hover:text-ink";

  return (
    <header className="z-[1000] shrink-0 border-b border-line bg-surface">
      <div className="flex h-12 items-center gap-4 px-4">
        {/* brand */}
        <div className="flex items-center gap-2.5">
          <BrandIcon className="h-6 w-6" />
          <div className="flex items-baseline gap-2.5">
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-ink">ZrakVizija</span>
            <span className="hidden text-2xs font-medium uppercase tracking-label text-ink-3 md:inline">
              Okoljski digitalni dvojček
            </span>
          </div>
        </div>

        <div className="h-5 w-px bg-line" />

        <SearchableSelect
          value={selected}
          options={[{ value: "__all__", label: "Vsa občina", sub: "agregat" }, ...districtOpts]}
          onChange={(v) => selectDistrict(v === "__all__" ? null : v)}
          icon={<MapPin className="h-3.5 w-3.5 text-ink-3" />}
          placeholder="Vsa občina"
          width="w-56"
        />

        <div className="ml-auto flex items-center gap-1.5">
          <span className="mr-2 flex items-center gap-1.5 text-2xs font-medium uppercase tracking-label text-ink-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${simulating ? "animate-pulse bg-[#B4530F]" : "bg-accent-500"}`}
            />
            {simulating ? "Računam" : "Simulacija v živo"}
          </span>
          <a href="/docs" target="_blank" rel="noopener noreferrer" title="Navodila" aria-label="Navodila" className={tool}>
            <BookOpen className="h-3.5 w-3.5" />
          </a>
          <button onClick={resetParams} title="Ponastavi ukrepe" aria-label="Ponastavi" className={tool}>
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => result && exportSummary(result, selected)}
            disabled={!result}
            title="Izvozi povzetek"
            className="flex h-7 items-center gap-1.5 rounded-md bg-ink px-2.5 text-xs font-medium text-surface transition hover:bg-accent-600 disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            Izvoz
          </button>
        </div>
      </div>
    </header>
  );
}
