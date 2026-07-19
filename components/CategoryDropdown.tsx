"use client";

import { useEffect, useRef, useState } from "react";
import { ChipOption } from "./ChipGroup";

export default function CategoryDropdown({
  options,
  selected,
  onSelect,
}: {
  options: ChipOption[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const isActive = !!selected && selected !== "Semua";
  const current = options.find((o) => o.value === selected);
  const label = isActive ? current?.label ?? "Kategori" : "Kategori";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border-2 px-4 py-2 text-[13px] font-semibold"
        style={{
          borderColor: isActive ? "#FF5A36" : "var(--input-border)",
          background: isActive ? "#FFE1D6" : "var(--card)",
          color: isActive ? "#D94A24" : "var(--ink)",
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
        {label}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          className="transition-transform"
          style={{ width: 14, height: 14, transform: open ? "rotate(180deg)" : "none" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 top-[calc(100%+8px)] z-30 w-[280px] max-w-[calc(100vw-2rem)] rounded-2xl border p-2 shadow-xl"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <div className="grid grid-cols-2 gap-1">
            {options.map((opt) => {
              const active = opt.value === selected;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onSelect(opt.value);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold"
                  style={{
                    background: active ? "#FFE1D6" : "transparent",
                    color: active ? "#D94A24" : "var(--ink)",
                  }}
                >
                  {opt.dot ? (
                    <span className="inline-block h-[7px] w-[7px] flex-none rounded-full" style={{ background: opt.dot }} />
                  ) : (
                    <span className="inline-block h-[7px] w-[7px] flex-none" />
                  )}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
