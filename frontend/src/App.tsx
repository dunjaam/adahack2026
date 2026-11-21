import { useEffect } from "react";
import { Wind } from "lucide-react";
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
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-gradient-to-br from-brand-50 to-white">
        <div className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-600 text-white shadow-float">
          <Wind className="h-7 w-7" />
        </div>
        <div className="text-sm font-medium text-slate-500">Nalagam AirShift …</div>
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
