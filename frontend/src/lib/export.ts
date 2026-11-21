import type { SimResult } from "../types";
import { eur, num, int } from "../lib";

export function exportSummary(r: SimResult, district: string | null) {
  const d = new Date().toLocaleString("sl-SI");
  const rows = r.districts
    .slice()
    .sort((a, b) => a.delta_pm25 - b.delta_pm25)
    .map(
      (x) => `<tr>
        <td>${x.cs_ime} ${x.measured ? "📍" : "〜"}</td>
        <td>${num(x.pm25_before)}</td>
        <td>${num(x.pm25_after)}</td>
        <td style="color:${x.delta_pm25 < 0 ? "#047857" : "#64748b"}">${num(x.delta_pm25)} (${num(x.delta_pct)}%)</td>
      </tr>`
    )
    .join("");

  const html = `<!doctype html><html lang="sl"><head><meta charset="utf-8">
  <title>ZrakVizija povzetek scenarija</title>
  <style>
    body{font-family:system-ui,sans-serif;max-width:860px;margin:2rem auto;color:#0f172a;padding:0 1rem}
    h1{color:#047857;margin-bottom:.2rem} .muted{color:#64748b;font-size:.85rem}
    .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.75rem;margin:1.5rem 0}
    .kpi{border:1px solid #e2e8f0;border-radius:12px;padding:.9rem}
    .kpi .v{font-size:1.4rem;font-weight:700;color:#047857} .kpi .l{font-size:.75rem;color:#64748b}
    table{width:100%;border-collapse:collapse;margin-top:1rem;font-size:.85rem}
    th,td{border-bottom:1px solid #e2e8f0;padding:.45rem .5rem;text-align:left}
    th{color:#64748b;font-weight:600} .note{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:.8rem;font-size:.8rem;margin-top:1.5rem}
  </style></head><body>
  <h1>ZrakVizija — povzetek scenarija</h1>
  <div class="muted">${r.municipality}${district ? " · " + district : ""} · izdelano ${d}</div>
  <div class="grid">
    <div class="kpi"><div class="v">${num(r.municipality_pm25_before)} → ${num(r.municipality_pm25_after)}</div><div class="l">PM2.5 µg/m³ (prej → potem)</div></div>
    <div class="kpi"><div class="v">${num(r.delta_pm25_pct)}%</div><div class="l">Sprememba PM2.5</div></div>
    <div class="kpi"><div class="v">${eur(r.cost.total_cost)}</div><div class="l">Skupna investicija</div></div>
    <div class="kpi"><div class="v">${r.eur_per_ug_m3 ? eur(r.eur_per_ug_m3) : "—"}</div><div class="l">€ / µg/m³</div></div>
  </div>
  <h3>Ukrepi</h3>
  <ul>
    <li>Elektrifikacija avtobusov: <b>${r.params.electric_bus_pct}%</b> (${r.cost.n_buses} e-busov, ${eur(r.cost.bus_cost)})</li>
    <li>Zamenjanih kurišč na trda goriva: <b>${int(r.params.wood_systems_replaced)}</b> (${eur(r.cost.wood_cost)})</li>
    <li>Znižanje prometnih emisij: <b>${r.params.traffic_reduction_pct}%</b> (${eur(r.cost.traffic_cost)})</li>
    <li>Proračun: <b>${eur(r.params.budget_eur)}</b> — ${r.within_budget ? "✅ znotraj proračuna" : "⚠️ presega proračun"}</li>
  </ul>
  <h3>Vpliv po četrtnih skupnostih</h3>
  <table><thead><tr><th>Območje</th><th>PM2.5 prej</th><th>PM2.5 potem</th><th>Sprememba</th></tr></thead>
  <tbody>${rows}</tbody></table>
  <div class="note">📍 = meritev (ARSO postaja) · 〜 = modelska ocena (umerjen senzor).
  PM2.5 zimsko izhodišče (2025/26) je sidro iz podatkovnega paketa; vplivi ukrepov so <b>modelske ocene</b>
  simulacijskega modela ZrakVizija in ne dejanske meritve.</div>
  </body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `airshift-scenarij-${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
