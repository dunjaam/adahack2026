import type { CsListItem } from "../api/client";

interface Props {
  districts: CsListItem[];
  selected: string | null;
  onSelect: (csName: string) => void;
}

export function DistrictDropdown({ districts, selected, onSelect }: Props) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Četrtna skupnost
      </span>
      <select
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
        value={selected ?? ""}
        onChange={(e) => onSelect(e.target.value)}
      >
        {districts.map((d) => (
          <option key={d.cs_ime} value={d.cs_ime}>
            {d.cs_ime} — {d.baseline_pm10.toFixed(1)} µg/m³
          </option>
        ))}
      </select>
    </label>
  );
}
