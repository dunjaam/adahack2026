import { useEffect } from "react";
import { Info } from "lucide-react";
import { useStore } from "./store";
import { Topbar } from "./components/Topbar";
import { Dashboard } from "./components/Dashboard";
import { DataNote } from "./components/Kpis";

function Disclaimer() {
  return (
    <span
      className="flex min-w-0 shrink-0 items-center gap-1.5 text-xs text-on-surface-variant"
      title="Vse vrednosti, ki se spreminjajo ob ukrepih (PM2.5 / PM10, stroški, učinki), so modelska napoved — ne dejanske meritve. Izhodišče temelji na podatkih ADA Hack 2026."
    >
      <Info className="h-3.5 w-3.5 shrink-0" />
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
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-paper">
        <img src="/zrakvizija-logo.svg" alt="ZrakVizija" className="w-44" />
        <div className="text-sm text-on-surface-variant">Nalagam podatke …</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-paper">
      <Topbar />
      <main className="min-h-0 flex-1 overflow-hidden">
        <Dashboard />
      </main>
      <footer className="flex h-9 shrink-0 items-center justify-between gap-4 bg-paper px-5">
        <DataNote />
        <Disclaimer />
      </footer>
    </div>
  );
}
