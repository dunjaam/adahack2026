import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { md, m3 } from "../theme/material";
import { useStore } from "../store";
import { num } from "../lib";

const STEPS = 25;
const DRIFT_PER_YEAR = 0.07;
const MIN_REDUCTION = 0.2;
const PROGRESS_GAIN = 1.15;
const EASE_POWER = 2.8;
const FLOOR_PM25 = 10;
const FLOOR_PM10 = 18;

const YEAR_MS = 365.25 * 24 * 3600 * 1000;

/* restrained scenario colours: worsening = red, acting = green */
const WORSE = md.red[600];
const WORSE_INK = md.red[800];
const BETTER = md.green[700];
const BETTER_INK = md.green[800];

interface Pt {
  t: number;
  baseline: number;
  withMeasures: number;
  /** index of the yearly point, or -1 for in-between curve samples */
  year: number;
}

export function AirQualityPlot() {
  const result = useStore((s) => s.result);
  const pollutant = useStore((s) => s.pollutant);
  const years = useStore((s) => s.years);
  const params = useStore((s) => s.params);
  const municipality = useStore((s) => s.municipality);

  if (!result) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-on-surface-variant">
        Nalagam…
      </div>
    );
  }

  const before =
    pollutant === "pm25"
      ? result.municipality_pm25_before
      : result.municipality_pm10_before;

  const totalWood = Math.max(1, municipality?.total_wood_systems ?? 1);
  const totalDiesel = Math.max(1, municipality?.diesel_fleet_limit ?? 1);
  const wood = Math.min(1, params.wood_systems_replaced / totalWood);
  const diesel = Math.min(1, params.diesel_cars_replaced / totalDiesel);
  const retrofit = Math.min(1, params.pre1980_retrofit_pct / 100);
  const bus = Math.min(1, params.electric_bus_pct / 100);
  const progress = wood * 0.35 + diesel * 0.25 + retrofit * 0.25 + bus * 0.15;

  const targetFloor = pollutant === "pm25" ? FLOOR_PM25 : FLOOR_PM10;
  const sliderDrivenAfter =
    before - (before - targetFloor) * Math.min(PROGRESS_GAIN, progress * PROGRESS_GAIN);
  const minFloorAfter = before * (1 - MIN_REDUCTION);
  const after = Math.max(targetFloor - 1, Math.min(sliderDrivenAfter, minFloorAfter));

  const start = Date.now();
  const endMs = start + years * YEAR_MS;

  /* same curves as before, evaluated at fraction t of the horizon */
  const at = (t: number, year: number): Pt => {
    const ease = 1 - Math.pow(1 - t, EASE_POWER);
    const baseline = before * Math.pow(1 + DRIFT_PER_YEAR, t * years);
    const withMeasures = before + (after - before) * ease;
    return { t: start + t * (endMs - start), baseline, withMeasures, year };
  };

  // yearly points (now, +1 y, +2 y, … and the horizon end if it is fractional)
  const yearT: number[] = [];
  for (let k = 0; k <= Math.floor(years + 1e-9); k++) yearT.push(k / years);
  if (yearT[yearT.length - 1] < 1 - 1e-9) yearT.push(1);

  const smoothT = Array.from({ length: STEPS }, (_, i) => i / (STEPS - 1));
  const data: Pt[] = [
    ...yearT.map((t, i) => at(t, i)),
    ...smoothT.filter((t) => !yearT.some((y) => Math.abs(y - t) < 1e-6)).map((t) => at(t, -1)),
  ].sort((a, b) => a.t - b.t);

  const lastIdx = yearT.length - 1;
  const last = data[data.length - 1];
  const yearOf = (ms: number) => new Date(ms).getFullYear();

  const lo = Math.min(after, before);
  const pad = Math.max(1, (last.baseline - lo) * 0.15);
  const yMin = Math.max(0, Math.floor(lo - pad));
  const yMax = Math.ceil(last.baseline + pad);
  const yearTicks = data.filter((d) => d.year >= 0).map((d) => d.t);
  // three or four round, evenly spaced y ticks
  const span = yMax - yMin;
  const yStep = span <= 6 ? 1 : span <= 14 ? 2 : span <= 30 ? 5 : 10;
  const yTicks: number[] = [];
  for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax; v += yStep) yTicks.push(v);

  const pollutantLabel = pollutant === "pm25" ? "PM₂.₅" : "PM₁₀";

  /* small dot at every year; value + name only at the final point */
  const dotFor =
    (series: "baseline" | "withMeasures") =>
    (p: any) => {
      const d: Pt = p.payload;
      const key = `${series}-${p.index}`;
      if (d.year < 0 || p.cx == null || p.cy == null) return <g key={key} />;
      const isBase = series === "baseline";
      const color = isBase ? WORSE : BETTER;
      const ink = isBase ? WORSE_INK : BETTER_INK;
      return (
        <g key={key}>
          <circle cx={p.cx} cy={p.cy} r={4.5} fill={color} stroke={m3.surfaceContainerLowest} strokeWidth={1.5} />
          {d.year === lastIdx && (
            <text x={p.cx + 14} y={p.cy + 5} fill={ink}>
              <tspan fontSize={18} fontWeight={600} style={{ fontVariantNumeric: "tabular-nums" }}>
                {num(d[series], 1)}
              </tspan>
              <tspan dx={8} fontSize={14} fontWeight={500}>
                {isBase ? "Brez ukrepov" : "Z ukrepi"}
              </tspan>
            </text>
          )}
        </g>
      );
    };

  return (
    <div className="flex h-full w-full flex-col px-8 pb-5 pt-2">
      <p className="text-sm text-on-surface-variant">
        Napovedana zimska koncentracija {pollutantLabel} za vso občino
      </p>

      <div className="min-h-0 flex-1 pt-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 170, left: 16, bottom: 28 }}>
            <CartesianGrid stroke={m3.surfaceContainerHigh} vertical={false} />
            <XAxis
              dataKey="t"
              type="number"
              domain={[start, endMs]}
              ticks={yearTicks}
              tickFormatter={(ms: number) => String(yearOf(ms))}
              tick={{ fontSize: 13, fill: m3.onSurfaceVariant }}
              tickLine={{ stroke: m3.outline }}
              tickSize={5}
              axisLine={{ stroke: m3.outline }}
              tickMargin={6}
              padding={{ left: 16, right: 0 }}
              label={{ value: "Leto", position: "insideBottom", offset: -20, fontSize: 13, fontWeight: 500, fill: m3.onSurfaceVariant }}
            />
            <YAxis
              domain={[yMin, yMax]}
              ticks={yTicks}
              tick={{ fontSize: 13, fill: m3.onSurfaceVariant }}
              tickFormatter={(v: number) => v.toFixed(0)}
              tickLine={{ stroke: m3.outline }}
              tickSize={5}
              axisLine={{ stroke: m3.outline }}
              width={44}
              label={{
                value: `${pollutantLabel} (µg/m³)`,
                angle: -90,
                position: "insideLeft",
                offset: -6,
                style: { textAnchor: "middle", fontSize: 13, fontWeight: 500, fill: m3.onSurfaceVariant },
              }}
            />
            <Tooltip
              cursor={{ stroke: m3.outlineVariant }}
              labelFormatter={(ms: number) =>
                new Date(ms).toLocaleDateString("sl-SI", { year: "numeric", month: "long" })
              }
              formatter={(v: any, name: string) => [
                `${num(v as number)} µg/m³`,
                name === "baseline" ? "Brez ukrepov" : "Z ukrepi",
              ]}
              contentStyle={{
                borderRadius: 8,
                fontSize: 13,
                border: 0,
                boxShadow: "0 2px 6px 2px rgba(25,28,32,0.08), 0 1px 2px rgba(25,28,32,0.12)",
              }}
            />
            <Line
              type="monotone"
              dataKey="baseline"
              name="baseline"
              stroke={WORSE}
              strokeWidth={2.5}
              strokeDasharray="6 5"
              strokeLinecap="round"
              dot={dotFor("baseline")}
              activeDot={{ r: 5, fill: WORSE, stroke: "#fff", strokeWidth: 2 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="withMeasures"
              name="withMeasures"
              stroke={BETTER}
              strokeWidth={3.5}
              strokeLinecap="round"
              dot={dotFor("withMeasures")}
              activeDot={{ r: 5.5, fill: BETTER, stroke: "#fff", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-xs text-on-surface-muted">
        Obe prihodnji poti sta scenarijski oceni modela, ne izmerjeni rezultati.
      </p>
    </div>
  );
}
