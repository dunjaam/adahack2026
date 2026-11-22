import { useEffect, useState } from "react";
import { Bus, Flame, Car, Building2 } from "lucide-react";
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

/** M3 outlined text field (dense): type freely, clamps + snaps to step on blur/enter. */
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
    <label className="flex h-8 shrink-0 items-center gap-1 rounded-md border border-outline-variant bg-surface px-2 transition-colors hover:border-on-surface-variant focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
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
        className="num w-[6ch] bg-transparent text-right text-sm font-medium text-on-surface outline-none"
      />
      <span className="text-xs text-on-surface-variant">{d.unit}</span>
    </label>
  );
}

function Lever({ d }: { d: LeverDef }) {
  const v = useStore((s) => s.params[d.key]);
  const setParam = useStore((s) => s.setParam);
  const pct = d.max > d.min ? ((v - d.min) / (d.max - d.min)) * 100 : 0;
  const active = v > 0;

  return (
    <div className="py-3 first:pt-0 last:pb-0 [@media(max-height:800px)]:py-2">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
            active ? "bg-primary-container text-on-primary-container" : "bg-surface-container-high text-on-surface-variant"
          }`}
        >
          {d.icon}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-on-surface" title={d.label}>
          {d.label}
        </span>
        <ValueInput d={d} v={v} />
      </div>

      <div className="pl-11">
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
          style={{ ["--pct" as any]: `${pct}%` }}
          className="m3-slider block"
        />
        <div className="flex min-h-[18px] items-baseline justify-between gap-3 text-xs">
          {active ? (
            <>
              <span className="truncate text-on-surface-variant" title={d.impact}>{d.impact}</span>
              {d.cost !== undefined && d.cost > 0 && (
                <span className="num shrink-0 font-medium text-on-surface">{eur(d.cost)}</span>
              )}
            </>
          ) : (
            <span className="truncate text-on-surface-muted">{d.idle}</span>
          )}
        </div>
      </div>
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
      icon: <Bus className="h-4 w-4" strokeWidth={1.75} />,
      min: 0, max: 100, step: 5, unit: "%",
      impact: cost ? `${int(cost.n_buses)} e-avtobusov` : undefined,
      cost: cost?.bus_cost,
      idle: "Delež mestne flote na elektriko",
    },
    {
      key: "wood_systems_replaced",
      label: "Zamenjava kurišč na trda goriva",
      icon: <Flame className="h-4 w-4" strokeWidth={1.75} />,
      min: 0, max: totalWood, step: 100, unit: "kos",
      impact: `${num((params.wood_systems_replaced / Math.max(1, totalWood)) * 100, 0)}% kurišč → toplotne črpalke`,
      cost: cost?.wood_cost,
      idle: `${int(totalWood)} kurišč v občini`,
    },
    {
      key: "diesel_cars_replaced",
      label: "Zamenjava dizlov EURO 4",
      icon: <Car className="h-4 w-4" strokeWidth={1.75} />,
      min: 0, max: muni?.diesel_fleet_limit ?? 0, step: 1, unit: "voz",
      impact: emParts.length ? `−${emParts.join(" · ")} kg/leto` : "Računam emisije …",
      cost: muni ? params.diesel_cars_replaced * muni.diesel_subsidy_eur : undefined,
      idle: muni ? `Subvencija ${int(muni.diesel_subsidy_eur)} € / vozilo` : "",
    },
    {
      key: "pre1980_retrofit_pct",
      label: "Energetska obnova stavb pred 1980",
      icon: <Building2 className="h-4 w-4" strokeWidth={1.75} />,
      min: 0, max: 100, step: 5, unit: "%",
      impact: `${int(retrofittedNow)} obnovljenih stavb`,
      cost: cost?.retrofit_cost,
      idle: totalOld ? `${int(totalOld)} stavb pred 1980` : "Izolacija starejšega sklada",
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="divide-y divide-surface-container-high">
        {defs.map((d) => (
          <Lever key={d.key} d={d} />
        ))}
      </div>
    </div>
  );
}
