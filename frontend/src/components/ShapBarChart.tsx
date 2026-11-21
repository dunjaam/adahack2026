import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { FeatureMeta } from "../api/client";

interface Props {
  perFeatureDelta: Record<string, number>;
  features: FeatureMeta[];
}

export function ShapBarChart({ perFeatureDelta, features }: Props) {
  const data = features
    .map((f) => ({
      name: f.label_sl,
      value: perFeatureDelta[f.name] ?? 0,
    }))
    .filter((d) => Math.abs(d.value) > 1e-6)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  if (data.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Prispevek k spremembi (SHAP)
        </h3>
        <p className="mt-4 text-sm text-slate-500">
          Premakni drsnike, da vidiš, kateri dejavniki najbolj vplivajo na
          napoved.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Prispevek k spremembi (SHAP)
      </h3>
      <p className="mt-1 text-xs text-slate-500">
        Rdeče = poslabšanje, zeleno = izboljšanje. Enote: µg/m³.
      </p>
      <div className="mt-3 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
          >
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={160}
              tick={{ fontSize: 11 }}
            />
            <ReferenceLine x={0} stroke="#94a3b8" />
            <Tooltip
              formatter={(v: number) => [`${v.toFixed(3)} µg/m³`, "Δ"]}
              labelStyle={{ fontSize: 12 }}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="value">
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.value > 0 ? "#dc2626" : "#16a34a"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
