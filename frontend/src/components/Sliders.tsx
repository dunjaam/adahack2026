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

/** Mono value field: type freely, clamps + snaps to step on blur/enter. */
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
    <label className="flex h-6 shrink-0 items-center rounded border border-line bg-paper/60 pr-1.5 transition hover:border-ink-3 focus-within:border-accent-500 focus-within:bg-surface">
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
        className="num w-[6.5ch] bg-transparent pr-1 text-right text-sm font-medium text-ink outline-none"
      />
      <span className="num w-[3ch] text-2xs text-ink-3">{d.unit}</span>
    </label>
  );
}

/** Tick scale under the track; inset by half the cursor width so ticks align with values. */
function Ticks({ n = 10 }: { n?: number }) {
  return (
    <div className="pointer-events-none flex justify-between px-[4px] [@media(max-height:760px)]:hidden">
      {Array.from({ length: n + 1 }, (_, i) => (
        <span key={i} className={`w-px ${i % 5 === 0 ? "h-[5px] bg-ink-3/60" : "h-[3px] bg-line"}`} />
      ))}
    </div>
  );
}

function Lever({ d, index }: { d: LeverDef; index: number }) {
  const v = useStore((s) => s.params[d.key]);
  const setParam = useStore((s) => s.setParam);
  const pct = d.max > d.min ? ((v - d.min) / (d.max - d.min)) * 100 : 0;
  const active = v > 0;

  return (
    <div className="grid grid-cols-[18px_1fr] gap-x-2 py-2 first:pt-0.5 last:pb-1 [@media(max-height:800px)]:py-1">
      <span className={`num pt-[3px] text-2xs ${active ? "text-accent-600" : "text-ink-3"}`}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={`shrink-0 ${active ? "text-ink" : "text-ink-3"}`}>{d.icon}</span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink" title={d.label}>
            {d.label}
          </span>
          <ValueInput d={d} v={v} />
        </div>

        <div className="mt-1">
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
            className="instrument block"
          />
          <Ticks />
        </div>

        <div className="mt-0.5 flex h-4 items-baseline justify-between gap-3 text-xs">
          {active ? (
            <>
              <span className="truncate text-ink-2" title={d.impact}>{d.impact}</span>
              {d.cost !== undefined && d.cost > 0 && (
                <span className="num shrink-0 font-medium text-ink">{eur(d.cost)}</span>
              )}
            </>
          ) : (
            <span className="truncate text-ink-3">{d.idle}</span>
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
      icon: <Bus className="h-3.5 w-3.5" strokeWidth={1.75} />,
      min: 0, max: 100, step: 5, unit: "%",
      impact: cost ? `${int(cost.n_buses)} e-avtobusov` : undefined,
      cost: cost?.bus_cost,
      idle: "Delež mestne flote na elektriko",
    },
    {
      key: "wood_systems_replaced",
      label: "Zamenjava kurišč na trda goriva",
      icon: <Flame className="h-3.5 w-3.5" strokeWidth={1.75} />,
      min: 0, max: totalWood, step: 100, unit: "kos",
      impact: `${num((params.wood_systems_replaced / Math.max(1, totalWood)) * 100, 0)}% kurišč → toplotne črpalke`,
      cost: cost?.wood_cost,
      idle: `${int(totalWood)} kurišč v občini`,
    },
    {
      key: "diesel_cars_replaced",
      label: "Zamenjava dizlov EURO 4",
      icon: <Car className="h-3.5 w-3.5" strokeWidth={1.75} />,
      min: 0, max: muni?.diesel_fleet_limit ?? 0, step: 1, unit: "voz",
      impact: emParts.length ? `−${emParts.join(" · ")} kg/leto` : "Računam emisije …",
      cost: muni ? params.diesel_cars_replaced * muni.diesel_subsidy_eur : undefined,
      idle: muni ? `Subvencija ${int(muni.diesel_subsidy_eur)} € / vozilo` : "",
    },
    {
      key: "pre1980_retrofit_pct",
      label: "Energetska obnova stavb pred 1980",
      icon: <Building2 className="h-3.5 w-3.5" strokeWidth={1.75} />,
      min: 0, max: 100, step: 5, unit: "%",
      impact: `${int(retrofittedNow)} obnovljenih stavb`,
      cost: cost?.retrofit_cost,
      idle: totalOld ? `${int(totalOld)} stavb pred 1980` : "Izolacija starejšega sklada",
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="divide-y divide-line-2">
        {defs.map((d, i) => (
          <Lever key={d.key} d={d} index={i} />
        ))}
      </div>
    </div>
  );
}
