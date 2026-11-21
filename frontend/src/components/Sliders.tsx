import { Bus, Flame, Car } from "lucide-react";
import { useStore } from "../store";
import type { SimParams } from "../types";
import { eur, int } from "../lib";

interface SliderDef {
  key: keyof SimParams;
  label: string;
  icon: React.ReactNode;
  min: number;
  max: number;
  step: number;
  fmt: (v: number) => string;
  hint: string;
}

function Slider({ d }: { d: SliderDef }) {
  const v = useStore((s) => s.params[d.key]);
  const setParam = useStore((s) => s.setParam);
  const pct = ((v - d.min) / (d.max - d.min)) * 100;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
          {d.icon}
          {d.label}
        </span>
        <input
          type="number"
          value={v}
          min={d.min}
          max={d.max}
          step={d.step}
          onChange={(e) => setParam(d.key, Math.max(d.min, Math.min(d.max, Number(e.target.value) || 0)))}
          className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-right text-sm tabular-nums outline-none focus:border-brand-400"
        />
      </div>
      <input
        type="range"
        min={d.min}
        max={d.max}
        step={d.step}
        value={v}
        onChange={(e) => setParam(d.key, Number(e.target.value))}
        style={{ background: `linear-gradient(90deg,#10b981 ${pct}%, #e2e8f0 ${pct}%)` }}
        className="w-full"
      />
      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
        <span>{d.hint}</span>
        <span className="font-semibold text-brand-600">{d.fmt(v)}</span>
      </div>
    </div>
  );
}

/** All four policy levers in one controls widget. */
export function Sliders() {
  const muni = useStore((s) => s.municipality);
  const cost = useStore((s) => s.result?.cost);

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
      key: "traffic_reduction_pct",
      label: "Znižanje prometnih emisij",
      icon: <Car className="h-4 w-4 text-sky-500" />,
      min: 0, max: 80, step: 5,
      fmt: (v) => `${v}%`,
      hint: cost ? `cona, P+R, kolesarjenje · ${eur(cost.traffic_cost)}` : "",
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
