import { Minus, Plus } from "lucide-react";
import { useStore } from "../store";
import { eur, int, num } from "../lib";

function letText(y: number) {
  if (!Number.isInteger(y)) return "let";
  if (y === 1) return "leto";
  if (y === 2) return "leti";
  if (y === 3 || y === 4) return "leta";
  return "let";
}

/** Single-row budget: editable amount, spend status, year stepper; spend bar on the bottom edge. */
export function BudgetCard() {
  const budget = useStore((s) => s.params.budget_eur);
  const setParam = useStore((s) => s.setParam);
  const years = useStore((s) => s.years);
  const setYears = useStore((s) => s.setYears);
  const spent = useStore((s) => s.result?.cost.total_cost ?? 0);
  const used = budget > 0 ? Math.min(100, (spent / budget) * 100) : spent > 0 ? 100 : 0;
  const over = spent > budget;

  const step =
    "flex h-5 w-5 items-center justify-center rounded text-ink-3 transition hover:bg-paper hover:text-ink";

  return (
    <div className="relative flex h-full w-full items-center gap-3 pl-4 pr-9">
      <span className="label shrink-0">
        <span className="num mr-2 font-normal text-ink-3">04</span>Proračun
      </span>
      <div className="flex min-w-0 items-baseline gap-1">
        <span className="num text-xs text-ink-3">€</span>
        <input
          type="text"
          inputMode="numeric"
          value={int(budget)}
          aria-label="Proračun v evrih"
          onChange={(e) => setParam("budget_eur", Number(e.target.value.replace(/\D/g, "")) || 0)}
          className="num w-[10ch] min-w-0 bg-transparent text-sm font-medium text-ink outline-none focus:text-accent-700"
        />
      </div>
      <span className={`num min-w-0 flex-1 truncate text-2xs ${over ? "font-semibold text-[#B42318]" : "text-ink-3"}`}>
        {over ? `presežek ${eur(spent - budget)}` : spent > 0 ? `${num(used, 0)}% porabljeno` : ""}
      </span>
      <div className="flex shrink-0 items-center">
        <button onClick={() => setYears(years - 0.5)} className={step} aria-label="−0,5 leta">
          <Minus className="h-3 w-3" />
        </button>
        <span className="num min-w-[6.5ch] text-center text-xs text-ink-2">
          {years.toFixed(1)} {letText(years)}
        </span>
        <button onClick={() => setYears(years + 0.5)} className={step} aria-label="+0,5 leta">
          <Plus className="h-3 w-3" />
        </button>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-line-2">
        <div
          className={`h-full transition-[width] duration-500 ${over ? "bg-[#B42318]" : "bg-accent-500"}`}
          style={{ width: `${used}%` }}
        />
      </div>
    </div>
  );
}
