import { Bus, Flame, Car, Wallet } from "lucide-react";
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

export function Sliders() {
  const params = useStore((s) => s.params);
  const setParam = useStore((s) => s.setParam);
  const muni = useStore((s) => s.municipality);
  const cost = useStore((s) => s.result?.cost);

  const defs: SliderDef[] = [
    {
      key: "electric_bus_pct",
      label: "Elektrifikacija avtobusov",
      icon: <Bus className="h-4 w-4 text-brand-600" />,
      min: 0,
      max: 100,
      step: 5,
      fmt: (v) => `${v}%`,
      hint: cost ? `${cost.n_buses} e-busov · ${eur(cost.bus_cost)}` : "",
    },
    {
      key: "wood_systems_replaced",
      label: "Zamenjava kurišč na trda goriva",
      icon: <Flame className="h-4 w-4 text-orange-500" />,
      min: 0,
      max: muni?.total_wood_systems ?? 14000,
      step: 100,
      fmt: (v) => int(v),
      hint: cost ? `s toplotnimi črpalkami · ${eur(cost.wood_cost)}` : "",
    },
    {
      key: "traffic_reduction_pct",
      label: "Znižanje prometnih emisij",
      icon: <Car className="h-4 w-4 text-sky-500" />,
      min: 0,
      max: 80,
      step: 5,
      fmt: (v) => `${v}%`,
      hint: cost ? `cona, P+R, kolesarjenje · ${eur(cost.traffic_cost)}` : "",
    },
    {
      key: "budget_eur",
      label: "Razpoložljiv proračun",
      icon: <Wallet className="h-4 w-4 text-emerald-600" />,
      min: 0,
      max: 20_000_000,
      step: 100_000,
      fmt: (v) => eur(v),
      hint: "letna investicija občine",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {defs.map((d) => {
        const v = params[d.key];
        const pct = ((v - d.min) / (d.max - d.min)) * 100;
        return (
          <div key={d.key}>
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
                onChange={(e) =>
                  setParam(d.key, Math.max(d.min, Math.min(d.max, Number(e.target.value) || 0)))
                }
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
              style={{
                background: `linear-gradient(90deg,#10b981 ${pct}%, #e2e8f0 ${pct}%)`,
              }}
              className="w-full"
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>{d.hint}</span>
              <span className="font-semibold text-brand-600">{d.fmt(v)}</span>
            </div>
          </div>
        );
      })}

      {cost && (
        <BudgetBar total={cost.total_cost} budget={params.budget_eur} />
      )}
    </div>
  );
}

function BudgetBar({ total, budget }: { total: number; budget: number }) {
  const pct = budget > 0 ? Math.min(100, (total / budget) * 100) : 0;
  const over = budget > 0 && total > budget;
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">Poraba proračuna</span>
        <span className={`font-semibold ${over ? "text-red-600" : "text-brand-600"}`}>
          {eur(total)} / {eur(budget)}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-300 ${over ? "bg-red-500" : "bg-brand-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {over && (
        <div className="mt-1.5 text-[11px] font-medium text-red-600">
          ⚠️ Ukrepi presegajo proračun za {eur(total - budget)}
        </div>
      )}
    </div>
  );
}
