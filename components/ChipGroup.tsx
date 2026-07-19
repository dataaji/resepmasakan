"use client";

export interface ChipOption {
  value: string;
  label: string;
  dot?: string;
}

export default function ChipGroup({
  options,
  selected,
  onSelect,
  nowrap = false,
}: {
  options: ChipOption[];
  selected: string;
  onSelect: (value: string) => void;
  nowrap?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 ${
        nowrap ? "overflow-x-auto pb-1" : "flex-wrap"
      }`}
    >
      {options.map((opt) => {
        const active = opt.value === selected;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className="flex flex-none items-center gap-1.5 whitespace-nowrap rounded-full border-2 px-3.5 py-2 text-[13px] font-semibold transition-colors"
            style={{
              borderColor: active ? "#FF5A36" : "var(--input-border)",
              background: active ? "#FFE1D6" : "var(--card)",
              color: active ? "#D94A24" : "var(--ink)",
            }}
          >
            {opt.dot && (
              <span
                className="inline-block h-[7px] w-[7px] rounded-full"
                style={{ background: opt.dot }}
              />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
