import { useStore } from "../store";
import { ArrowDownRight, ArrowRight, Coins, Wind } from "lucide-react";
import { eur, num, Badge } from "../lib";

export function Kpis() {
  const result = useStore((s) => s.result);
  const pollutant = useStore((s) => s.pollutant);
  const selected = useStore((s) => s.selectedDistrict);
  if (!result) return <div className="text-slate-400">—</div>;

  const focus = selected ? result.districts.find((d) => d.cs_ime === selected) : null;
  const before = focus
    ? pollutant === "pm25"
      ? focus.pm25_before
      : focus.pm10_before
    : pollutant === "pm25"
    ? result.municipality_pm25_before
    : result.municipality_pm10_before;
  const after = focus
    ? pollutant === "pm25"
      ? focus.pm25_after
      : focus.pm10_after
    : pollutant === "pm25"
    ? result.municipality_pm25_after
    : result.municipality_pm10_after;
  const deltaPct = before ? ((after - before) / before) * 100 : 0;

  const cards = [
    {
      label: `${pollutant.toUpperCase()} ${selected ? `· ${selected}` : "· vsa občina"}`,
      icon: <Wind className="h-4 w-4 text-brand-600" />,
      main: (
        <span className="flex items-baseline gap-1.5">
          <span className="text-slate-400 line-through decoration-slate-300">{num(before)}</span>
          <ArrowRight className="h-4 w-4 text-slate-300" />
          <span className="text-2xl font-bold text-brand-700">{num(after)}</span>
          <span className="text-xs text-slate-400">µg/m³</span>
        </span>
      ),
      sub: (
        <span className={`flex items-center gap-1 ${deltaPct < 0 ? "text-brand-600" : "text-slate-400"}`}>
          <ArrowDownRight className="h-3.5 w-3.5" />
          {num(deltaPct)}% {deltaPct < 0 ? "čistejši zrak" : "brez spremembe"}
        </span>
      ),
    },
    {
      label: "Skupna investicija",
      icon: <Coins className="h-4 w-4 text-emerald-600" />,
      main: <span className="text-2xl font-bold text-slate-800">{eur(result.cost.total_cost)}</span>,
      sub: (
        <span className={result.within_budget ? "text-brand-600" : "text-red-500"}>
          {result.within_budget ? "znotraj proračuna" : "presega proračun"}
        </span>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {cards.map((c, i) => (
        <div
          key={i}
          className="animate-pop rounded-2xl border border-slate-200 bg-white p-3.5 shadow-card"
        >
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            {c.icon}
            <span className="truncate">{c.label}</span>
          </div>
          <div>{c.main}</div>
          <div className="mt-1 text-xs">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}

export function DataNote() {
  return (
    <div className="flex min-w-0 items-center gap-4">
      <Badge kind="measured">Meritev ARSO</Badge>
      <Badge kind="model">Modelska ocena</Badge>
      <span className="truncate text-2xs text-ink-3">
        Izhodišče PM₂.₅: zimsko sidro 2025/26 · podatki ADA Hack 2026
      </span>
    </div>
  );
}
