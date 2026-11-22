import { useEffect } from "react";
import { Info } from "lucide-react";
import { useStore } from "./store";
import { Topbar } from "./components/Topbar";
import { Dashboard } from "./components/Dashboard";
import { DataNote } from "./components/Kpis";

function Disclaimer() {
  return (
    <span
      className="flex min-w-0 items-center gap-1 text-[11px] text-slate-400"
      title="Vse vrednosti, ki se spreminjajo ob ukrepih (PM2.5 / PM10, stroški, učinki), so modelska napoved — ne dejanske meritve. Izhodišče temelji na podatkih ADA Hack 2026."
    >
      <Info className="h-3 w-3 shrink-0" />
      <span className="truncate">Vrednosti ob ukrepih so modelska napoved, ne meritve.</span>
    </span>
  );
}

export default function App() {
  const init = useStore((s) => s.init);
  const loading = useStore((s) => s.loading);

  useEffect(() => {
    init();
  }, [init]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-5 bg-gradient-to-br from-brand-50 to-white">
        <img src="/zrakvizija-logo.svg" alt="ZrakVizija" className="w-56 animate-pulse" />
        <div className="text-sm font-medium text-slate-500">Nalagam ZrakVizija …</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Topbar />
      <main className="min-h-0 flex-1 overflow-hidden">
        <Dashboard />
      </main>
      <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-200 bg-white px-4 py-1.5">
        <DataNote />
        <Disclaimer />
      </footer>
    </div>
  );
}
