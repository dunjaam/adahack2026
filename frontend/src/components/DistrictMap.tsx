import { useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { Layer, Path, PathOptions } from "leaflet";
import type { Feature } from "geojson";
import type { CsListItem, GeoJsonFeatureCollection } from "../api/client";
import { pm10Color } from "../lib/colorScale";

interface Props {
  geojson: GeoJsonFeatureCollection;
  districts: CsListItem[];
  selected: string | null;
  onSelect: (csName: string) => void;
}

const LJUBLJANA_CENTER: [number, number] = [46.0569, 14.5058];

export function DistrictMap({ geojson, districts, selected, onSelect }: Props) {
  const pm10ByName = useMemo(() => {
    const m: Record<string, number> = {};
    for (const d of districts) m[d.cs_ime] = d.baseline_pm10;
    return m;
  }, [districts]);

  const [pmMin, pmMax] = useMemo(() => {
    const vals = districts.map((d) => d.baseline_pm10);
    return [Math.min(...vals), Math.max(...vals)] as [number, number];
  }, [districts]);

  const styleFor = (feature?: Feature): PathOptions => {
    const name =
      ((feature?.properties as { cs_ime?: string } | undefined)?.cs_ime) ?? "";
    const pm = pm10ByName[name];
    const isSelected = name === selected;
    return {
      fillColor: pm != null ? pm10Color(pm, pmMin, pmMax) : "#cbd5e1",
      fillOpacity: isSelected ? 0.85 : 0.65,
      color: isSelected ? "#0f172a" : "#475569",
      weight: isSelected ? 3 : 1,
    };
  };

  const onEachFeature = (feature: Feature, layer: Layer) => {
    const name =
      ((feature.properties as { cs_ime?: string } | undefined)?.cs_ime) ?? "";
    layer.on({
      click: () => onSelect(name),
      mouseover: (e) => {
        (e.target as Path).setStyle({ weight: 3, color: "#0f172a" });
      },
      mouseout: (e) => {
        (e.target as Path).setStyle(styleFor(feature));
      },
    });
    layer.bindTooltip(
      `${name} — ${pm10ByName[name]?.toFixed(1) ?? "?"} µg/m³`,
      { sticky: true },
    );
  };

  // Re-render GeoJSON layer when selection changes so styles update.
  const geoKey = `geo-${selected ?? "none"}`;

  return (
    <div className="h-80 w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm">
      <MapContainer
        center={LJUBLJANA_CENTER}
        zoom={11}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON
          key={geoKey}
          data={geojson as unknown as GeoJSON.FeatureCollection}
          style={styleFor as never}
          onEachFeature={onEachFeature}
        />
      </MapContainer>
    </div>
  );
}
