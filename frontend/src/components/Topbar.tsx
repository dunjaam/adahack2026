import { BookOpen, Download, MapPin, RotateCcw, Wind } from "lucide-react";
import { useStore } from "../store";
import { SearchableSelect } from "./SearchableSelect";
import { exportSummary } from "../lib/export";

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
      <div className="flex flex-wrap items-center gap-3 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-teal-600 text-white shadow-card">
            <Wind className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-bold tracking-tight text-slate-800">AirShift</div>
            <div className="text-[11px] text-slate-400">Simulate Change. See the Impact.</div>
          </div>
        </div>

        <div className="mx-1 hidden h-8 w-px bg-slate-200 sm:block" />

        <SearchableSelect
          value={selected}
          options={[{ value: "__all__", label: "Vsa občina", sub: "agregat" }, ...districtOpts]}
          onChange={(v) => selectDistrict(v === "__all__" ? null : v)}
          icon={<MapPin className="h-4 w-4 text-teal-500" />}
          placeholder="Vsa občina"
          width="w-60"
        />

        <div className="ml-auto flex items-center gap-2 self-end">
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
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <BookOpen className="h-4 w-4" /> Navodila
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
