import { md } from "../theme/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStore } from "../store";
import { pmColor, num } from "../lib";

/** Before/After bars per district (top movers). */
export function BeforeAfterChart() {
  const result = useStore((s) => s.result);
  const selectDistrict = useStore((s) => s.selectDistrict);
  const selected = useStore((s) => s.selectedDistrict);
  if (!result) return null;

  const data = result.districts
    .slice()
    .sort((a, b) => b.pm25_before - a.pm25_before)
    .map((d) => ({
      name: d.cs_ime,
      Prej: d.pm25_before,
      Potem: d.pm25_after,
    }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 6, right: 8, left: -18, bottom: 40 }} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke={md.grey[200]} vertical={false} />
        <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 10, fill: md.grey[700] }} height={60} />
        <YAxis tick={{ fontSize: 11, fill: md.grey[600] }} />
        <Tooltip formatter={(v: number) => [`${num(v)} µg/m³`, ""]} contentStyle={{ borderRadius: 4, fontSize: 12, borderColor: md.grey[300] }} />
        <ReferenceLine y={25} stroke={md.red[700]} strokeDasharray="4 4" label={{ value: "meja EU 25", fontSize: 10, fill: md.red[700], position: "right" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Prej" fill={md.grey[400]} radius={[3, 3, 0, 0]} isAnimationActive={false} onClick={(d: any) => selectDistrict(d.name)} cursor="pointer" />
        <Bar dataKey="Potem" radius={[3, 3, 0, 0]} isAnimationActive={false} onClick={(d: any) => selectDistrict(d.name)} cursor="pointer">
          {data.map((d, i) => (
            <Cell key={i} fill={pmColor(d.Potem)} stroke={d.name === selected ? md.teal[700] : undefined} strokeWidth={d.name === selected ? 2 : 0} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Source attribution (heating vs traffic) before/after for the current scope. */
export function SourceBreakdown() {
  const result = useStore((s) => s.result);
  const selected = useStore((s) => s.selectedDistrict);
  if (!result) return null;

  let heatingB = 0, heatingA = 0, trafficB = 0, trafficA = 0, bg = 0;
  if (selected) {
    const d = result.districts.find((x) => x.cs_ime === selected);
    if (d) {
      heatingB = d.heating_before; heatingA = d.heating_after;
      trafficB = d.traffic_before; trafficA = d.traffic_after; bg = d.background;
    }
  } else {
    result.districts.forEach((d) => {
      heatingB += d.heating_before; heatingA += d.heating_after;
      trafficB += d.traffic_before; trafficA += d.traffic_after; bg += d.background;
    });
    const n = result.districts.length;
    heatingB /= n; heatingA /= n; trafficB /= n; trafficA /= n; bg /= n;
  }

  const data = [
    { name: "Prej", Ozadje: +bg.toFixed(2), Ogrevanje: +heatingB.toFixed(2), Promet: +trafficB.toFixed(2) },
    { name: "Potem", Ozadje: +bg.toFixed(2), Ogrevanje: +heatingA.toFixed(2), Promet: +trafficA.toFixed(2) },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={md.grey[200]} vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: md.grey[700] }} />
        <YAxis tick={{ fontSize: 11, fill: md.grey[600] }} />
        <Tooltip formatter={(v: number) => [`${num(v)} µg/m³`, ""]} contentStyle={{ borderRadius: 4, fontSize: 12, borderColor: md.grey[300] }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Ozadje" stackId="a" fill={md.grey[400]} radius={[0, 0, 0, 0]} isAnimationActive={false} />
        <Bar dataKey="Ogrevanje" stackId="a" fill={md.deepOrange[400]} radius={[0, 0, 0, 0]} isAnimationActive={false} />
        <Bar dataKey="Promet" stackId="a" fill={md.indigo[400]} radius={[3, 3, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Seasonal historical PM2.5 trend (labelled model estimate). */
export function HistoryChart() {
  const history = useStore((s) => s.history);
  if (!history) return null;
  return (
    <div className="flex h-full flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history.series} margin={{ top: 6, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={md.grey[200]} vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: md.grey[700] }} />
          <YAxis tick={{ fontSize: 11, fill: md.grey[600] }} />
          <Tooltip formatter={(v: number) => [`${num(v)} µg/m³`, "PM2.5"]} contentStyle={{ borderRadius: 4, fontSize: 12, borderColor: md.grey[300] }} />
          <ReferenceLine y={history.eu_annual_limit} stroke={md.red[700]} strokeDasharray="4 4" label={{ value: "meja EU", fontSize: 10, fill: md.red[700], position: "insideTopRight" }} />
          <Line type="monotone" dataKey="pm25" stroke={md.teal[500]} strokeWidth={2.5} dot={{ r: 3, fill: md.teal[500] }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
