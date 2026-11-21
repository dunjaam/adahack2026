import type { FeatureMeta } from "../api/client";

interface Props {
  feature: FeatureMeta;
  value: number;
  baseline: number;
  onChange: (next: number) => void;
}

function accentColor(direction: FeatureMeta["direction"]): string {
  if (direction === "higher_worse") return "#dc2626"; // red-600
  if (direction === "higher_better") return "#16a34a"; // green-600
  return "#64748b"; // slate-500
}

function formatValue(v: number, unit: string): string {
  if (unit === "delež") return `${(v * 100).toFixed(0)}%`;
  if (unit === "kurišč/km²") return `${Math.round(v)} /km²`;
  if (unit === "stavb/km²") return `${Math.round(v)} /km²`;
  if (unit === "indeks") return v.toFixed(3);
  return v.toFixed(2);
}

export function FeatureSlider({ feature, value, baseline, onChange }: Props) {
  const color = accentColor(feature.direction);
  const isModified = Math.abs(value - baseline) > feature.step / 2;

  return (
    <div className="flex flex-col gap-1 py-2">
      <div className="flex items-baseline justify-between gap-2">
        <label
          className="text-sm font-medium text-slate-700"
          title={feature.description_sl}
        >
          {feature.label_sl}
        </label>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-sm font-semibold tabular-nums ${
              isModified ? "text-slate-900" : "text-slate-600"
            }`}
          >
            {formatValue(value, feature.unit)}
          </span>
          {isModified && (
            <span className="text-[10px] uppercase tracking-wider text-amber-600">
              spremenjeno
            </span>
          )}
        </div>
      </div>
      <input
        type="range"
        min={feature.min}
        max={feature.max}
        step={feature.step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ color }}
        aria-label={feature.label_sl}
      />
      <p className="text-xs text-slate-500">{feature.description_sl}</p>
    </div>
  );
}
