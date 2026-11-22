import { useState } from "react";
import { Sparkles, Check, TrendingDown } from "lucide-react";
import { api } from "../api";
import { useStore } from "../store";
import type { OptimizeResult } from "../types";
import { eur, num } from "../lib";

export function Optimizer() {
  const budget = useStore((s) => s.params.budget_eur);
  const dieselCount = useStore((s) => s.params.diesel_cars_replaced);
  const applyParams = useStore((s) => s.applyParams);
  const [recommendation, setRecommendation] = useState<OptimizeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const res = recommendation?.budget_eur === budget && recommendation.diesel_cars_replaced === dieselCount
    ? recommendation
    : null;

  const run = async () => {
    setLoading(true);
    try {
      setRecommendation(await api.optimize(budget, dieselCount));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Poišči kombinacijo ukrepov z največjim znižanjem PM2.5 znotraj proračuna{" "}
          <span className="font-semibold text-brand-600">{eur(budget)}</span>.
          {dieselCount > 0 && " Izbrano število zamenjav dizlov je fiksno. Učinek predpostavlja vožnje v MOL."}
        </p>
        <button
          onClick={run}
          disabled={loading}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-gradient-to-r from-brand-600 to-teal-600 px-3 py-2 text-sm font-medium text-white shadow-card transition hover:brightness-105 disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4" />
          {loading ? "Optimiziram …" : "Optimiziraj"}
        </button>
      </div>

      {!res && !loading && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 text-center text-sm text-slate-400">
          <TrendingDown className="h-8 w-8 text-slate-300" />
          Zaženi optimizacijo za priporočeni nabor ukrepov.
        </div>
      )}

      {res?.best && (
        <div className="animate-fade-in rounded-xl border border-brand-200 bg-brand-50 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-brand-700">
            <Sparkles className="h-4 w-4" /> Priporočeni scenarij
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Mini label="e-busi" v={`${res.best.params.electric_bus_pct ?? 0}%`} />
            <Mini label="kurišč" v={num(res.best.params.wood_systems_replaced ?? 0, 0)} />
            <Mini label="pred 1980" v={`${res.best.params.pre1980_retrofit_pct ?? 0}%`} />
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="font-semibold text-brand-700">
              -{num(Math.abs(res.best.delta_pm25))} µg/m³ PM2.5
            </span>
            <span className="text-slate-500">{eur(res.best.cost)}</span>
          </div>
          <button
            onClick={() => applyParams(res.best!.params)}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 py-1.5 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            <Check className="h-4 w-4" /> Uporabi ta scenarij
          </button>
        </div>
      )}

      {res && !res.best && (
        <p className="text-xs text-amber-700">Izbrane zamenjave dizlov presegajo proračun.</p>
      )}

      {res && (
        <div className="min-h-0 flex-1 overflow-auto">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Učinkovitost posameznih ukrepov
          </div>
          <div className="space-y-1.5">
            {res.single_levers.map((l, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs">
                <span className="font-medium text-slate-700">{l.label}</span>
                <span className="text-slate-500">
                  -{num(Math.abs(l.delta_pm25))} µg/m³ · {l.eur_per_ug_m3 ? eur(l.eur_per_ug_m3) + "/µg" : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Mini({ label, v }: { label: string; v: string }) {
  return (
    <div className="rounded-lg bg-white/70 py-1.5">
      <div className="text-sm font-bold text-brand-700">{v}</div>
      <div className="text-[10px] text-slate-400">{label}</div>
    </div>
  );
}
