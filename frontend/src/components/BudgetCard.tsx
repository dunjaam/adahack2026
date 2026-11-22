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

/** Budget-first widget: budget is the hero, with an editable planning period below. */
export function BudgetCard() {
  const budget = useStore((s) => s.params.budget_eur);
  const setParam = useStore((s) => s.setParam);
  const years = useStore((s) => s.years);
  const setYears = useStore((s) => s.setYears);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2.5">
      <div className="text-center">
        <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
          Proračun
        </div>
        <div className="flex items-baseline justify-center gap-1 text-ink">
          <span className="text-2xl font-semibold text-slate-400">€</span>
          <input
            type="number"
            min={0}
            step={100_000}
            value={budget}
            onChange={(e) => setParam("budget_eur", Math.max(0, Number(e.target.value) || 0))}
            className="w-[8.5ch] bg-transparent text-center text-[40px] font-bold leading-none tracking-tight tabular-nums outline-none focus:text-brand-700"
          />
        </div>
      </div>

      <div className="h-px w-5/6 bg-slate-100" />

      <div className="flex items-center gap-3">
        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
          Obdobje
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setYears(years - 0.5)}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            aria-label="−0,5 leta"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-12 text-center text-lg font-bold tabular-nums text-ink">
            {years.toFixed(1)}
          </span>
          <button
            onClick={() => setYears(years + 0.5)}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            aria-label="+0,5 leta"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <span className="text-sm text-slate-400">{letText(years)}</span>
        </div>
      </div>

      <div className="text-xs font-medium text-slate-400">
        ≈ {eur(budget / years)} / leto
      </div>
    </div>
  );
}
