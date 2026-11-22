import { useEffect, useState } from "react";
import { Bus, Flame, Car, Building2, ArrowDownRight, Loader2 } from "lucide-react";
import { useStore } from "../store";
import type { SimParams } from "../types";
import { eur, int, num } from "../lib";

interface LeverDef {
  key: keyof SimParams;
  label: string;
  icon: React.ReactNode;
  min: number;
  max: number;
  step: number;
  unit: string;
  /** what the current value means in concrete terms (shown only when > 0) */
  impact?: string;
  /** cost of this lever at current value (shown only when > 0) */
  cost?: number;
  /** muted context shown at zero instead of impact/cost */
  idle: string;
}

/** Number input that lets the user type freely and clamps on blur/enter. */
function ValueInput({ d, v }: { d: LeverDef; v: number }) {
  const setParam = useStore((s) => s.setParam);
  const [draft, setDraft] = useState(String(v));
  useEffect(() => setDraft(String(v)), [v]);
  const commit = () => {
    const n = Math.max(d.min, Math.min(d.max, Math.round((Number(draft) || 0) / d.step) * d.step));
    setParam(d.key, n);
    setDraft(String(n));
  };
  return (
    <label className="flex shrink-0 items-baseline gap-1 rounded-md border border-transparent px-1.5 py-0.5 transition hover:border-slate-200 focus-within:border-brand-400 focus-within:bg-white">
      <input
        type="number"
        inputMode="numeric"
        aria-label={d.label}
        value={draft}
        min={d.min}
        max={d.max}
        step={d.step}
        disabled={d.max === d.min}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
        className="w-[6ch] bg-transparent text-right text-[13px] font-semibold tabular-nums text-slate-800 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="w-[3.2ch] text-[10px] font-medium text-slate-400">{d.unit}</span>
    </label>
  );
}

