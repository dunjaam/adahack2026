import { useEffect, useRef } from "react";
import { animate, motion, useAnimationControls, useMotionValue, useMotionValueEvent } from "framer-motion";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { useStore } from "../store";
import { pmInk, num } from "../lib";

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
    numRef.current.innerHTML = num(v, digits);
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
    ? "bg-surface-container-high text-on-surface-variant"
    : improved
    ? "bg-positive-container text-positive-on"
    : "bg-error-container text-error-on";

  return (
    <div className="flex h-full w-full flex-col justify-between px-5 pb-4 pt-4" style={{ containerType: "size" }}>
      {/* context */}
      <div className="pr-10">
        <div className="min-w-0">
          <div className="truncate text-title font-medium text-on-surface">Kakovost zraka</div>
          <div className="truncate text-xs text-on-surface-variant">
            {label} · {selected ?? "vsa občina"} · zimsko povprečje
          </div>
        </div>
      </div>

      {/* simulated value, baseline underneath */}
      <div className="flex min-h-0 flex-col justify-center">
        <motion.div animate={pulse} className="flex items-baseline gap-2">
          <span
            ref={numRef}
            className="display-num leading-[0.88]"
            style={{
              color: pmInk(pm.get()),
              fontSize: "clamp(3.5rem, min(58cqh, 30cqw), 12rem)",
              letterSpacing: "-0.01em",
            }}
            /* text is written imperatively each animation frame; keep React out of the node */
            dangerouslySetInnerHTML={{ __html: num(pm.get(), digits) }}
          />
          <span className="font-medium text-on-surface-variant" style={{ fontSize: "clamp(1rem, min(9cqh, 5cqw), 1.75rem)" }}>
            µg/m³
          </span>
        </motion.div>
        <div
          className="mt-1.5 flex items-center gap-1.5 text-on-surface-variant"
          style={{ fontSize: "clamp(0.85rem, min(7.5cqh, 4cqw), 1.15rem)" }}
        >
          {changed ? (
            <>
              <span>Izhodišče</span>
              <span className="num font-medium text-on-surface">{num(before, digits)}</span>
              <ArrowRight className="h-[0.9em] w-[0.9em]" />
              <span>simulacija z ukrepi</span>
            </>
          ) : (
            <span>Izhodišče brez ukrepov</span>
          )}
        </div>
      </div>

      {/* change indicator */}
      <div className="flex items-center gap-3" style={{ fontSize: "clamp(0.85rem, min(8cqh, 4.2cqw), 1.2rem)" }}>
        <motion.span
          animate={pulse}
          className={`num inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-colors duration-500 ${tone}`}
        >
          {changed && (improved ? <ArrowDownRight className="h-[1em] w-[1em]" /> : <ArrowUpRight className="h-[1em] w-[1em]" />)}
          {changed ? (improved ? "−" : "+") : "±"}
          <span ref={pctRef}>{num(pct.get(), pctDigits)}</span>&nbsp;%
        </motion.span>
        <span className="truncate text-[0.85em] text-on-surface-variant">
          {!changed
            ? "Premaknite drsnik, da simulirate ukrepe"
            : improved
            ? "Ocenjeno zmanjšanje onesnaženosti"
            : "Ocenjeno povečanje onesnaženosti"}
        </span>
      </div>
    </div>
  );
}
