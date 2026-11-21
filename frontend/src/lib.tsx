import React from "react";

/** EU/WHO-oriented PM colour scale (µg/m³). Green = clean, red = polluted. */
export function pmColor(v: number): string {
  // breakpoints tuned for PM2.5 winter range
  const stops: [number, string][] = [
    [0, "#10b981"],
    [10, "#34d399"],
    [15, "#fde047"],
    [20, "#fb923c"],
    [25, "#ef4444"],
    [35, "#b91c1c"],
  ];
  if (v <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (v <= stops[i][0]) {
      const [a, ca] = stops[i - 1];
      const [b, cb] = stops[i];
      return lerpColor(ca, cb, (v - a) / (b - a));
    }
  }
  return stops[stops.length - 1][1];
}

function lerpColor(a: string, b: string, t: number): string {
  const pa = hex(a), pb = hex(b);
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * t);
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * t);
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t);
  return `rgb(${r},${g},${bl})`;
}
function hex(h: string): [number, number, number] {
  const n = h.replace("#", "");
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}

export const eur = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `€${(v / 1_000_000).toFixed(2)} mio`;
  if (Math.abs(v) >= 1000) return `€${(v / 1000).toFixed(0)}k`;
  return `€${Math.round(v)}`;
};
export const num = (v: number, d = 1) => v.toLocaleString("sl-SI", { maximumFractionDigits: d, minimumFractionDigits: d });
export const int = (v: number) => Math.round(v).toLocaleString("sl-SI");

// ---- UI primitives ---------------------------------------------------------
export function Card({
  title,
  icon,
  right,
  children,
  className = "",
  dragHandle = false,
  noPad = false,
}: {
  title?: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  dragHandle?: boolean;
  noPad?: boolean;
}) {
  const showHeader = title || right || dragHandle;
  return (
    <div className={`flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card ${className}`}>
      {showHeader && (
        <div
          className={`flex items-center justify-between gap-2 px-3 py-1.5 ${title ? "border-b border-slate-100" : ""} ${dragHandle ? "widget-drag-handle" : ""}`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            {title && icon}
            {title && <span>{title}</span>}
          </div>
          <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
            {right}
          </div>
        </div>
      )}
      <div className={`min-h-0 flex-1 ${noPad ? "" : "overflow-auto p-4"}`}>{children}</div>
    </div>
  );
}

export function Badge({ kind, children }: { kind: "measured" | "model" | "info"; children: React.ReactNode }) {
  const styles =
    kind === "measured"
      ? "bg-brand-50 text-brand-700 border-brand-200"
      : kind === "model"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${styles}`}>
      {children}
    </span>
  );
}
