import { useEffect, useRef } from "react";
import { animate, motion, useAnimationControls, useMotionValue, useMotionValueEvent } from "framer-motion";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { useStore } from "../store";
import { pmColor, num } from "../lib";

function statusLabel(pm: number) {
  if (pm < 10) return "Odličen zrak";
  if (pm < 15) return "Dober zrak";
  if (pm < 20) return "Zmerno onesnažen";
  if (pm < 25) return "Onesnažen";
  return "Zelo onesnažen";
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Centerpiece readout. Shows the simulated PM value as a large instrument-style
 * number that counts and re-colours as the simulation updates; when interventions
 * are active the baseline → simulated transformation and the % change are shown.
 * All values come straight from the simulation engine.
 */
export function AirVisual() {
  const result = useStore((s) => s.result);
  const selected = useStore((s) => s.selectedDistrict);
  const pollutant = useStore((s) => s.pollutant);

  let before = result?.municipality_pm25_before ?? 0;
  let after = result?.municipality_pm25_after ?? 0;
  if (result && selected) {
    const d = result.districts.find((x) => x.cs_ime === selected);
    if (d) {
      before = pollutant === "pm25" ? d.pm25_before : d.pm10_before;
      after = pollutant === "pm25" ? d.pm25_after : d.pm10_after;
    }
  } else if (result && pollutant === "pm10") {
    before = result.municipality_pm10_before;
    after = result.municipality_pm10_after;
  }
  const delta = after - before;
  const pctRaw = before ? (delta / before) * 100 : 0;
  const digits = (result?.params.diesel_cars_replaced ?? 0) > 0 ? 3 : 2;
  const changed = Math.abs(delta) >= 0.5 * 10 ** -digits;
  const improved = delta < 0;
  const pctDigits = Math.abs(pctRaw) < 1 ? 2 : 1;
  const label = pollutant === "pm25" ? "PM₂.₅" : "PM₁₀";

  // --- hero number: counts + re-colours every frame ---
  const numRef = useRef<HTMLSpanElement>(null);
  const pm = useMotionValue(after);
  useEffect(() => {
    const c = animate(pm, after, { duration: 0.9, ease: EASE });
    return () => c.stop();
  }, [after, pm]);
  useMotionValueEvent(pm, "change", (v) => {
    if (!numRef.current) return;
    numRef.current.textContent = num(v, digits);
    numRef.current.style.color = pmColor(v);
  });

  // --- percentage counts too ---
  const pctRef = useRef<HTMLSpanElement>(null);
  const pct = useMotionValue(Math.abs(pctRaw));
  useEffect(() => {
    const c = animate(pct, Math.abs(pctRaw), { duration: 0.9, ease: EASE });
    return () => c.stop();
  }, [pctRaw, pct]);
  useMotionValueEvent(pct, "change", (v) => {
    if (pctRef.current) pctRef.current.textContent = num(v, pctDigits);
  });

  // --- a short, subtle "pulse" whenever the simulated value changes ---
  const pulse = useAnimationControls();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    pulse.start({ scale: [1, 1.035, 1], transition: { duration: 0.45, ease: "easeOut" } });
  }, [after, pulse]);

  const tone = !changed
    ? "bg-slate-100 text-slate-500"
    : improved
    ? "bg-brand-50 text-brand-700"
    : "bg-red-50 text-red-600";

  return (
    <div
      className="flex h-full w-full flex-col justify-between px-4 pb-3 pt-2.5"
      style={{ containerType: "size" }}
    >
      {/* context */}
      <div className="flex items-center justify-between gap-2 pr-6 text-[13px]">
        <span className="truncate font-semibold text-slate-600">
          {label} <span className="font-normal text-slate-400">· {selected ?? "vsa občina"}</span>
        </span>
        <span className="shrink-0 font-semibold transition-colors duration-700" style={{ color: pmColor(after) }}>
          {statusLabel(after)}
        </span>
      </div>

      {/* baseline → simulated */}
      <div className="flex min-h-0 flex-col justify-center">
        <div
          className="flex items-center gap-1.5 font-semibold tabular-nums text-slate-400"
          style={{ fontSize: "clamp(0.8rem, min(9cqh, 5cqw), 1.6rem)" }}
        >
          {changed ? (
            <>
              <span className="text-[0.75em] font-medium">izhodišče</span>
              <span>{num(before, digits)}</span>
              <ArrowRight className="h-[0.9em] w-[0.9em]" />
            </>
          ) : (
            <span className="text-[0.75em] font-medium">izhodišče · brez ukrepov</span>
          )}
        </div>
        <motion.div animate={pulse} className="flex origin-left items-baseline gap-2">
          <span
            ref={numRef}
            className="font-extrabold leading-[0.9] tracking-tighter tabular-nums"
            style={{ color: pmColor(pm.get()), fontSize: "clamp(2.5rem, min(46cqh, 24cqw), 9rem)" }}
          >
            {num(pm.get(), digits)}
          </span>
          <span
            className="font-semibold text-slate-400"
            style={{ fontSize: "clamp(0.8rem, min(8cqh, 4.5cqw), 1.5rem)" }}
          >
            µg/m³
          </span>
        </motion.div>
      </div>

      {/* change indicator */}
      <div
        className="flex items-center gap-2"
        style={{ fontSize: "clamp(0.8rem, min(8cqh, 4.5cqw), 1.35rem)" }}
      >
        <motion.span
          animate={pulse}
          className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-0.5 font-bold tabular-nums transition-colors duration-500 ${tone}`}
        >
          {changed && (improved ? <ArrowDownRight className="h-[1em] w-[1em]" /> : <ArrowUpRight className="h-[1em] w-[1em]" />)}
          {changed ? (improved ? "−" : "+") : ""}
          <span ref={pctRef}>{num(pct.get(), pctDigits)}</span>% {label}
        </motion.span>
        <span className="truncate text-[0.7em] text-slate-500">
          {!changed
            ? "Premaknite drsnik za simulacijo ukrepov"
            : improved
            ? "ocenjeno zmanjšanje onesnaženosti"
            : "ocenjeno povečanje onesnaženosti"}
        </span>
      </div>
    </div>
  );
}
