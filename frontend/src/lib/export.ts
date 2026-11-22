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
        <td style="color:${x.delta_pm25 < 0 ? "#00796B" : "#616161"}">${num(x.delta_pm25)} (${num(x.delta_pct)}%)</td>
      </tr>`
    )
    .join("");

  const html = `<!doctype html><html lang="sl"><head><meta charset="utf-8">
  <title>ZrakVizija povzetek scenarija</title>
  <style>
    body{font-family:system-ui,sans-serif;max-width:860px;margin:2rem auto;color:#212121;padding:0 1rem}
    h1{color:#00796B;margin-bottom:.2rem} .muted{color:#616161;font-size:.85rem}
    .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.75rem;margin:1.5rem 0}
    .kpi{border:1px solid #E0E0E0;border-radius:12px;padding:.9rem}
    .kpi .v{font-size:1.4rem;font-weight:700;color:#00796B} .kpi .l{font-size:.75rem;color:#616161}
    table{width:100%;border-collapse:collapse;margin-top:1rem;font-size:.85rem}
    th,td{border-bottom:1px solid #E0E0E0;padding:.45rem .5rem;text-align:left}
    th{color:#616161;font-weight:600} .note{background:#E0F2F1;border:1px solid #B2DFDB;border-radius:10px;padding:.8rem;font-size:.8rem;margin-top:1.5rem}
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
  ${r.params.diesel_cars_replaced > 0 ? `<p>Ocena PM predpostavlja vse vožnje zamenjanih dizlov v MOL.
    Če vse potekajo zunaj MOL, je skupna ocena z drugimi ukrepi ${num(r.municipality_pm25_after_outside, 3)} µg/m³ PM2.5.</p>` : ""}
  <ul>
    <li>Elektrifikacija avtobusov: <b>${r.params.electric_bus_pct}%</b> (${r.cost.n_buses} e-busov, ${eur(r.cost.bus_cost)})</li>
    <li>Zamenjanih kurišč na trda goriva: <b>${int(r.params.wood_systems_replaced)}</b> (${eur(r.cost.wood_cost)})</li>
    <li>Obnova stavb pred 1980: <b>${int(r.cost.n_retrofits)}</b> (${eur(r.cost.retrofit_cost)})</li>
    <li>Zamenjava dizlov EURO 4: <b>${int(r.params.diesel_cars_replaced)}</b> (${eur(r.cost.diesel_cost)} subvencij).
      Preprečene emisije v kg/leto: NOₓ ${num(r.diesel_avoided_kg_per_year.nox_kg)}, PM₂.₅ ${num(r.diesel_avoided_kg_per_year.pm25_kg)}, PM₁₀ ${num(r.diesel_avoided_kg_per_year.pm10_kg)}.</li>
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
