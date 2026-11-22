import { useEffect, useRef } from "react";
import { animate, AnimatePresence, motion, useMotionValue, useMotionValueEvent } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useStore } from "../store";
import { pmColor, num, eur } from "../lib";

const CLEAN = 5;
const DIRTY = 32;
const toT = (pm: number) => Math.max(0, Math.min(1, (pm - CLEAN) / (DIRTY - CLEAN)));
const scalePos = (pm: number) => Math.max(2, Math.min(98, toT(pm) * 100));

function statusLabel(pm: number) {
  if (pm < 10) return "Odličen zrak";
  if (pm < 15) return "Dober zrak";
  if (pm < 20) return "Zmerno onesnažen";
  if (pm < 25) return "Onesnažen";
  return "Zelo onesnažen";
}

/**
 * HERO air-quality readout. The PM value animates (counts) between the previous
 * and the new simulated value, its colour eases red→green, a floating particle
 * haze thins as the air clears, and an improvement badge shows the % change.
 * All numbers come straight from the simulation engine.
 */
export function AirVisual() {
  const result = useStore((s) => s.result);
  const selected = useStore((s) => s.selectedDistrict);
  const pollutant = useStore((s) => s.pollutant);

  let before = result?.municipality_pm25_before ?? 18;
  let after = result?.municipality_pm25_after ?? 18;
  let outside = pollutant === "pm25" ? result?.municipality_pm25_after_outside : result?.municipality_pm10_after_outside;
  if (result && selected) {
    const d = result.districts.find((x) => x.cs_ime === selected);
    if (d) {
      before = pollutant === "pm25" ? d.pm25_before : d.pm10_before;
      after = pollutant === "pm25" ? d.pm25_after : d.pm10_after;
      outside = pollutant === "pm25" ? d.pm25_after_outside : d.pm10_after_outside;
    }
  } else if (result && pollutant === "pm10") {
    before = result.municipality_pm10_before;
    after = result.municipality_pm10_after;
  }
  const pctRaw = before ? ((after - before) / before) * 100 : 0;
  const withDiesel = (result?.params.diesel_cars_replaced ?? 0) > 0;
  const dieselEffect = Math.max(0, (outside ?? after) - after);
  const digits = withDiesel ? 3 : 1;
  const improved = pctRaw < -0.1;
  const worsened = pctRaw > 0.1;

  // --- animated number + colour (framer-motion, interruptible = no flicker) ---
  const numRef = useRef<HTMLSpanElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const pm = useMotionValue(after);
  useEffect(() => {
    const controls = animate(pm, after, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [after, pm]);
  useMotionValueEvent(pm, "change", (v) => {
    if (numRef.current) {
      numRef.current.textContent = num(v, digits);
      numRef.current.style.color = pmColor(v);
    }
    if (markerRef.current) markerRef.current.style.left = `${scalePos(v)}%`;
  });

  // --- animated percentage ---
  const pctRef = useRef<HTMLSpanElement>(null);
  const pct = useMotionValue(Math.abs(pctRaw));
  useEffect(() => {
    const controls = animate(pct, Math.abs(pctRaw), { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [pctRaw, pct]);
  useMotionValueEvent(pct, "change", (v) => {
    if (pctRef.current) pctRef.current.textContent = num(v);
  });

  // --- particle haze canvas ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetT = useRef(toT(after));
  const curT = useRef(toT(after));
  targetT.current = toT(after);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0, w = 0, h = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const P = Array.from({ length: 90 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 1 + Math.random() * 3,
      vx: (Math.random() - 0.5) * 0.0005 - 0.0003,
      vy: (Math.random() - 0.5) * 0.0003 - 0.00015,
      ph: Math.random() * Math.PI * 2,
    }));
    const draw = () => {
      curT.current += (targetT.current - curT.current) * 0.06;
      const t = curT.current;
      ctx.clearRect(0, 0, w, h);
      // soft pollution tint, stronger when dirty
      const tint = ctx.createLinearGradient(0, 0, 0, h);
      tint.addColorStop(0, `rgba(120,113,108,${0.10 * t})`);
      tint.addColorStop(1, `rgba(180,120,60,${0.16 * t})`);
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, w, h);
      const visible = Math.round(2 + 88 * t);
      const time = performance.now() * 0.001;
      for (let i = 0; i < visible; i++) {
        const p = P[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -0.02) p.x = 1.02; if (p.x > 1.02) p.x = -0.02;
        if (p.y < -0.02) p.y = 1.02; if (p.y > 1.02) p.y = -0.02;
        const bob = Math.sin(time + p.ph) * 2;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h + bob, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(90,74,58,${0.03 + 0.22 * t})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ containerType: "size" }}>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

      <div className="relative flex h-full flex-col justify-between gap-1 px-3.5 py-2.5">
        {/* top row: label + improvement badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="truncate text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
            Kakovost zraka · {pollutant.toUpperCase()} {selected ? `· ${selected}` : "· vsa občina"}
          </div>
          <AnimatePresence mode="wait">
            {(improved || worsened) && (
              <motion.div
                key={improved ? "down" : "up"}
                initial={{ opacity: 0, y: -6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={`flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold shadow-sm ${
                  improved ? "bg-brand-50 text-brand-700" : "bg-red-50 text-red-600"
                }`}
              >
                {improved ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                <span ref={pctRef}>{num(Math.abs(pctRaw))}</span>%
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* hero number */}
        <div className="flex min-h-0 items-end gap-3">
          <div className="flex shrink-0 items-end gap-1.5">
            <span
              ref={numRef}
              className="font-bold leading-[0.85] tabular-nums tracking-tight"
              style={{ color: pmColor(after), fontSize: "clamp(1.75rem, min(30cqh, 17cqw), 5rem)" }}
            >
              {num(after, digits)}
            </span>
            <span className="pb-1 text-xs font-medium text-slate-400">µg/m³</span>
          </div>
          <div className="min-w-0 pb-1 leading-tight">
            <div className="truncate text-[13px] font-semibold" style={{ color: pmColor(after) }}>
              {statusLabel(after)}
            </div>
            <div className="truncate text-[11px] text-slate-500">
              izhodišče <span className="font-semibold text-slate-500">{num(before, digits)}</span> µg/m³
            </div>
            {result && result.cost.total_cost > 0 && (
              <div className="truncate text-[11px] text-slate-500">
                strošek <span className="font-semibold text-slate-700">{eur(result.cost.total_cost)}</span>
              </div>
            )}
          </div>
        </div>

        {withDiesel && outside !== undefined && (
          <p
            className="truncate text-[10.5px] text-slate-500"
            title={`Prikazana ocena velja, če vse vožnje zamenjanih vozil potekajo v MOL. Če vse potekajo zunaj MOL, je ocena ${num(outside, digits)} µg/m³.`}
          >
            Vožnje zunaj MOL: {num(outside, digits)} µg/m³ · dizli{" "}
            {dieselEffect > 0 && dieselEffect < 0.001 ? "< 0,001" : `−${num(dieselEffect, 3)}`} µg/m³
          </p>
        )}

        {/* colour scale with animated marker */}
        <div className="relative">
          <div
            className="h-1.5 w-full rounded-full"
            style={{ background: "linear-gradient(90deg,#2f7d52 0%,#4fae60 18%,#fde047 42%,#fb923c 64%,#ef4444 83%,#b91c1c 100%)" }}
          />
          <div
            ref={markerRef}
            className="absolute top-[3px] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md transition-[background] duration-500"
            style={{ left: `${scalePos(after)}%`, background: pmColor(after) }}
          />
          <div className="mt-0.5 flex justify-between text-[9.5px] text-slate-400">
            <span>čisto</span>
            <span>meja EU 25</span>
            <span>onesnaženo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
