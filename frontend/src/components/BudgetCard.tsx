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
    "state flex h-7 w-7 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-on-surface";

  return (
    <div className="flex h-full w-full flex-col justify-center gap-2 pl-5 pr-12">
      <div className="flex items-center gap-3">
        <span className="shrink-0 text-sm font-medium text-on-surface-variant">Proračun</span>
        <label className="flex min-w-0 items-baseline gap-1 rounded-md px-1 transition-colors focus-within:bg-surface-container-low">
          <span className="text-sm text-on-surface-variant">€</span>
          <input
            type="text"
            inputMode="numeric"
            value={int(budget)}
            aria-label="Proračun v evrih"
            onChange={(e) => setParam("budget_eur", Number(e.target.value.replace(/\D/g, "")) || 0)}
            className="num w-[10ch] min-w-0 bg-transparent text-sm font-medium text-on-surface outline-none"
          />
        </label>
        <span className={`num min-w-0 flex-1 truncate text-xs ${over ? "font-medium text-error" : "text-on-surface-variant"}`}>
          {over ? `Presežek ${eur(spent - budget)}` : spent > 0 ? `${num(used, 0)} % porabljeno` : "Ni še porabe"}
        </span>
        <div className="flex shrink-0 items-center">
          <button onClick={() => setYears(years - 0.5)} className={step} aria-label="Skrajšaj obdobje za pol leta">
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="num min-w-[6.5ch] text-center text-xs text-on-surface-variant">
            {num(years, 1)} {letText(years)}
          </span>
          <button onClick={() => setYears(years + 0.5)} className={step} aria-label="Podaljšaj obdobje za pol leta">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {/* M3 linear progress indicator */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container-high">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-standard ${over ? "bg-error" : "bg-secondary"}`}
          style={{ width: `${used}%` }}
        />
      </div>
    </div>
  );
}
