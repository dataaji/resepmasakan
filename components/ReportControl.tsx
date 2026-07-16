"use client";

import { useState } from "react";

export default function ReportControl({
  reported,
  onSubmit,
  size = "sm",
}: {
  reported: boolean;
  onSubmit: (reason: string) => void;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (reported) {
    return (
      <span
        className="font-semibold text-muted2"
        style={{ fontSize: size === "sm" ? 11 : 12 }}
      >
        Dilaporkan
      </span>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-none bg-transparent p-0 font-semibold text-muted2"
        style={{ fontSize: size === "sm" ? 11 : 12 }}
      >
        Laporkan
      </button>
    );
  }

  return (
    <div className="mt-1.5 flex items-center gap-2">
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Alasan laporan (opsional)"
        className="flex-1 rounded-lg border-2 px-3 py-1.5 text-xs"
        style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
      />
      <button
        type="button"
        onClick={() => {
          onSubmit(reason);
          setOpen(false);
        }}
        className="rounded-lg border-none px-3 py-1.5 text-xs font-semibold text-white"
        style={{ background: "#C23A3A" }}
      >
        Kirim
      </button>
    </div>
  );
}
