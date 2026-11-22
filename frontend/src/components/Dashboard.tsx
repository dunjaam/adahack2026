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
  hideTitle?: boolean;
}

const DEFAULT_IDS = ["airquality", "map", "sliders", "budget"];

const ROWS = 20;
const MARGIN = 8;

export function Dashboard() {
  const [active, setActive] = useState<string[]>(DEFAULT_IDS);
  const [mapMode, setMapMode] = useState<MapMode>("after");

  // size the grid so all widgets fit the viewport height (no page scroll)
  const gridRef = useRef<HTMLDivElement>(null);
  const [rowH, setRowH] = useState(30);
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.clientHeight;
      const rh = Math.max(14, Math.floor((h - MARGIN * (ROWS + 1)) / ROWS));
      setRowH(rh);
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
        title: "Kakovost zraka",
        icon: <Wind className="h-3.5 w-3.5 text-brand-600" />,
        layout: { x: 8, y: 0, w: 4, h: 6, minH: 5, minW: 3 },
        noPad: true,
        hideTitle: true,
        body: <AirVisual />,
      },
      map: {
        id: "map",
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
        title: "Simulacija ukrepov",
        icon: <SlidersIcon className="h-3.5 w-3.5 text-brand-600" />,
        layout: { x: 8, y: 6, w: 4, h: 11, minH: 6, minW: 3 },
        body: <Sliders />,
      },
      budget: {
        id: "budget",
        title: "Proračun",
        icon: <Wallet className="h-3.5 w-3.5 text-emerald-600" />,
        layout: { x: 8, y: 17, w: 4, h: 3, minH: 3, minW: 3 },
        body: <BudgetCard />,
      },
    }),
    [mapMode, pollutant, setPollutant]
  );

  const layout: Layout[] = active.map((id) => ({ i: id, ...widgets[id].layout }));

  const remove = (id: string) => setActive((a) => a.filter((x) => x !== id));

  return (
    <div ref={gridRef} className="h-full overflow-hidden">
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
        onResizeStop={() => window.dispatchEvent(new Event("resize"))}
        onDragStop={() => window.dispatchEvent(new Event("resize"))}
      >
        {active.map((id) => {
          const w = widgets[id] as any;
          return (
            <div key={id}>
              <Card
                dragHandle
                title={w.hideTitle ? undefined : w.title}
                icon={w.icon}
                noPad={w.noPad}
                right={
                  <>
                    {w.right}
                    <button
                      onClick={() => remove(id)}
                      className="rounded-md p-0.5 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
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
    <div className="flex items-center rounded-lg bg-slate-100 p-0.5">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium transition ${
            value === o.v ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}
