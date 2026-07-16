"use client";

import { stars } from "@/lib/utils";

export function StarDisplay({
  rating,
  size = 14,
  showValue = true,
}: {
  rating: number;
  size?: number;
  showValue?: boolean;
}) {
  const { filled, empty } = stars(rating);
  return (
    <span className="inline-flex items-center gap-1">
      <span style={{ color: "#FFC93C", fontSize: size, letterSpacing: 1 }}>
        {filled}
      </span>
      <span style={{ color: "var(--track)", fontSize: size, letterSpacing: 1 }}>
        {empty}
      </span>
      {showValue && (
        <span className="ml-1 text-xs text-muted">{rating.toFixed(1)}</span>
      )}
    </span>
  );
}

export function StarInput({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mb-1 flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          aria-label={`Beri ${n} bintang`}
          className="border-none bg-transparent p-0 text-2xl leading-none disabled:cursor-not-allowed"
          style={{ color: n <= value ? "#FFC93C" : "var(--track)" }}
        >
          ★
        </button>
      ))}
    </div>
  );
}
