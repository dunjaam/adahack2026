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
import { md } from "../theme/material";

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
      weight: isSel ? 2.5 : 0.75,
      color: isSel ? md.grey[900] : md.grey[600],
      fillOpacity: layer === "sensitive" ? 0.25 : 0.72,
    };
  };

  const tooltipHtml = (feature: any) => {
    const p = feature.properties;
    const r = resById[p.cs_ime];
    const after = r ? (pollutant === "pm25" ? r.pm25_after : r.pm10_after) : null;
    const before = pollutant === "pm25" ? p.pm25_winter : p.pm10_winter;
    const label = pollutant === "pm25" ? "PM₂.₅" : "PM₁₀";
    return `<div style="font-weight:600;margin-bottom:2px">${p.cs_ime}</div>` +
      `<div style="font-family:'IBM Plex Mono',monospace;font-size:11px">${label} ${num(before)}${
        after != null ? ` → <b>${num(after)}</b>` : ""
      } µg/m³</div>` +
      `<div style="color:${md.grey[600]};font-size:10px;text-transform:uppercase;letter-spacing:.08em;margin-top:2px">${
        p.measured ? "meritev ARSO" : "modelska ocena"
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
      mouseover: (e: any) => e.target.setStyle({ weight: 2, color: md.teal[700] }),
      mouseout: (e: any) => (e.target as any).setStyle(styleFn(feature)),
    });
    lyr.bindTooltip(tooltipHtml(feature), { sticky: true });
  };

  if (!geojson)
    return <div className="flex h-full items-center justify-center text-sm text-ink-3">Nalagam zemljevid …</div>;

  return (
    <div className="relative h-full w-full">
      <MapContainer center={[46.0569, 14.5058]} zoom={12} className="h-full w-full" zoomControl={false} scrollWheelZoom>
        <ZoomControl position="topright" />
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
              pathOptions={{ color: md.deepPurple[700], fillColor: md.deepPurple[300], fillOpacity: 0.9, weight: 1 }}
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
    <div className="absolute left-3 top-3 z-[500] w-40 overflow-hidden rounded-md border border-line bg-surface/95">
      <div className="label border-b border-line-2 px-2.5 py-1.5">Sloji</div>
      <div className="p-1">
        {items.map((it) => {
          const on = layer === it.k;
          return (
            <button
              key={it.k}
              onClick={() => setLayer(it.k)}
              className={`flex w-full items-center gap-2 rounded px-2 py-1 text-xs font-medium transition ${
                on ? "bg-ink text-surface" : "text-ink-2 hover:bg-paper hover:text-ink"
              }`}
            >
              {it.icon}
              {it.label}
            </button>
          );
        })}
      </div>
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
    body = <div className="text-xs text-ink-2">Šole, vrtci, domovi za starejše</div>;
  } else if (mode === "diff") {
    title = `Δ ${label}`;
    body = <Ramp from={RAMP.diff[0]} to={RAMP.diff[1]} lo="0" hi="−4 µg/m³" />;
  } else {
    title = `${label} · ${mode === "after" ? "simulacija" : "izhodišče"}`;
    body = (
      <div>
        <div className="flex h-2 overflow-hidden rounded-sm">
          {PM_STEPS.map((v, i) => (
            <div key={v} className="flex-1" style={{ background: pmColor(i < PM_STEPS.length - 1 ? (v + PM_STEPS[i + 1]) / 2 : v) }} />
          ))}
        </div>
        <div className="num mt-1 flex text-2xs text-ink-2">
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
    <div className="absolute bottom-3 left-3 z-[500] w-56 rounded-md border border-line bg-surface/95 px-2.5 py-2">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="label">{title}</span>
        {layer === "pollution" && mode !== "diff" && <span className="num text-2xs text-ink-3">µg/m³</span>}
      </div>
      {body}
      {dieselCount > 0 && layer === "pollution" && mode !== "before" && (
        <div className="mt-1.5 border-t border-line-2 pt-1.5 text-2xs text-ink-3">Zamenjani dizli · vse vožnje v MOL</div>
      )}
    </div>
  );
}

function Ramp({ from, to, lo, hi }: { from: string; to: string; lo: string; hi: string }) {
  return (
    <div>
      <div className="h-2 rounded-sm" style={{ background: `linear-gradient(90deg, ${from}, ${to})` }} />
      <div className="num mt-1 flex justify-between text-2xs text-ink-2">
        <span>{lo}</span>
        <span>{hi}</span>
      </div>
    </div>
  );
}
