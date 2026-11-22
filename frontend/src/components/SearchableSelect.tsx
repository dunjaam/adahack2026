import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

export interface Option {
  value: string;
  label: string;
  sub?: string;
}

/** M3 filled select with a searchable menu. */
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
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    return () => {
      document.removeEventListener("mousedown", h);
      document.removeEventListener("keydown", k);
    };
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
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`state flex h-10 w-full items-center gap-2.5 rounded-full bg-surface-container-high px-4 text-left text-sm text-on-surface transition-colors ${
          open ? "ring-2 ring-primary" : ""
        }`}
      >
        {icon}
        <span className={`flex-1 truncate ${current ? "font-medium" : "text-on-surface-variant"}`}>
          {current ? current.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-on-surface-variant transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-[1200] mt-2 w-full animate-fade-in overflow-hidden rounded-lg bg-surface-container-low shadow-float">
          <div className="flex items-center gap-2.5 border-b border-outline-variant px-4 py-2.5">
            <Search className="h-4 w-4 text-on-surface-variant" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Poišči četrtno skupnost"
              className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-muted"
            />
          </div>
          <div role="listbox" className="max-h-80 overflow-auto py-1.5">
            {filtered.length === 0 && <div className="px-4 py-3 text-sm text-on-surface-muted">Ni zadetkov</div>}
            {filtered.map((o) => {
              const on = o.value === value || (value === null && o.value === "__all__");
              return (
                <button
                  key={o.value}
                  role="option"
                  aria-selected={on}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setQ("");
                  }}
                  className={`state flex h-10 w-full items-center justify-between gap-3 px-4 text-left text-sm transition-colors ${
                    on ? "bg-secondary-container text-on-secondary-container" : "text-on-surface"
                  }`}
                >
                  <span className="truncate">{o.label}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    {o.sub && <span className="num text-xs text-on-surface-variant">{o.sub}</span>}
                    {on && <Check className="h-4 w-4" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
