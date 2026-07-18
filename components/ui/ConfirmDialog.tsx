"use client";

import { useAppStore } from "@/lib/store";

export default function ConfirmDialog() {
  const confirmRequest = useAppStore((s) => s.confirmRequest);
  const closeConfirm = useAppStore((s) => s.closeConfirm);

  if (!confirmRequest) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      style={{ background: "rgba(20,12,8,.55)", backdropFilter: "blur(2px)" }}
      onClick={closeConfirm}
    >
      <div
        className="w-full max-w-[400px] rounded-xl4 border p-6"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-3">
          <div
            className="flex h-10 w-10 flex-none items-center justify-center rounded-full"
            style={{
              background: confirmRequest.danger ? "#FADADA" : "#FFF3D1",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke={confirmRequest.danger ? "#C23A3A" : "#A6740A"}
              strokeWidth={2}
              style={{ width: 20, height: 20 }}
            >
              {confirmRequest.danger ? (
                <>
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </>
              ) : (
                <>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </>
              )}
            </svg>
          </div>
          <h2 className="font-display m-0 text-lg text-ink">{confirmRequest.title}</h2>
        </div>
        <p className="m-0 mb-6 text-sm leading-relaxed text-muted">
          {confirmRequest.message}
        </p>
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={closeConfirm}
            className="rounded-xl2 border-2 px-4.5 py-2.5 text-sm font-semibold"
            style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              confirmRequest.onConfirm();
              closeConfirm();
            }}
            className="rounded-xl2 border-none px-4.5 py-2.5 text-sm font-semibold text-white"
            style={{ background: confirmRequest.danger ? "#C23A3A" : "#FF5A36" }}
          >
            {confirmRequest.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