function Lever({ d }: { d: LeverDef }) {
  const v = useStore((s) => s.params[d.key]);
  const setParam = useStore((s) => s.setParam);
  const pct = d.max > d.min ? ((v - d.min) / (d.max - d.min)) * 100 : 0;
  const active = v > 0;

  return (
    <div className="py-2 first:pt-0 last:pb-0">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition ${
            active ? "bg-brand-50" : "bg-slate-50"
          }`}
        >
          {d.icon}
        </span>
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-slate-700" title={d.label}>
          {d.label}
        </span>
        <ValueInput d={d} v={v} />
      </div>

      <div className="mt-1 pl-8">
        <input
          type="range"
          aria-label={d.label}
          aria-valuetext={`${int(v)} ${d.unit}`}
          min={d.min}
          max={d.max}
          step={d.step}
          value={v}
          disabled={d.max === d.min}
          onChange={(e) => setParam(d.key, Number(e.target.value))}
          style={{ background: `linear-gradient(90deg,#4fae60 ${pct}%, #e2e8f0 ${pct}%)` }}
          className="block w-full"
        />
        <div className="mt-1 flex h-3.5 items-center justify-between gap-2 text-[11px] leading-none">
          {active ? (
            <>
              <span className="truncate text-slate-500" title={d.impact}>{d.impact}</span>
              {d.cost !== undefined && d.cost > 0 && (
                <span className="shrink-0 font-semibold tabular-nums text-slate-700">{eur(d.cost)}</span>
              )}
            </>
          ) : (
            <span className="truncate text-slate-400">{d.idle}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Combined effect of all levers — ties the controls to the simulation output. */
function Summary() {
  const result = useStore((s) => s.result);
  const simulating = useStore((s) => s.simulating);
  const pollutant = useStore((s) => s.pollutant);
  if (!result) return null;
  const before = pollutant === "pm25" ? result.municipality_pm25_before : result.municipality_pm10_before;
  const after = pollutant === "pm25" ? result.municipality_pm25_after : result.municipality_pm10_after;
  const delta = after - before;
  const pctDelta = before ? (delta / before) * 100 : 0;
  const total = result.cost.total_cost;
  const any = total > 0 || Math.abs(delta) > 1e-6;

  return (
    <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-2 text-[11px]">
      <div className="flex min-w-0 items-center gap-1.5">
        {simulating ? (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-slate-400" />
        ) : (
          <ArrowDownRight className={`h-3.5 w-3.5 shrink-0 ${any ? "text-brand-600" : "text-slate-300"}`} />
        )}
        <span className="truncate text-slate-500">
          {any ? (
            <>
              {pollutant === "pm25" ? "PM₂.₅" : "PM₁₀"}{" "}
              <b className="font-semibold tabular-nums text-brand-700">
                {delta <= 0 ? "−" : "+"}
                {num(Math.abs(delta), 2)} µg/m³
              </b>{" "}
              <span className="tabular-nums">({num(Math.abs(pctDelta))}%)</span>
            </>
          ) : (
            "Premaknite drsnik za oceno učinka"
          )}
        </span>
      </div>
      {total > 0 && (
        <span className={`shrink-0 font-semibold tabular-nums ${result.within_budget ? "text-slate-800" : "text-red-600"}`}>
          Skupaj {eur(total)}
        </span>
      )}
    </div>
  );
}

/** All four policy levers in one controls widget. */
export function Sliders() {
  const muni = useStore((s) => s.municipality);
  const result = useStore((s) => s.result);
  const cost = result?.cost;
  const params = useStore((s) => s.params);
  const totalOld = muni?.total_pre_1980_buildings ?? 0;
  const totalWood = muni?.total_wood_systems ?? 14000;
  const retrofittedNow = Math.round((totalOld * params.pre1980_retrofit_pct) / 100);

  const em = result?.params.diesel_cars_replaced === params.diesel_cars_replaced
    ? result.diesel_avoided_kg_per_year
    : undefined;
  const emParts = em
    ? [
        em.pm25_kg > 0 && `PM₂.₅ ${num(em.pm25_kg)}`,
        em.pm10_kg > 0 && `PM₁₀ ${num(em.pm10_kg)}`,
        em.nox_kg > 0 && `NOₓ ${num(em.nox_kg)}`,
      ].filter(Boolean)
    : [];

  const defs: LeverDef[] = [
    {
      key: "electric_bus_pct",
      label: "Elektrifikacija avtobusov",
      icon: <Bus className="h-3.5 w-3.5 text-brand-600" />,
      min: 0, max: 100, step: 5, unit: "%",
      impact: cost ? `${int(cost.n_buses)} e-avtobusov` : undefined,
      cost: cost?.bus_cost,
      idle: "Delež mestne flote na elektriko",
    },
    {
      key: "wood_systems_replaced",
      label: "Zamenjava kurišč na trda goriva",
      icon: <Flame className="h-3.5 w-3.5 text-orange-500" />,
      min: 0, max: totalWood, step: 100, unit: "kos",
      impact: `${num((params.wood_systems_replaced / Math.max(1, totalWood)) * 100, 0)}% kurišč → toplotne črpalke`,
      cost: cost?.wood_cost,
      idle: `${int(totalWood)} kurišč v občini`,
    },
    {
      key: "diesel_cars_replaced",
      label: "Zamenjava dizlov EURO 4",
      icon: <Car className="h-3.5 w-3.5 text-sky-500" />,
      min: 0, max: muni?.diesel_fleet_limit ?? 0, step: 1, unit: "voz",
      impact: emParts.length ? `−${emParts.join(" · ")} kg/leto` : "Računam emisije …",
      cost: muni ? params.diesel_cars_replaced * muni.diesel_subsidy_eur : undefined,
      idle: muni ? `Subvencija ${int(muni.diesel_subsidy_eur)} € / vozilo` : "",
    },
    {
      key: "pre1980_retrofit_pct",
      label: "Energetska obnova stavb pred 1980",
      icon: <Building2 className="h-3.5 w-3.5 text-amber-600" />,
      min: 0, max: 100, step: 5, unit: "%",
      impact: `${int(retrofittedNow)} obnovljenih stavb`,
      cost: cost?.retrofit_cost,
      idle: totalOld ? `${int(totalOld)} stavb pred 1980` : "Izolacija starejšega sklada",
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="divide-y divide-slate-100">
        {defs.map((d) => (
          <Lever key={d.key} d={d} />
        ))}
      </div>
      <Summary />
    </div>
  );
}
