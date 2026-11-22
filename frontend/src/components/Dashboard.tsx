import { useEffect, useMemo, useRef, useState } from "react";
import { Responsive, WidthProvider, type Layout } from "react-grid-layout";
import {
  Map as MapIcon,
  Sliders as SlidersIcon,
  Wallet,
  Wind,
  X,
} from "lucide-react";
import { Card } from "../lib";
import { useStore } from "../store";
import { MapView } from "./MapView";
import { Sliders } from "./Sliders";
import { AirVisual } from "./AirVisual";
import { BudgetCard } from "./BudgetCard";

const ResponsiveGrid = WidthProvider(Responsive);

type MapMode = "before" | "after" | "diff";

interface WidgetDef {
  id: string;
  title: string;
  icon: React.ReactNode;
  layout: { x: number; y: number; w: number; h: number; minW?: number; minH?: number };
  body: React.ReactNode;
  noPad?: boolean;
  right?: React.ReactNode;
  bare?: boolean;
  index?: string;
}

const DEFAULT_IDS = ["airquality", "map", "sliders", "budget"];

const ROWS = 20;
const MARGIN = 1; // 1px gaps over the line-coloured backdrop = hairline dividers

export function Dashboard() {
  const [active, setActive] = useState<string[]>(DEFAULT_IDS);
  const [mapMode, setMapMode] = useState<MapMode>("after");

  // size the grid so all widgets fit the viewport height (no page scroll)
  const gridRef = useRef<HTMLDivElement>(null);
  const [rowH, setRowH] = useState(30);
  const [short, setShort] = useState(false); // small laptop: give controls a row
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.clientHeight;
      const rh = Math.max(14, Math.floor((h - MARGIN * (ROWS + 1)) / ROWS));
      setRowH(rh);
      setShort(h < 720);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    window.dispatchEvent(new Event("resize")); // keep Leaflet in sync
  }, [rowH]);

  const pollutant = useStore((s) => s.pollutant);
  const setPollutant = useStore((s) => s.setPollutant);

  const widgets: Record<string, WidgetDef> = useMemo(
    () => ({
      airquality: {
        id: "airquality",
        index: "02",
        title: "Kakovost zraka",
        icon: <Wind className="h-3.5 w-3.5 text-brand-600" />,
        layout: { x: 8, y: 0, w: 4, h: short ? 6 : 7, minH: 4, minW: 3 },
        bare: true,
        body: <AirVisual />,
      },
      map: {
        id: "map",
        index: "01",
        title: "Zemljevid onesnaženosti",
        icon: <MapIcon className="h-3.5 w-3.5 text-brand-600" />,
        layout: { x: 0, y: 0, w: 8, h: 20, minH: 8, minW: 5 },
        noPad: true,
        right: (
          <div className="flex items-center gap-1.5">
            <Segmented
              value={pollutant}
              onChange={(v) => setPollutant(v as any)}
              options={[
                { v: "pm25", l: "PM2.5" },
                { v: "pm10", l: "PM10" },
              ]}
            />
            <Segmented
              value={mapMode}
              onChange={(v) => setMapMode(v as MapMode)}
              options={[
                { v: "before", l: "Prej" },
                { v: "after", l: "Potem" },
                { v: "diff", l: "Δ" },
              ]}
            />
          </div>
        ),
        get bodyNode() {
          return <MapView mode={mapMode} />;
        },
      } as any,
      sliders: {
        id: "sliders",
        index: "03",
        title: "Ukrepi",
        icon: <SlidersIcon className="h-3.5 w-3.5 text-brand-600" />,
        layout: { x: 8, y: short ? 6 : 7, w: 4, h: short ? 12 : 11, minH: 6, minW: 3 },
        body: <Sliders />,
      },
      budget: {
        id: "budget",
        index: "04",
        title: "Proračun",
        icon: <Wallet className="h-3.5 w-3.5 text-emerald-600" />,
        layout: { x: 8, y: 18, w: 4, h: 2, minH: 2, minW: 3 },
        bare: true,
        body: <BudgetCard />,
      },
    }),
    [mapMode, pollutant, setPollutant, short]
  );

  const layout: Layout[] = active.map((id) => ({ i: id, ...widgets[id].layout }));

  const remove = (id: string) => setActive((a) => a.filter((x) => x !== id));

  return (
    <div ref={gridRef} className="h-full overflow-hidden bg-line">
      <ResponsiveGrid
        className="layout"
        layouts={{ lg: layout, md: layout }}
        breakpoints={{ lg: 1100, md: 760, sm: 0 }}
        cols={{ lg: 12, md: 12, sm: 12 }}
        rowHeight={rowH}
        margin={[MARGIN, MARGIN]}
        compactType={null}
        isBounded
        draggableHandle=".widget-drag-handle"
        draggableCancel="input,button,textarea,select,label"
        onResizeStop={() => window.dispatchEvent(new Event("resize"))}
        onDragStop={() => window.dispatchEvent(new Event("resize"))}
      >
        {active.map((id) => {
          const w = widgets[id] as any;
          return (
            <div key={id}>
              <Card
                dragHandle
                bare={w.bare}
                index={w.index}
                title={w.bare ? undefined : w.title}
                icon={w.icon}
                noPad={w.noPad}
                right={
                  <>
                    {w.right}
                    <button
                      onClick={() => remove(id)}
                      className="rounded p-1 text-ink-3 opacity-0 transition hover:bg-paper hover:text-ink group-hover:opacity-100"
                      title="Odstrani gradnik"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                }
              >
                {w.bodyNode ?? w.body}
              </Card>
            </div>
          );
        })}
      </ResponsiveGrid>
    </div>
  );
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <div className="flex items-center rounded-md border border-line bg-paper p-px">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`num rounded px-2 py-0.5 text-2xs font-medium transition ${
            value === o.v ? "bg-ink text-surface" : "text-ink-2 hover:text-ink"
          }`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}
