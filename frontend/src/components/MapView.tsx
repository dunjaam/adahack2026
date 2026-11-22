import { useEffect, useMemo, useRef } from "react";
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useStore } from "../store";
import { pmColor, num } from "../lib";
import { m3, md } from "../theme/material";

/** linear blend between two #RRGGBB colours */
function mix(a: string, b: string, t: number) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(",")})`;
}
const RAMP = {
  heating: [md.deepOrange[50], md.deepOrange[700]],
  traffic: [md.indigo[50], md.indigo[700]],
  diff: [md.green[50], md.green[700]],
} as const;
import { Check, Flame, Car, MapPin, Wind } from "lucide-react";

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
    let fill: string = md.grey[300];
    if (layer === "heating") {
      const t = Math.min(1, (p.heating_emis_kg || 0) / 30000);
      fill = mix(RAMP.heating[0], RAMP.heating[1], t);
    } else if (layer === "traffic") {
      const t = Math.min(1, (p.traffic_emis_kg || 0) / 70000);
      fill = mix(RAMP.traffic[0], RAMP.traffic[1], t);
    } else {
      const before = pollutant === "pm25" ? p.pm25_winter : p.pm10_winter;
      const after = r ? (pollutant === "pm25" ? r.pm25_after : r.pm10_after) : before;
      if (mode === "diff") {
        const delta = r ? after - (pollutant === "pm25" ? r.pm25_before : r.pm10_before) : 0;
        const t = Math.min(1, Math.abs(delta) / 4);
        fill = mix(RAMP.diff[0], RAMP.diff[1], t);
      } else {
        fill = pmColor(mode === "after" ? after : before);
      }
    }
    const isSel = p.cs_ime === selected;
    return {
      fillColor: fill,
      weight: isSel ? 3 : 1.25,
      color: isSel ? m3.onSurface : md.white,
      opacity: isSel ? 1 : 0.9,
      fillOpacity: layer === "sensitive" ? 0.22 : 0.7,
    };
  };

  const tooltipHtml = (feature: any) => {
    const p = feature.properties;
    const r = resById[p.cs_ime];
    const after = r ? (pollutant === "pm25" ? r.pm25_after : r.pm10_after) : null;
    const before = pollutant === "pm25" ? p.pm25_winter : p.pm10_winter;
    const label = pollutant === "pm25" ? "PM₂.₅" : "PM₁₀";
    return `<div style="font-weight:600;font-size:14px;margin-bottom:2px">${p.cs_ime}</div>` +
      `<div style="font-size:13px;font-variant-numeric:tabular-nums">${label} ${num(before)}${
        after != null ? ` → <b style="font-weight:600">${num(after)}</b>` : ""
      } µg/m³</div>` +
      `<div style="color:${m3.onSurfaceVariant};font-size:12px;margin-top:2px">${
        p.measured ? "Meritev ARSO" : "Modelska ocena"
      }</div>`;
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
      mouseover: (e: any) => e.target.setStyle({ weight: 2.5, color: m3.primary, opacity: 1 }),
      mouseout: (e: any) => (e.target as any).setStyle(styleFn(feature)),
    });
    lyr.bindTooltip(tooltipHtml(feature), { sticky: true });
  };

  if (!geojson)
    return <div className="flex h-full items-center justify-center text-sm text-on-surface-variant">Nalagam zemljevid …</div>;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-b-xl">
      <MapContainer center={[46.0569, 14.5058]} zoom={12} className="h-full w-full" zoomControl={false} scrollWheelZoom>
        <ZoomControl position="topright" />
        {/* neutral, low-distraction basemap so the pollution layer carries the colour */}
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          className="zv-basemap"
          maxZoom={19}
        />
        <GeoJSON ref={geoRef as any} data={geojson} style={styleFn as any} onEachFeature={onEach} />

        {layer === "sensitive" &&
          sensitive.slice(0, 250).map((s, i) => (
            <CircleMarker
              key={i}
              center={[s.lat, s.lon]}
              radius={4}
              pathOptions={{ color: md.white, fillColor: md.deepPurple[500], fillOpacity: 0.95, weight: 1.5 }}
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

/** M3 filter chips for the thematic layers. */
function LayerSwitcher() {
  const layer = useStore((s) => s.layer);
  const setLayer = useStore((s) => s.setLayer);
  const items = [
    { k: "pollution", label: "Onesnaženost", icon: <Wind className="h-4 w-4" /> },
    { k: "heating", label: "Ogrevanje", icon: <Flame className="h-4 w-4" /> },
    { k: "traffic", label: "Promet", icon: <Car className="h-4 w-4" /> },
    { k: "sensitive", label: "Občutljive lokacije", icon: <MapPin className="h-4 w-4" /> },
  ] as const;
  return (
    <div role="radiogroup" aria-label="Sloj zemljevida" className="absolute left-3 top-3 z-[500] flex max-w-[calc(100%-5rem)] flex-wrap gap-2">
      {items.map((it) => {
        const on = layer === it.k;
        return (
          <button
            key={it.k}
            role="radio"
            aria-checked={on}
            onClick={() => setLayer(it.k)}
            className={`state flex h-8 items-center gap-1.5 rounded-lg pl-2 pr-3 text-xs font-medium shadow-e1 transition-colors ${
              on ? "bg-secondary-container text-on-secondary-container" : "bg-surface text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {on ? <Check className="h-4 w-4" /> : it.icon}
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

/** Stepped legend using the exact pmColor breakpoints (µg/m³). */
const PM_STEPS = [0, 10, 15, 20, 25, 35];

function MapLegend({ mode, layer, pollutant }: { mode: MapMode; layer: string; pollutant: string }) {
  const dieselCount = useStore((s) => s.result?.params.diesel_cars_replaced ?? 0);
  const label = pollutant === "pm25" ? "PM₂.₅" : "PM₁₀";
  let title: string;
  let body: React.ReactNode;
  if (layer === "heating") {
    title = "Emisije ogrevanja";
    body = <Ramp from={RAMP.heating[0]} to={RAMP.heating[1]} lo="0" hi="30 000 kg PM₁₀/leto" />;
  } else if (layer === "traffic") {
    title = "Prometne emisije";
    body = <Ramp from={RAMP.traffic[0]} to={RAMP.traffic[1]} lo="0" hi="70 000 kg PM₁₀/leto" />;
  } else if (layer === "sensitive") {
    title = "Občutljive lokacije";
    body = <div className="text-xs text-on-surface-variant">Šole, vrtci, bolnišnice in domovi za starejše</div>;
  } else if (mode === "diff") {
    title = `Sprememba ${label}`;
    body = <Ramp from={RAMP.diff[0]} to={RAMP.diff[1]} lo="0" hi="−4 µg/m³" />;
  } else {
    title = `${label} ${mode === "after" ? "Potem" : "Prej"}`;
    body = (
      <div>
        <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
          {PM_STEPS.map((v, i) => (
            <div key={v} className="flex-1" style={{ background: pmColor(i < PM_STEPS.length - 1 ? (v + PM_STEPS[i + 1]) / 2 : v) }} />
          ))}
        </div>
        <div className="num mt-1.5 flex text-xs text-on-surface-variant">
          {PM_STEPS.map((v, i) => (
            <span key={v} className="flex-1">
              {i === PM_STEPS.length - 1 ? `${v}+` : v}
            </span>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="absolute bottom-4 left-3 z-[500] w-60 rounded-lg bg-surface/95 px-3.5 py-3 shadow-e1 backdrop-blur-sm">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-on-surface">{title}</span>
        {layer === "pollution" && mode !== "diff" && <span className="text-xs text-on-surface-variant">µg/m³</span>}
      </div>
      {body}
      {dieselCount > 0 && layer === "pollution" && mode !== "before" && (
        <div className="mt-2 border-t border-surface-container-high pt-2 text-xs text-on-surface-variant">Zamenjani dizli vplivajo na vse vožnje v MOL</div>
      )}
    </div>
  );
}

function Ramp({ from, to, lo, hi }: { from: string; to: string; lo: string; hi: string }) {
  return (
    <div>
      <div className="h-2 rounded-full" style={{ background: `linear-gradient(90deg, ${from}, ${to})` }} />
      <div className="num mt-1.5 flex justify-between text-xs text-on-surface-variant">
        <span>{lo}</span>
        <span>{hi}</span>
      </div>
    </div>
  );
}
