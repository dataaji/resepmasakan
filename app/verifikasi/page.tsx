"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

const RESEND_SECONDS = 60;

export default function VerifyPage() {
  const router = useRouter();
  const currentUser = useAppStore((s) =>
    s.users.find((u) => u.id === s.currentUserId)
  );
  const verifyEmail = useAppStore((s) => s.verifyEmail);
  const resendCode = useAppStore((s) => s.resendCode);
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  useEffect(() => {
    if (currentUser && !currentUser.emailVerified) {
      setCooldown(RESEND_SECONDS);
    }
  }, [currentUser?.id]);

  if (!hasHydrated) return null;

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-[600px] px-8 py-16 text-center">
        <p className="mb-3 text-[15px] text-muted">Masuk dulu untuk verifikasi email.</p>
        <button
          type="button"
          onClick={() => router.push("/masuk")}
          className="rounded-xl2 border-none px-5 py-2.5 text-sm font-semibold text-white"
          style={{ background: "#FF5A36" }}
        >
          Masuk
        </button>
      </div>
    );
  }

  if (currentUser.emailVerified) {
    return (
      <div className="mx-auto max-w-[600px] px-8 py-16 text-center">
        <p className="mb-3 text-[15px] text-muted">Email kamu sudah terverifikasi.</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="rounded-xl2 border-none px-5 py-2.5 text-sm font-semibold text-white"
          style={{ background: "#FF5A36" }}
        >
          Ke Beranda
        </button>
      </div>
    );
  }

  function handleVerify() {
    const result = verifyEmail(code);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/");
  }

  function handleResend() {
    resendCode();
    setCooldown(RESEND_SECONDS);
  }

  return (
    <div className="mx-auto max-w-[420px] px-6 pb-16 pt-12">
      <div className="rounded-xl4 border p-8" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
        <h1 className="font-display m-0 mb-1.5 text-2xl text-ink">Verifikasi email</h1>
        <p className="m-0 mb-6 text-sm text-muted">
          Kami mengirim kode verifikasi ke <b>{currentUser.email}</b>
        </p>

        <div className="mb-5 rounded-xl2 border border-dashed px-4 py-3 text-xs" style={{ borderColor: "#FFC93C", background: "#FFF3D1", color: "#7A5A0A" }}>
          Mode prototipe (belum ada email sungguhan) — kode verifikasimu: <b>{currentUser.verifyCode}</b>
        </div>

        {error && (
          <p className="mb-4 rounded-lg px-3.5 py-2.5 text-sm" style={{ background: "#FADADA", color: "#791F1F" }}>
            {error}
          </p>
        )}

        <label className="mb-1.5 block text-[13px] font-semibold text-muted">Kode 6 digit</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="123456"
          className="mb-5 w-full rounded-xl2 border-2 px-3.5 py-2.5 text-center text-xl tracking-[0.3em]"
          style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
        />

        <button
          type="button"
          onClick={handleVerify}
          className="mb-3 w-full rounded-xl2 border-none py-3 text-[15px] font-semibold text-white"
          style={{ background: "#FF5A36" }}
        >
          Verifikasi
        </button>

        <button
          type="button"
          disabled={cooldown > 0}
          onClick={handleResend}
          className="mb-4 w-full rounded-xl2 border-2 py-2.5 text-sm font-semibold disabled:opacity-40"
          style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
        >
          {cooldown > 0 ? `Kirim ulang kode (${cooldown}s)` : "Kirim ulang kode"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-full border-none bg-transparent text-[13px] font-semibold text-muted"
        >
          Lewati untuk sekarang
        </button>
      </div>
    </div>
  );
}
