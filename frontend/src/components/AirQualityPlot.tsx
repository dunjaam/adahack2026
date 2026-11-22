import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { md } from "../theme/material";
import { useStore } from "../store";
import { num } from "../lib";

const STEPS = 25;
const DRIFT_PER_YEAR = 0.07;
const MIN_REDUCTION = 0.2;
const PROGRESS_GAIN = 1.15;
const EASE_POWER = 2.8;
const FLOOR_PM25 = 10;
const FLOOR_PM10 = 18;

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
  const endMs = start + years * 365.25 * 24 * 3600 * 1000;

  const data = Array.from({ length: STEPS }, (_, i) => {
    const t = i / (STEPS - 1);
    const yearsElapsed = t * years;
    const ease = 1 - Math.pow(1 - t, EASE_POWER);
    return {
      t: start + t * (endMs - start),
      baseline: before * Math.pow(1 + DRIFT_PER_YEAR, yearsElapsed),
      withMeasures: before + (after - before) * ease,
    };
  });

  const yMin = Math.max(0, Math.floor(Math.min(after, before) - 2));
  const yMax = Math.ceil(data[data.length - 1].baseline + 2);

  const startYear = new Date(start).getFullYear();
  const endYear = new Date(endMs).getFullYear();
  const yearTicks: number[] = [];
  for (let y = startYear; y <= endYear; y++) {
    const ts = new Date(y, 0, 1).getTime();
    if (ts >= start && ts <= endMs) yearTicks.push(ts);
  }
  if (yearTicks.length < 2) {
    yearTicks.length = 0;
    yearTicks.push(start, endMs);
  }

  const pollutantLabel = pollutant === "pm25" ? "PM2.5" : "PM10";

  return (
    <div className="flex h-full w-full flex-col px-4 pb-4 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, left: -14, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={md.grey[200]} vertical={false} />
          <XAxis
            dataKey="t"
            type="number"
            domain={[start, endMs]}
            ticks={yearTicks}
            tickFormatter={(ms: number) => String(new Date(ms).getFullYear())}
            tick={{ fontSize: 11, fill: md.grey[700] }}
          />
          <YAxis
            domain={[yMin, yMax]}
            tickCount={6}
            tick={{ fontSize: 11, fill: md.grey[600] }}
            tickFormatter={(v: number) => v.toFixed(0)}
          />
          <Tooltip
            labelFormatter={(ms: number) => {
              const d = new Date(ms);
              return d.toLocaleDateString("sl-SI", { year: "numeric", month: "long" });
            }}
            formatter={(v: number, name: string) => [
              `${num(v)} µg/m³`,
              name === "baseline" ? "Brez ukrepov" : "Z ukrepi",
            ]}
            contentStyle={{ borderRadius: 4, fontSize: 12, borderColor: md.grey[300] }}
          />
          <ReferenceLine
            y={25}
            stroke={md.red[700]}
            strokeDasharray="4 4"
            label={{ value: "meja EU 25", fontSize: 10, fill: md.red[700], position: "right" }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value: string) =>
              value === "baseline" ? "Brez ukrepov" : "Z ukrepi"
            }
          />
          <Line
            type="monotone"
            dataKey="baseline"
            name="baseline"
            stroke={md.grey[500]}
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="withMeasures"
            name="withMeasures"
            stroke={md.teal[500]}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-1 text-right text-[11px] text-on-surface-variant">
        {pollutantLabel} — povprečje občine
      </div>
    </div>
  );
}
