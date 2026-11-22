import { useEffect, useState } from "react";
import { Info, X } from "lucide-react";
import { useStore } from "./store";
import { Topbar } from "./components/Topbar";
import { Dashboard } from "./components/Dashboard";
import { DataNote } from "./components/Kpis";

function DisclaimerBar() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="border-b border-amber-100 bg-amber-50/80">
      <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-5 py-2 text-[12px] text-amber-800">
        <Info className="h-4 w-4 shrink-0 text-amber-500" />
        <span>
          <b>Opozorilo:</b> vse vrednosti, ki se spreminjajo ob ukrepih (PM2.5 / PM10,
          stroški, učinki) so <b>modelska napoved</b> — ne dejanske meritve. Izhodišče
          temelji na podatkih ADA Hack 2026.
        </span>
        <button
          onClick={() => setOpen(false)}
          className="ml-auto rounded p-0.5 text-amber-400 transition hover:bg-amber-100 hover:text-amber-600"
          aria-label="Zapri"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
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
      <DisclaimerBar />
      <main className="min-h-0 flex-1 overflow-hidden">
        <Dashboard />
      </main>
      <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-1.5">
        <DataNote />
      </footer>
    </div>
  );
}
