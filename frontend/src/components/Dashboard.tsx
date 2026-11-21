import { useMemo, useState } from "react";
import { Responsive, WidthProvider, type Layout } from "react-grid-layout";
import {
  BarChart3,
  Bookmark,
  Flame,
  Gauge,
  LineChart as LineIcon,
  Map as MapIcon,
  Plus,
  Sliders as SlidersIcon,
  Sparkles,
  X,
} from "lucide-react";
import { Card } from "../lib";
import { useStore } from "../store";
import { MapView } from "./MapView";
import { Sliders } from "./Sliders";
import { Kpis } from "./Kpis";
import { BeforeAfterChart, HistoryChart, SourceBreakdown } from "./Charts";
import { Optimizer } from "./Optimizer";
import { Scenarios } from "./Scenarios";

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
}

const DEFAULT_IDS = [
  "kpis",
  "map",
  "sliders",
  "optimizer",
  "beforeafter",
  "source",
  "history",
  "scenarios",
];

export function Dashboard() {
  const [active, setActive] = useState<string[]>(DEFAULT_IDS);
  const [mapMode, setMapMode] = useState<MapMode>("after");
  const [showAdd, setShowAdd] = useState(false);

  const pollutant = useStore((s) => s.pollutant);
  const setPollutant = useStore((s) => s.setPollutant);

  const widgets: Record<string, WidgetDef> = useMemo(
    () => ({
      kpis: {
        id: "kpis",
        title: "Ključni kazalniki",
        icon: <Gauge className="h-4 w-4 text-brand-600" />,
        layout: { x: 0, y: 0, w: 12, h: 4, minH: 4, minW: 4 },
        body: <Kpis />,
      },
      map: {
        id: "map",
        title: "Zemljevid onesnaženosti",
        icon: <MapIcon className="h-4 w-4 text-brand-600" />,
        layout: { x: 0, y: 4, w: 8, h: 15, minH: 8, minW: 5 },
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
        icon: <SlidersIcon className="h-4 w-4 text-brand-600" />,
        layout: { x: 8, y: 4, w: 4, h: 10, minH: 7, minW: 3 },
        body: <Sliders />,
      },
      optimizer: {
        id: "optimizer",
        title: "Optimizacija investicije",
        icon: <Sparkles className="h-4 w-4 text-brand-600" />,
        layout: { x: 8, y: 14, w: 4, h: 9, minH: 6, minW: 3 },
        body: <Optimizer />,
      },
      beforeafter: {
        id: "beforeafter",
        title: "PM2.5 prej / potem po območjih",
        icon: <BarChart3 className="h-4 w-4 text-brand-600" />,
        layout: { x: 0, y: 19, w: 7, h: 9, minH: 6, minW: 4 },
        body: <BeforeAfterChart />,
      },
      source: {
        id: "source",
        title: "Prispevek virov",
        icon: <Flame className="h-4 w-4 text-orange-500" />,
        layout: { x: 7, y: 19, w: 5, h: 9, minH: 6, minW: 3 },
        body: <SourceBreakdown />,
      },
      history: {
        id: "history",
        title: "Sezonski trend PM2.5 (ocena)",
        icon: <LineIcon className="h-4 w-4 text-teal-600" />,
        layout: { x: 0, y: 28, w: 7, h: 8, minH: 6, minW: 4 },
        body: <HistoryChart />,
      },
      scenarios: {
        id: "scenarios",
        title: "Scenariji — shrani & primerjaj",
        icon: <Bookmark className="h-4 w-4 text-brand-600" />,
        layout: { x: 7, y: 28, w: 5, h: 8, minH: 6, minW: 3 },
        body: <Scenarios />,
      },
    }),
    [mapMode, pollutant, setPollutant]
  );

  const layout: Layout[] = active.map((id) => ({ i: id, ...widgets[id].layout }));

  const remove = (id: string) => setActive((a) => a.filter((x) => x !== id));
  const add = (id: string) => {
    setActive((a) => (a.includes(id) ? a : [...a, id]));
    setShowAdd(false);
  };
  const removed = DEFAULT_IDS.filter((id) => !active.includes(id));

  return (
    <div className="relative px-4 pb-10 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight text-slate-800">
          Nadzorna plošča <span className="text-brand-600">· okoljski digitalni dvojček</span>
        </h1>
        <div className="relative">
          <button
            onClick={() => setShowAdd((s) => !s)}
            disabled={removed.length === 0}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-card transition hover:bg-slate-50 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" /> Dodaj gradnik
          </button>
          {showAdd && removed.length > 0 && (
            <div className="absolute right-0 z-[800] mt-2 w-60 animate-fade-in rounded-xl border border-slate-200 bg-white p-1.5 shadow-float">
              {removed.map((id) => (
                <button
                  key={id}
                  onClick={() => add(id)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-brand-50"
                >
                  {widgets[id].icon}
                  {widgets[id].title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ResponsiveGrid
        className="layout"
        layouts={{ lg: layout, md: layout }}
        breakpoints={{ lg: 1100, md: 760, sm: 0 }}
        cols={{ lg: 12, md: 12, sm: 1 }}
        rowHeight={34}
        margin={[14, 14]}
        draggableHandle=".widget-drag-handle"
        onResizeStop={() => window.dispatchEvent(new Event("resize"))}
        onDragStop={() => window.dispatchEvent(new Event("resize"))}
      >
        {active.map((id) => {
          const w = widgets[id] as any;
          return (
            <div key={id}>
              <Card
                title={w.title}
                icon={w.icon}
                dragHandle
                noPad={w.noPad}
                right={
                  <>
                    {w.right}
                    <button
                      onClick={() => remove(id)}
                      className="rounded-md p-1 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                      title="Odstrani gradnik"
                    >
                      <X className="h-4 w-4" />
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
          className={`rounded-md px-2 py-1 text-[11px] font-medium transition ${
            value === o.v ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}
