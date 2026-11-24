import { useEffect, useMemo, useRef, useState } from "react";
import { Responsive, WidthProvider, type Layout } from "react-grid-layout";
import {
  Map as MapIcon,
  Sliders as SlidersIcon,
  Wallet,
  Wind,
  X,
} from "lucide-react";
import { Card, IconButton, Segmented, TitleSwitch } from "../lib";
import { useStore } from "../store";
import { MapView } from "./MapView";
import { AirQualityPlot } from "./AirQualityPlot";
import { Sliders } from "./Sliders";
import { AirVisual } from "./AirVisual";
import { BudgetCard } from "./BudgetCard";

const ResponsiveGrid = WidthProvider(Responsive);

type MapMode = "before" | "after" | "diff";
type MapTab = "map" | "plot";

interface WidgetDef {
  id: string;
  title: string;
  icon: React.ReactNode;
  layout: { x: number; y: number; w: number; h: number; minW?: number; minH?: number };
  body: React.ReactNode;
  noPad?: boolean;
  right?: React.ReactNode;
  heading?: React.ReactNode;
  bare?: boolean;
}

const DEFAULT_IDS = ["airquality", "map", "sliders", "budget"];

const ROWS = 20;
const MARGIN = 10; // gap between cards (and outer padding)

export function Dashboard() {
  const [active, setActive] = useState<string[]>(DEFAULT_IDS);
  const [mapMode, setMapMode] = useState<MapMode>("after");
  const [mapTab, setMapTab] = useState<MapTab>("map");

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
        title: "Kakovost zraka",
        icon: <Wind className="h-3.5 w-3.5 text-brand-600" />,
        layout: { x: 8, y: 0, w: 4, h: short ? 6 : 7, minH: 4, minW: 3 },
        bare: true,
        body: <AirVisual />,
      },
      map: {
        id: "map",
        title: "Zemljevid onesnaženosti",
        icon: <MapIcon className="h-3.5 w-3.5 text-brand-600" />,
        layout: { x: 0, y: 0, w: 8, h: 20, minH: 8, minW: 5 },
        noPad: true,
        heading: (
          <TitleSwitch
            ariaLabel="Pogled"
            value={mapTab}
            onChange={(v) => setMapTab(v as MapTab)}
            options={[
              { v: "map", l: "Zemljevid onesnaženosti" },
              { v: "plot", l: "Napoved skozi čas" },
            ]}
          />
        ),
        right: (
          <div className="flex items-center gap-2">
            <Segmented
              ariaLabel="Onesnaževalo"
              value={pollutant}
              onChange={(v) => setPollutant(v as any)}
              options={[
                { v: "pm25", l: "PM2.5" },
                { v: "pm10", l: "PM10" },
              ]}
            />
            {mapTab === "map" && (
              <Segmented
                ariaLabel="Prikaz"
                value={mapMode}
                onChange={(v) => setMapMode(v as MapMode)}
                options={[
                  { v: "before", l: "Prej", title: "Stanje brez ukrepov" },
                  { v: "after", l: "Potem", title: "Simulirano stanje z ukrepi" },
                  { v: "diff", l: "Razlika", title: "Sprememba zaradi ukrepov" },
                ]}
              />
            )}
          </div>
        ),
        get bodyNode() {
          return mapTab === "map" ? <MapView mode={mapMode} /> : <AirQualityPlot />;
        },
      } as any,
      sliders: {
        id: "sliders",
        title: "Ukrepi",
        icon: <SlidersIcon className="h-3.5 w-3.5 text-brand-600" />,
        layout: { x: 8, y: short ? 6 : 7, w: 4, h: short ? 12 : 11, minH: 6, minW: 3 },
        body: <Sliders />,
      },
      budget: {
        id: "budget",
        title: "Proračun",
        icon: <Wallet className="h-3.5 w-3.5 text-emerald-600" />,
        layout: { x: 8, y: 18, w: 4, h: 2, minH: 2, minW: 3 },
        bare: true,
        body: <BudgetCard />,
      },
    }),
    [mapMode, mapTab, pollutant, setPollutant, short]
  );

  const layout: Layout[] = active.map((id) => ({ i: id, ...widgets[id].layout }));

  const remove = (id: string) => setActive((a) => a.filter((x) => x !== id));

  return (
    <div ref={gridRef} className="h-full overflow-hidden bg-paper">
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
                title={w.bare ? undefined : w.title}
                heading={w.heading}
                icon={w.icon}
                noPad={w.noPad}
                right={
                  <>
                    {w.right}
                    <IconButton
                      onClick={() => remove(id)}
                      className="opacity-0 group-hover:opacity-100"
                      title="Odstrani gradnik"
                      aria-label="Odstrani gradnik"
                    >
                      <X className="h-4 w-4" />
                    </IconButton>
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
