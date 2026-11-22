import React from "react";
import { md } from "./theme/material";

/** EU/WHO-oriented PM colour scale (µg/m³). Green = clean, red = polluted. */
export function pmColor(v: number): string {
  // breakpoints tuned for PM2.5 winter range
  const stops: [number, string][] = [
    [0, md.green[700]],
    [10, md.lightGreen[500]],
    [15, md.yellow[600]],
    [20, md.orange[500]],
    [25, md.red[500]],
    [35, md.red[900]],
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

/**
 * Same severity hues as pmColor, darkened so they stay legible as TEXT on the
 * warm paper background (pmColor's yellow is unreadable at small sizes).
 */
export function pmInk(v: number): string {
  const stops: [number, string][] = [
    [0, md.green[800]],
    [10, md.lightGreen[900]],
    [15, md.yellow[900]],
    [20, md.orange[900]],
    [25, md.red[800]],
    [35, md.red[900]],
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

export const eur = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `€${num(v / 1_000_000, 2)} mio`;
  if (Math.abs(v) >= 1000) return `€${num(v / 1000, 0)}k`;
  return `€${Math.round(v)}`;
};
export const num = (v: number, d = 1) => v.toLocaleString("sl-SI", { maximumFractionDigits: d, minimumFractionDigits: d });
export const int = (v: number) => Math.round(v).toLocaleString("sl-SI");

// ---- UI primitives ---------------------------------------------------------

/** Section label: mono index + uppercase title. The only titling style we use. */
export function SectionLabel({ index, title, className = "" }: { index?: string; title: string; className?: string }) {
  return (
    <span className={`flex min-w-0 items-baseline gap-2 ${className}`}>
      {index && <span className="num text-2xs text-ink-3">{index}</span>}
      <span className="label truncate">{title}</span>
    </span>
  );
}

/**
 * Workspace panel. Panels sit edge-to-edge in the grid; the 1px gaps between
 * them form hairline dividers, so panels themselves carry no border or radius.
 */
export function Card({
  title,
  index,
  right,
  children,
  className = "",
  dragHandle = false,
  noPad = false,
  bare = false,
}: {
  title?: string;
  index?: string;
  /** kept for API compatibility; panels are icon-less by design */
  icon?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  dragHandle?: boolean;
  noPad?: boolean;
  /** no header bar: the whole panel drags, `right` floats top-right on hover */
  bare?: boolean;
}) {
  if (bare) {
    return (
      <div className={`group relative h-full overflow-hidden bg-surface ${dragHandle ? "widget-drag-handle" : ""} ${className}`}>
        {children}
        {right && (
          <div
            className="absolute right-2 top-2 z-10 flex items-center gap-1 opacity-0 transition group-hover:opacity-100"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {right}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className={`group flex h-full flex-col overflow-hidden bg-surface ${className}`}>
      <div
        className={`flex h-9 shrink-0 items-center justify-between gap-2 border-b border-line-2 px-3 ${dragHandle ? "widget-drag-handle" : ""}`}
      >
        {title ? <SectionLabel index={index} title={title} /> : <span />}
        <div className="flex items-center gap-1.5" onMouseDown={(e) => e.stopPropagation()}>
          {right}
        </div>
      </div>
      <div className={`min-h-0 flex-1 ${noPad ? "" : "overflow-auto px-3 py-2.5"}`}>{children}</div>
    </div>
  );
}

export function Badge({ kind, children }: { kind: "measured" | "model" | "info"; children: React.ReactNode }) {
  const dot = kind === "measured" ? "bg-accent-500" : kind === "model" ? "bg-warn" : "bg-ink-3";
  return (
    <span className="inline-flex items-center gap-1.5 text-2xs font-medium text-ink-2">
      <span className={`h-1.5 w-1.5 rounded-sm ${dot}`} />
      {children}
    </span>
  );
}
