import { useState } from "react";
import { Bookmark, Plus, Trash2, Check } from "lucide-react";
import { useStore } from "../store";
import { eur, num } from "../lib";

export function Scenarios() {
  const scenarios = useStore((s) => s.scenarios);
  const saveScenario = useStore((s) => s.saveScenario);
  const deleteScenario = useStore((s) => s.deleteScenario);
  const applyParams = useStore((s) => s.applyParams);
  const canSave = useStore((s) => s.params === s.calculatedParams);
  const [name, setName] = useState("");

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ime scenarija …"
          className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-brand-400"
        />
        <button
          disabled={!canSave}
          onClick={() => {
            saveScenario(name);
            setName("");
          }}
          className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Shrani
        </button>
      </div>

      {scenarios.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-200 text-center text-sm text-slate-400">
          <Bookmark className="h-7 w-7 text-slate-300" />
          Shrani trenutni scenarij za primerjavo.
        </div>
      )}

      {scenarios.length > 0 && (
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-white text-left text-slate-400">
              <tr>
                <th className="py-1.5 font-medium">Scenarij</th>
                <th className="font-medium">PM2.5</th>
                <th className="font-medium">Δ</th>
                <th className="font-medium">Strošek</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => {
                const r = s.result;
                const { traffic_reduction_pct: previousTraffic, ...params } = s.params;
                return (
                  <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="py-2">
                      <div className="font-medium text-slate-700">{s.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {s.district ?? "vsa občina"} · e{params.electric_bus_pct}% · k{num(params.wood_systems_replaced, 0)}
                        {previousTraffic === undefined
                          ? ` · ${num(params.diesel_cars_replaced ?? 0, 0)} dizlov`
                          : ` · stari prometni ukrep ${previousTraffic}%`}
                      </div>
                    </td>
                    <td className="tabular-nums text-slate-600">
                      {num(r.municipality_pm25_after, r.municipality_pm25_after_outside !== undefined ? 3 : 1)}
                    </td>
                    <td className={`tabular-nums font-medium ${r.delta_pm25 < 0 ? "text-brand-600" : "text-slate-400"}`}>
                      {num(r.delta_pm25, r.municipality_pm25_after_outside !== undefined ? 3 : 1)}
                    </td>
                    <td className="tabular-nums text-slate-600">{eur(r.cost.total_cost)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          title="Uporabi"
                          onClick={() => applyParams({ ...params, diesel_cars_replaced: params.diesel_cars_replaced ?? 0 })}
                          className="rounded p-1 text-brand-600 hover:bg-brand-50"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          title="Izbriši"
                          onClick={() => deleteScenario(s.id)}
                          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
