"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAppStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-[420px] px-6 pb-16 pt-12">
      <div className="rounded-xl4 border p-8" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
        <h1 className="font-display m-0 mb-1.5 text-2xl text-ink">Masuk</h1>
        <p className="m-0 mb-6 text-sm text-muted">Masuk ke akun ResepKita kamu</p>

        {error && (
          <p className="mb-4 rounded-lg px-3.5 py-2.5 text-sm" style={{ background: "#FADADA", color: "#791F1F" }}>
            {error}
          </p>
        )}

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
          placeholder="Kata sandi"
          className="mb-6 w-full rounded-xl2 border-2 px-3.5 py-2.5 text-[15px]"
          style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
        />

        <button
          type="button"
          onClick={handleSubmit}
          className="mb-4 w-full rounded-xl2 border-none py-3 text-[15px] font-semibold text-white"
          style={{ background: "#FF5A36" }}
        >
          Masuk
        </button>

        <div className="flex justify-between text-[13px]">
          <Link href="/admin/masuk" className="font-semibold text-muted">
            Masuk sebagai admin
          </Link>
          <Link href="/daftar" className="font-semibold text-[#D94A24]">
            Belum punya akun? Daftar
          </Link>
        </div>
      </div>

      <div className="mt-4 rounded-xl2 border border-dashed px-4 py-3 text-xs text-muted2" style={{ borderColor: "var(--input-border)" }}>
        Mode prototipe — akun contoh: <b>sari@contoh.id</b> / sari123, admin: <b>admin@resepkita.id</b> / admin123
      </div>
    </div>
  );
}
