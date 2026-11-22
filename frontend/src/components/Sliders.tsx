import { Bus, Flame, Car, Building2 } from "lucide-react";
import { useStore } from "../store";
import type { SimParams } from "../types";
import { eur, int, num } from "../lib";

interface SliderDef {
  key: keyof SimParams;
  label: string;
  icon: React.ReactNode;
  min: number;
  max: number;
  step: number;
  fmt: (v: number) => string;
  hint: string;
  rangeOnly?: boolean;
  detail?: string;
}

function Slider({ d }: { d: SliderDef }) {
  const v = useStore((s) => s.params[d.key]);
  const setParam = useStore((s) => s.setParam);
  const pct = d.max > d.min ? ((v - d.min) / (d.max - d.min)) * 100 : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
          {d.icon}
          {d.label}
        </span>
        {d.rangeOnly ? (
          <output className="whitespace-nowrap text-right text-sm font-semibold tabular-nums text-brand-600">
            {d.fmt(v)}
          </output>
        ) : <input
          type="number"
          value={v}
          min={d.min}
          max={d.max}
          step={d.step}
          onChange={(e) => setParam(d.key, Math.max(d.min, Math.min(d.max, Number(e.target.value) || 0)))}
          className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-right text-sm tabular-nums outline-none focus:border-brand-400"
        />}
      </div>
      <input
        type="range"
        aria-label={d.label}
        aria-valuetext={d.fmt(v)}
        min={d.min}
        max={d.max}
        step={d.step}
        value={v}
        disabled={d.max === d.min}
        onChange={(e) => setParam(d.key, Number(e.target.value))}
        style={{ background: `linear-gradient(90deg,#4fae60 ${pct}%, #e2e8f0 ${pct}%)` }}
        className="w-full"
      />
      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
        <span>{d.hint}</span>
        {!d.rangeOnly && <span className="font-semibold text-brand-600">{d.fmt(v)}</span>}
      </div>
      {d.detail && <div className="mt-1 text-xs text-slate-600">{d.detail}</div>}
    </div>
  );
}

/** All four policy levers in one controls widget. */
export function Sliders() {
  const muni = useStore((s) => s.municipality);
  const cost = useStore((s) => s.result?.cost);
  const result = useStore((s) => s.result);
  const dieselCount = useStore((s) => s.params.diesel_cars_replaced);
  const retrofitPct = useStore((s) => s.params.pre1980_retrofit_pct);
  const totalOld = muni?.total_pre_1980_buildings ?? 0;
  const retrofittedNow = Math.round((totalOld * retrofitPct) / 100);
  const emissions = result?.params.diesel_cars_replaced === dieselCount
    ? result.diesel_avoided_kg_per_year
    : undefined;

  const defs: SliderDef[] = [
    {
      key: "electric_bus_pct",
      label: "Elektrifikacija avtobusov",
      icon: <Bus className="h-4 w-4 text-brand-600" />,
      min: 0, max: 100, step: 5,
      fmt: (v) => `${v}%`,
      hint: cost ? `${cost.n_buses} e-busov · ${eur(cost.bus_cost)}` : "",
    },
    {
      key: "wood_systems_replaced",
      label: "Zamenjava kurišč na trda goriva",
      icon: <Flame className="h-4 w-4 text-orange-500" />,
      min: 0, max: muni?.total_wood_systems ?? 14000, step: 100,
      fmt: (v) => int(v),
      hint: cost ? `s toplotnimi črpalkami · ${eur(cost.wood_cost)}` : "",
    },
    {
      key: "diesel_cars_replaced",
      label: "Zamenjava dizlov EURO 4",
      icon: <Car className="h-4 w-4 text-sky-500" />,
      min: 0, max: muni?.diesel_fleet_limit ?? 0, step: 1,
      fmt: (v) => `${int(v)} vozil`,
      rangeOnly: true,
      hint: muni ? `${int(muni.diesel_subsidy_eur)} €/vozilo · ${eur(dieselCount * muni.diesel_subsidy_eur)} subvencij` : "",
      detail: emissions
        ? `Preprečene emisije (kg/leto) · NOₓ ${num(emissions.nox_kg)} · PM₂.₅ ${num(emissions.pm25_kg)} · PM₁₀ ${num(emissions.pm10_kg)}`
        : "Ocena preprečenih emisij (kg/leto)",
    },
    {
      key: "pre1980_retrofit_pct",
      label: "Energetska obnova stavb pred 1980",
      icon: <Building2 className="h-4 w-4 text-amber-600" />,
      min: 0, max: 100, step: 5,
      fmt: (v) => `${v}%`,
      hint: cost
        ? `${int(retrofittedNow)} stavb · ${eur(cost.retrofit_cost)}`
        : totalOld
        ? `${int(totalOld)} starih stavb skupno`
        : "izolacija starejšega sklada",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {defs.map((d) => (
        <Slider key={d.key} d={d} />
      ))}
    </div>
  );
}
