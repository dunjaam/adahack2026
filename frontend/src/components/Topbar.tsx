import { BookOpen, Download, MapPin, RotateCcw } from "lucide-react";
import { useStore } from "../store";
import { SearchableSelect } from "./SearchableSelect";
import { exportSummary } from "../lib/export";
import { IconButton } from "../lib";

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
    <header className="z-[1000] shrink-0 bg-paper">
      <div className="flex h-16 items-center gap-5 px-5">
        {/* brand */}
        <div className="flex items-center gap-3">
          <BrandIcon className="h-8 w-8" />
          <div className="flex flex-col leading-none">
            <span className="text-lg font-semibold leading-6 text-on-surface">ZrakVizija</span>
            <span className="hidden text-xs text-on-surface-variant md:block">Okoljski digitalni dvojček Ljubljane</span>
          </div>
        </div>

        <SearchableSelect
          value={selected}
          options={[{ value: "__all__", label: "Vsa občina", sub: "skupaj" }, ...districtOpts]}
          onChange={(v) => selectDistrict(v === "__all__" ? null : v)}
          icon={<MapPin className="h-4 w-4 text-on-surface-variant" />}
          placeholder="Vsa občina"
          width="w-64"
        />

        <div className="ml-auto flex items-center gap-1">
          <span
            className="mr-2 hidden h-8 items-center gap-2 rounded-lg bg-surface-container-high px-3 text-xs font-medium text-on-surface-variant sm:flex"
            aria-live="polite"
          >
            <span
              className={`h-2 w-2 rounded-full transition-colors ${simulating ? "animate-pulse bg-primary-300" : "bg-secondary"}`}
            />
            {simulating ? "Računam …" : "Simulacija v živo"}
          </span>
          <a
            href="/docs"
            target="_blank"
            rel="noopener noreferrer"
            title="Navodila"
            aria-label="Navodila"
            className="state flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <BookOpen className="h-5 w-5" strokeWidth={1.75} />
          </a>
          <IconButton onClick={resetParams} title="Ponastavi ukrepe" aria-label="Ponastavi ukrepe" className="h-10 w-10">
            <RotateCcw className="h-5 w-5" strokeWidth={1.75} />
          </IconButton>
          <button
            onClick={() => result && exportSummary(result, selected)}
            disabled={!result}
            title="Izvozi povzetek"
            className="state ml-2 flex h-10 items-center gap-2 rounded-full bg-primary pl-4 pr-5 text-sm font-medium text-on-primary transition-shadow hover:shadow-e1 disabled:opacity-40"
          >
            <Download className="h-[18px] w-[18px]" strokeWidth={2} />
            Izvozi
          </button>
        </div>
      </div>
    </header>
  );
}
