"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAppStore((s) => s.register);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    const result = register(name, email, password, confirmPassword);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/verifikasi");
  }

  return (
    <div className="mx-auto max-w-[420px] px-6 pb-16 pt-12">
      <div className="rounded-xl4 border p-8" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
        <h1 className="font-display m-0 mb-1.5 text-2xl text-ink">Daftar</h1>
        <p className="m-0 mb-6 text-sm text-muted">Buat akun Kulinara baru</p>

        {error && (
          <p className="mb-4 rounded-lg px-3.5 py-2.5 text-sm" style={{ background: "#FADADA", color: "#791F1F" }}>
            {error}
          </p>
        )}

        <label className="mb-1.5 block text-[13px] font-semibold text-muted">Nama</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama lengkap"
          className="mb-4 w-full rounded-xl2 border-2 px-3.5 py-2.5 text-[15px]"
          style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
        />
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
          className="mb-4 w-full rounded-xl2 border-2 px-3.5 py-2.5 text-[15px]"
          style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
        />
        <label className="mb-1.5 block text-[13px] font-semibold text-muted">Konfirmasi kata sandi</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Ulangi kata sandi"
          className="mb-6 w-full rounded-xl2 border-2 px-3.5 py-2.5 text-[15px]"
          style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
        />

        <button
          type="button"
          onClick={handleSubmit}
          className="mb-4 w-full rounded-xl2 border-none py-3 text-[15px] font-semibold text-white"
          style={{ background: "#FF5A36" }}
        >
          Daftar
        </button>

        <div className="text-center text-[13px]">
          <Link href="/masuk" className="font-semibold text-[#D94A24]">
            Sudah punya akun? Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
