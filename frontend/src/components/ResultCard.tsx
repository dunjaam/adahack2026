interface Props {
  csName: string;
  baselinePm10: number;
  newPm10: number;
  deltaPct: number;
  isPending: boolean;
}

function arrow(delta: number): string {
  if (Math.abs(delta) < 0.001) return "→";
  return delta > 0 ? "↑" : "↓";
}

function badgeColor(delta: number): string {
  if (Math.abs(delta) < 0.001) return "bg-slate-100 text-slate-700";
  return delta > 0
    ? "bg-red-100 text-red-700"
    : "bg-green-100 text-green-700";
}

export function ResultCard({
  csName,
  baselinePm10,
  newPm10,
  deltaPct,
  isPending,
}: Props) {
  const deltaAbs = newPm10 - baselinePm10;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Napoved PM10
        </h3>
        <span className="text-xs text-slate-500">{csName}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs uppercase text-slate-500">Izhodišče</p>
          <p className="text-3xl font-bold tabular-nums text-slate-700">
            {baselinePm10.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500">µg/m³</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-500">Po spremembah</p>
          <p
            className={`text-3xl font-bold tabular-nums ${
              isPending ? "text-slate-400" : "text-slate-900"
            }`}
          >
            {newPm10.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500">µg/m³</p>
        </div>
      </div>

      <div
        className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${badgeColor(
          deltaAbs,
        )}`}
      >
        <span className="text-lg leading-none">{arrow(deltaAbs)}</span>
        <span className="tabular-nums">
          {deltaAbs >= 0 ? "+" : ""}
          {deltaAbs.toFixed(2)} µg/m³
        </span>
        <span className="text-slate-400">·</span>
        <span className="tabular-nums">
          {deltaPct >= 0 ? "+" : ""}
          {(deltaPct * 100).toFixed(1)}%
        </span>
      </div>
    </section>
  );
}
