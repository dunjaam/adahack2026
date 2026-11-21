import type { FeatureMeta } from "../api/client";
import { FeatureSlider } from "./FeatureSlider";

interface Props {
  title: string;
  features: FeatureMeta[];
  values: Record<string, number>;
  baselines: Record<string, number>;
  onChange: (name: string, next: number) => void;
  footer?: React.ReactNode;
}

export function SliderGroup({
  title,
  features,
  values,
  baselines,
  onChange,
  footer,
}: Props) {
  if (features.length === 0) return null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </h3>
        {footer}
      </div>
      <div className="divide-y divide-slate-100">
        {features.map((f) => (
          <FeatureSlider
            key={f.name}
            feature={f}
            value={values[f.name] ?? f.min}
            baseline={baselines[f.name] ?? f.min}
            onChange={(v) => onChange(f.name, v)}
          />
        ))}
      </div>
    </section>
  );
}
