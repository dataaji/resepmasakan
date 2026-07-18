"use client";

import { useAppStore } from "@/lib/store";

export default function ToastStack() {
  const toasts = useAppStore((s) => s.toasts);
  const dismissToast = useAppStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-[110] flex w-full max-w-[380px] -translate-x-1/2 flex-col gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className="flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg"
          style={{
            background: "var(--card)",
            borderColor: t.kind === "error" ? "#F0B4B4" : "#BCE3C3",
          }}
        >
          <div
            className="flex h-7 w-7 flex-none items-center justify-center rounded-full"
            style={{ background: t.kind === "error" ? "#FADADA" : "#E1F5E4" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke={t.kind === "error" ? "#C23A3A" : "#1F8A3B"}
              strokeWidth={2.5}
              style={{ width: 14, height: 14 }}
            >
              {t.kind === "error" ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <polyline points="20 6 9 17 4 12" />
              )}
            </svg>
          </div>
          <p className="m-0 text-sm font-semibold text-ink">{t.message}</p>
        </div>
      ))}
    </div>
  );
}
