import { Minus, Plus } from "lucide-react";
import { useStore } from "../store";

function letText(y: number) {
  if (!Number.isInteger(y)) return "let";
  if (y === 1) return "leto";
  if (y === 2) return "leti";
  if (y === 3 || y === 4) return "leta";
  return "let";
}

/** Clean budget widget: budget hero + a quiet year stepper. */
export function BudgetCard() {
  const budget = useStore((s) => s.params.budget_eur);
  const setParam = useStore((s) => s.setParam);
  const years = useStore((s) => s.years);
  const setYears = useStore((s) => s.setYears);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <div className="flex items-baseline justify-center gap-1 text-ink">
        <span className="text-2xl font-semibold text-slate-300">€</span>
        <input
          type="number"
          min={0}
          step={100_000}
          value={budget}
          onChange={(e) => setParam("budget_eur", Math.max(0, Number(e.target.value) || 0))}
          className="w-[8.5ch] bg-transparent text-center text-[44px] font-bold leading-none tracking-tight tabular-nums outline-none focus:text-brand-700"
        />
      </div>

      <div className="flex items-center gap-2 text-slate-400">
        <button
          onClick={() => setYears(years - 0.5)}
          className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="−0,5 leta"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="min-w-[4.5ch] text-center text-base font-semibold tabular-nums text-slate-600">
          {years.toFixed(1)} {letText(years)}
        </span>
        <button
          onClick={() => setYears(years + 0.5)}
          className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="+0,5 leta"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
