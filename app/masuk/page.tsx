"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const signInWithGoogle = useAppStore((s) => s.signInWithGoogle);
  const signInWithEmail = useAppStore((s) => s.signInWithEmail);
  const authError = useAppStore((s) => s.authError);
  const profile = useAppStore((s) => s.profile);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleEmailLogin() {
    if (!email.trim() || !password) return;
    setBusy(true);
    const err = await signInWithEmail(email.trim(), password);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-[420px] px-6 pb-16 pt-12">
      <div
        className="rounded-xl4 border p-8"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <h1 className="font-display m-0 mb-1.5 text-2xl text-ink">Masuk</h1>
        <p className="m-0 mb-6 text-sm text-muted">Masuk ke akun Kulinara kamu</p>

        {(error || authError) && (
          <p className="mb-4 rounded-lg px-3.5 py-2.5 text-sm" style={{ background: "#FADADA", color: "#791F1F" }}>
            {error || authError}
          </p>
        )}

        {profile ? (
          <p className="m-0 rounded-lg px-3.5 py-3 text-sm" style={{ background: "#E1F5E4", color: "#1F8A3B" }}>
            Kamu sudah masuk sebagai {profile.name}.
          </p>
        ) : (
          <>
            <label className="mb-1.5 block text-[13px] font-semibold text-muted">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="mb-4 w-full rounded-xl2 border-2 px-3.5 py-2.5 text-[15px]"
              style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
            />
            <label className="mb-1.5 block text-[13px] font-semibold text-muted">Kata sandi</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailLogin()}
              placeholder="Kata sandi"
              className="mb-5 w-full rounded-xl2 border-2 px-3.5 py-2.5 text-[15px]"
              style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
            />
            <button
              type="button"
              disabled={busy || !email.trim() || !password}
              onClick={handleEmailLogin}
              className="mb-5 w-full rounded-xl2 border-none py-3 text-[15px] font-semibold text-white disabled:opacity-40"
              style={{ background: "#FF5A36" }}
            >
              {busy ? "Memproses..." : "Masuk"}
            </button>

            <div className="mb-5 flex items-center gap-3">
              <span className="h-px flex-1" style={{ background: "var(--card-border)" }} />
              <span className="text-xs text-muted2">atau</span>
              <span className="h-px flex-1" style={{ background: "var(--card-border)" }} />
            </div>

            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="flex w-full items-center justify-center gap-3 rounded-xl2 border-2 py-3 text-[15px] font-semibold"
              style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
            >
              <svg viewBox="0 0 48 48" style={{ width: 20, height: 20 }} aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              Masuk / Daftar dengan Google
            </button>
          </>
        )}
      </div>
    </div>
  );
}
