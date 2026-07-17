"use client";

import { useAppStore } from "@/lib/store";

export default function LoginPage() {
  const signInWithGoogle = useAppStore((s) => s.signInWithGoogle);
  const authError = useAppStore((s) => s.authError);
  const profile = useAppStore((s) => s.profile);

  return (
    <div className="mx-auto max-w-[420px] px-6 pb-16 pt-12">
      <div
        className="rounded-xl4 border p-8 text-center"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <h1 className="font-display m-0 mb-1.5 text-2xl text-ink">Masuk</h1>
        <p className="m-0 mb-6 text-sm text-muted">
          Masuk pakai akun Google untuk membuat dan membagikan resep
        </p>

        {authError && (
          <p className="mb-4 rounded-lg px-3.5 py-2.5 text-sm" style={{ background: "#FADADA", color: "#791F1F" }}>
            {authError}
          </p>
        )}

        {profile ? (
          <p className="m-0 rounded-lg px-3.5 py-3 text-sm" style={{ background: "#E1F5E4", color: "#1F8A3B" }}>
            Kamu sudah masuk sebagai {profile.name}.
          </p>
        ) : (
          <button
            type="button"
            onClick={() => signInWithGoogle()}
            className="mx-auto flex w-full items-center justify-center gap-3 rounded-xl2 border-2 py-3 text-[15px] font-semibold"
            style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
          >
            <svg viewBox="0 0 48 48" style={{ width: 20, height: 20 }} aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Masuk dengan Google
          </button>
        )}
      </div>
    </div>
  );
}
