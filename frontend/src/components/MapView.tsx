import { useEffect, useMemo, useRef } from "react";
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useStore } from "../store";
import { pmColor, num } from "../lib";
import { Flame, Car, MapPin, Wind } from "lucide-react";

type MapMode = "before" | "after" | "diff";

function FlyToDistrict({ geojson }: { geojson: any }) {
  const map = useMap();
  const selected = useStore((s) => s.selectedDistrict);
  const muni = useStore((s) => s.municipality);
  useEffect(() => {
    if (!geojson) return;
    if (!selected) {
      if (muni) map.flyTo([muni.lat, muni.lon], muni.zoom, { duration: 0.8 });
      return;
    }
    const f = geojson.features.find((x: any) => x.properties.cs_ime === selected);
    if (f) {
      const layer = L.geoJSON(f);
      map.flyToBounds(layer.getBounds(), { padding: [40, 40], duration: 0.8 });
    }
  }, [selected, geojson, muni, map]);
  return null;
}

export function MapView({ mode }: { mode: MapMode }) {
  const geojson = useStore((s) => s.geojson);
  const result = useStore((s) => s.result);
  const layer = useStore((s) => s.layer);
  const pollutant = useStore((s) => s.pollutant);
  const sensitive = useStore((s) => s.sensitive);
  const selected = useStore((s) => s.selectedDistrict);
  const selectDistrict = useStore((s) => s.selectDistrict);

  const resById = useMemo(() => {
    const m: Record<string, any> = {};
    result?.districts.forEach((d) => (m[d.cs_ime] = d));
    return m;
  }, [result]);

  const styleFn = (feature: any): L.PathOptions => {
    const p = feature.properties;
    const r = resById[p.cs_ime];
    let fill = "#cbd5e1";
    if (layer === "heating") {
      const t = Math.min(1, (p.heating_emis_kg || 0) / 30000);
      fill = `rgb(${Math.round(254)}, ${Math.round(226 - 160 * t)}, ${Math.round(210 - 180 * t)})`;
    } else if (layer === "traffic") {
      const t = Math.min(1, (p.traffic_emis_kg || 0) / 70000);
      fill = `rgb(${Math.round(226 - 120 * t)}, ${Math.round(232 - 150 * t)}, ${Math.round(254)})`;
    } else {
      const before = pollutant === "pm25" ? p.pm25_winter : p.pm10_winter;
      const after = r ? (pollutant === "pm25" ? r.pm25_after : r.pm10_after) : before;
      if (mode === "diff") {
        const delta = r ? after - (pollutant === "pm25" ? r.pm25_before : r.pm10_before) : 0;
        const t = Math.min(1, Math.abs(delta) / 4);
        fill = `rgb(${Math.round(236 - 180 * t)}, ${Math.round(253 - 20 * t)}, ${Math.round(245 - 60 * t)})`;
      } else {
        fill = pmColor(mode === "after" ? after : before);
      }
    }
    const isSel = p.cs_ime === selected;
    return {
      fillColor: fill,
      weight: isSel ? 3 : 1,
      color: isSel ? "#047857" : "#94a3b8",
      fillOpacity: layer === "sensitive" ? 0.25 : 0.72,
    };
  };

  const tooltipHtml = (feature: any) => {
    const p = feature.properties;
    const r = resById[p.cs_ime];
    const after = r ? (pollutant === "pm25" ? r.pm25_after : r.pm10_after) : null;
    const before = pollutant === "pm25" ? p.pm25_winter : p.pm10_winter;
    return `<b>${p.cs_ime}</b><br/>${pollutant.toUpperCase()}: ${num(before)}${
      after != null ? ` → <b>${num(after)}</b>` : ""
    } µg/m³<br/>${p.measured ? "📍 meritev" : "〜 ocena"}`;
  };

  const geoRef = useRef<L.GeoJSON | null>(null);

  // Re-style polygons IN PLACE on any change → CSS animates the fill (no flicker).
  useEffect(() => {
    const g = geoRef.current;
    if (!g) return;
    g.eachLayer((l: any) => {
      if (!l.feature) return;
      l.setStyle(styleFn(l.feature));
      if (l.getTooltip()) l.setTooltipContent(tooltipHtml(l.feature));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resById, layer, pollutant, mode, selected]);

  const onEach = (feature: any, lyr: L.Layer) => {
    const p = feature.properties;
    lyr.on({
      click: () => selectDistrict(p.cs_ime),
      mouseover: (e: any) => e.target.setStyle({ weight: 3, color: "#0d9488" }),
      mouseout: (e: any) => (e.target as any).setStyle(styleFn(feature)),
    });
    lyr.bindTooltip(tooltipHtml(feature), { sticky: true });
  };

  if (!geojson)
    return <div className="flex h-full items-center justify-center text-slate-400">Nalagam zemljevid …</div>;

  return (
    <div className="relative h-full w-full">
      <MapContainer center={[46.0569, 14.5058]} zoom={12} className="h-full w-full" zoomControl scrollWheelZoom>
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
          maxZoom={19}
        />
        <GeoJSON ref={geoRef as any} data={geojson} style={styleFn as any} onEachFeature={onEach} />

        {layer === "sensitive" &&
          sensitive.slice(0, 250).map((s, i) => (
            <CircleMarker
              key={i}
              center={[s.lat, s.lon]}
              radius={4}
              pathOptions={{ color: "#7c3aed", fillColor: "#a78bfa", fillOpacity: 0.9, weight: 1 }}
            >
              <Tooltip>{s.name} {s.type && `· ${s.type}`}</Tooltip>
            </CircleMarker>
          ))}

        <FlyToDistrict geojson={geojson} />
      </MapContainer>

      <MapLegend mode={mode} layer={layer} pollutant={pollutant} />
      <LayerSwitcher />
    </div>
  );
}

function LayerSwitcher() {
  const layer = useStore((s) => s.layer);
  const setLayer = useStore((s) => s.setLayer);
  const items = [
    { k: "pollution", label: "Onesnaženost", icon: <Wind className="h-3.5 w-3.5" /> },
    { k: "heating", label: "Ogrevanje", icon: <Flame className="h-3.5 w-3.5" /> },
    { k: "traffic", label: "Promet", icon: <Car className="h-3.5 w-3.5" /> },
    { k: "sensitive", label: "Občutljive lok.", icon: <MapPin className="h-3.5 w-3.5" /> },
  ] as const;
  return (
    <div className="absolute left-3 top-3 z-[500] flex flex-col gap-1 rounded-xl border border-slate-200 bg-white/95 p-1.5 shadow-float backdrop-blur">
      <div className="px-2 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Sloji</div>
      {items.map((it) => (
        <button
          key={it.k}
          onClick={() => setLayer(it.k)}
          className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
            layer === it.k ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {it.icon}
          {it.label}
        </button>
      ))}
    </div>
  );
}

function MapLegend({ mode, layer, pollutant }: { mode: MapMode; layer: string; pollutant: string }) {
  const dieselCount = useStore((s) => s.result?.params.diesel_cars_replaced ?? 0);
  let content: React.ReactNode;
  if (layer === "heating") content = <span>Emisije ogrevanja (kg PM10/leto) — svetlo → temno</span>;
  else if (layer === "traffic") content = <span>Prometne emisije (kg PM10/leto) — svetlo → temno</span>;
  else if (layer === "sensitive") content = <span>Občutljive lokacije (šole, vrtci, domovi)</span>;
  else if (mode === "diff") content = <span>Δ {pollutant.toUpperCase()} — temnejše zeleno = večje izboljšanje</span>;
  else
    content = (
      <div className="flex items-center gap-2">
        <span>{pollutant.toUpperCase()} {mode === "after" ? "(potem)" : "(prej)"}:</span>
        <div className="h-2 w-28 rounded-full" style={{ background: "linear-gradient(90deg,#10b981,#fde047,#ef4444,#b91c1c)" }} />
        <span className="text-slate-400">0 → 35+ µg/m³</span>
      </div>
    );
  return (
    <div className="absolute bottom-3 left-3 z-[500] rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-[11px] text-slate-600 shadow-float backdrop-blur">
      {content}
      {dieselCount > 0 && layer === "pollution" && mode !== "before" && <div>Zamenjani dizli · vse vožnje v MOL</div>}
    </div>
  );
}
