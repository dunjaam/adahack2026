import { Wallet } from "lucide-react";
import { useStore } from "../store";
import { eur } from "../lib";

/** Compact, secondary budget readout — neutral styling, subtle over-budget hint. */
export function BudgetCard() {
  const budget = useStore((s) => s.params.budget_eur);
  const setParam = useStore((s) => s.setParam);
  const cost = useStore((s) => s.result?.cost);
  if (!cost) return <div className="text-slate-400">—</div>;

  const pct = budget > 0 ? Math.min(100, (cost.total_cost / budget) * 100) : 0;
  const over = budget > 0 && cost.total_cost > budget;

  return (
    <div className="flex h-full w-full flex-col justify-center gap-2.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <Wallet className="h-3.5 w-3.5" /> Strošek ukrepov
        </span>
        <span className="text-base font-semibold tabular-nums text-slate-700">
          {eur(cost.total_cost)}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${over ? "bg-amber-400" : "bg-slate-300"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs text-slate-400">
          proračun
          <span className="flex items-center rounded-md border border-slate-200 px-1.5 py-0.5 focus-within:border-slate-300">
            <span className="mr-0.5 text-slate-400">€</span>
            <input
              type="number"
              min={0}
              step={100_000}
              value={budget}
              onChange={(e) => setParam("budget_eur", Math.max(0, Number(e.target.value) || 0))}
              className="w-24 text-right text-xs tabular-nums text-slate-600 outline-none"
            />
          </span>
        </label>
        {over && (
          <span className="text-[11px] font-medium text-amber-600">presega za {eur(cost.total_cost - budget)}</span>
        )}
      </div>
    </div>
  );
}
