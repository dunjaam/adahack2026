import { useEffect } from "react";
import { useStore } from "./store";
import { Topbar } from "./components/Topbar";
import { Dashboard } from "./components/Dashboard";
import { DataNote } from "./components/Kpis";

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
    <div className="min-h-screen">
      <Topbar />
      <main className="mx-auto max-w-[1600px]">
        <Dashboard />
        <div className="px-5 pb-8">
          <DataNote />
        </div>
      </main>
    </div>
  );
}
