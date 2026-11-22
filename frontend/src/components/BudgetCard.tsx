import { Minus, Plus } from "lucide-react";
import { useStore } from "../store";
import { eur } from "../lib";

function letText(y: number) {
  if (!Number.isInteger(y)) return "let";
  if (y === 1) return "leto";
  if (y === 2) return "leti";
  if (y === 3 || y === 4) return "leta";
  return "let";
}

/** Compact budget widget: editable budget, year stepper and a spend bar. */
export function BudgetCard() {
  const budget = useStore((s) => s.params.budget_eur);
  const setParam = useStore((s) => s.setParam);
  const years = useStore((s) => s.years);
  const setYears = useStore((s) => s.setYears);
  const spent = useStore((s) => s.result?.cost.total_cost ?? 0);
  const used = budget > 0 ? Math.min(100, (spent / budget) * 100) : spent > 0 ? 100 : 0;
  const over = spent > budget;

  return (
    <div className="flex h-full w-full flex-col justify-center gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-baseline gap-0.5 text-ink">
          <span className="text-sm font-semibold text-slate-300">€</span>
          <input
            type="number"
            min={0}
            step={100_000}
            value={budget}
            aria-label="Proračun v evrih"
            onChange={(e) => setParam("budget_eur", Math.max(0, Number(e.target.value) || 0))}
            className="w-[11ch] min-w-0 bg-transparent text-[20px] font-bold leading-none tracking-tight tabular-nums outline-none focus:text-brand-700 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <div className="flex shrink-0 items-center gap-0.5 text-slate-400">
          <button
            onClick={() => setYears(years - 0.5)}
            className="flex h-5 w-5 items-center justify-center rounded-full transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="−0,5 leta"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[6ch] text-center text-[12px] font-semibold tabular-nums text-slate-600">
            {years.toFixed(1)} {letText(years)}
          </span>
          <button
            onClick={() => setYears(years + 0.5)}
            className="flex h-5 w-5 items-center justify-center rounded-full transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="+0,5 leta"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-[width] duration-500 ${over ? "bg-red-500" : "bg-brand-500"}`}
            style={{ width: `${used}%` }}
          />
        </div>
        <span className={`shrink-0 text-[10.5px] tabular-nums ${over ? "font-semibold text-red-600" : "text-slate-500"}`}>
          {over ? `presežek ${eur(spent - budget)}` : `porabljeno ${eur(spent)}`}
        </span>
      </div>
    </div>
  );
}
