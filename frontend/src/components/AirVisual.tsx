import { useEffect, useRef } from "react";
import { animate, motion, useAnimationControls, useMotionValue, useMotionValueEvent } from "framer-motion";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { useStore } from "../store";
import { pmInk, num, SectionLabel } from "../lib";

function statusLabel(pm: number) {
  if (pm < 10) return "Odličen zrak";
  if (pm < 15) return "Dober zrak";
  if (pm < 20) return "Zmerno onesnažen";
  if (pm < 25) return "Onesnažen";
  return "Zelo onesnažen";
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** In a monospace face the decimal comma takes a full cell; pull it in. */
const tightSep = (s: string) =>
  s.replace(/[,.](?=\d+$)/, (c) => `<span style="margin:0 -0.14em">${c}</span>`);

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
    numRef.current.innerHTML = tightSep(num(v, digits));
    numRef.current.style.color = pmInk(v);
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
    pulse.start({ opacity: [0.55, 1], transition: { duration: 0.5, ease: "easeOut" } });
  }, [after, pulse]);

  const tone = !changed
    ? "border-line text-ink-2"
    : improved
    ? "border-accent-200 bg-accent-50 text-accent-700"
    : "border-[#F1C9C2] bg-[#FBEDEA] text-[#B42318]";

  return (
    <div className="flex h-full w-full flex-col justify-between px-4 pb-3 pt-2.5" style={{ containerType: "size" }}>
      {/* context */}
      <div className="flex items-baseline justify-between gap-3 pr-6">
        <SectionLabel index="02" title={`Kakovost zraka · ${label} · ${selected ?? "vsa občina"}`} />
        <span className="shrink-0 text-xs font-semibold transition-colors duration-700" style={{ color: pmInk(after) }}>
          {statusLabel(after)}
        </span>
      </div>

      {/* baseline → simulated */}
      <div className="flex min-h-0 flex-col justify-center gap-1">
        <div
          className="flex items-center gap-2 text-ink-3"
          style={{ fontSize: "clamp(0.75rem, min(8cqh, 4.2cqw), 1.25rem)" }}
        >
          <span className="text-[0.72em] font-semibold uppercase tracking-label">
            {changed ? "Izhodišče" : "Izhodišče · brez ukrepov"}
          </span>
          {changed && (
            <>
              <span className="num font-medium text-ink-2">{num(before, digits)}</span>
              <ArrowRight className="h-[0.85em] w-[0.85em]" />
              <span className="text-[0.72em] font-semibold uppercase tracking-label">Simulacija</span>
            </>
          )}
        </div>
        <motion.div animate={pulse} className="flex items-baseline gap-2">
          <span
            ref={numRef}
            className="num font-semibold leading-[0.9]"
            style={{
              color: pmInk(pm.get()),
              fontSize: "clamp(2.5rem, min(44cqh, 21cqw), 8.5rem)",
              letterSpacing: "-0.04em",
            }}
            dangerouslySetInnerHTML={{ __html: tightSep(num(pm.get(), digits)) }}
          />
          <span className="num font-medium text-ink-3" style={{ fontSize: "clamp(0.75rem, min(7cqh, 4cqw), 1.25rem)" }}>
            µg/m³
          </span>
        </motion.div>
      </div>

      {/* change indicator */}
      <div className="flex items-center gap-2.5 border-t border-line-2 pt-2" style={{ fontSize: "clamp(0.8rem, min(7.5cqh, 4.2cqw), 1.2rem)" }}>
        <motion.span
          animate={pulse}
          className={`num inline-flex shrink-0 items-center gap-1 rounded border px-1.5 py-px font-semibold transition-colors duration-500 ${tone}`}
        >
          {changed && (improved ? <ArrowDownRight className="h-[0.95em] w-[0.95em]" /> : <ArrowUpRight className="h-[0.95em] w-[0.95em]" />)}
          {changed ? (improved ? "−" : "+") : "±"}
          <span ref={pctRef}>{num(pct.get(), pctDigits)}</span>% {label}
        </motion.span>
        <span className="truncate text-[0.68em] text-ink-2">
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
