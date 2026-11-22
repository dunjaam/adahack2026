import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

export interface Option {
  value: string;
  label: string;
  sub?: string;
}

export function SearchableSelect({
  value,
  options,
  onChange,
  placeholder = "Izberi …",
  icon,
  width = "w-72",
}: {
  value: string | null;
  options: Option[];
  onChange: (v: string | null) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const current = options.find((o) => o.value === value);
  const filtered = options.filter(
    (o) =>
      o.label.toLowerCase().includes(q.toLowerCase()) ||
      (o.sub ?? "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className={`relative ${width}`} ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-7 w-full items-center gap-2 rounded-md border border-line bg-surface px-2.5 text-left text-sm transition hover:border-ink-3"
      >
        {icon}
        <span className={`flex-1 truncate ${current ? "font-medium text-ink" : "text-ink-3"}`}>
          {current ? current.label : placeholder}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-ink-3 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-[1200] mt-1 w-full animate-fade-in overflow-hidden rounded-md border border-line bg-surface shadow-float">
          <div className="flex items-center gap-2 border-b border-line-2 px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 text-ink-3" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Išči …"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <div className="max-h-72 overflow-auto py-1">
            {filtered.length === 0 && (
              <div className="px-3 py-3 text-sm text-slate-400">Ni zadetkov</div>
            )}
            {filtered.map((o) => (
              <button
                key={o.value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                  setQ("");
                }}
                className="flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-sm hover:bg-paper"
              >
                <span>
                  <span className="text-ink">{o.label}</span>
                  {o.sub && <span className="num ml-2 text-2xs text-ink-3">{o.sub}</span>}
                </span>
                {o.value === value && <Check className="h-3.5 w-3.5 text-accent-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
