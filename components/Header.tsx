"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { initials } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Beranda" },
  { href: "/peringkat", label: "Peringkat" },
  { href: "/resep-saya", label: "Resep Saya" },
  { href: "/koleksi", label: "Koleksi" },
  { href: "/profil", label: "Profil" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const currentUser = useAppStore((s) =>
    s.users.find((u) => u.id === s.currentUserId)
  );
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const logout = useAppStore((s) => s.logout);

  const isDark = theme === "dark";

  return (
    <div
      className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3 backdrop-blur-md"
      style={{
        background: "var(--header-bg)",
        boxShadow: "0 1px 0 var(--header-border-color)",
      }}
    >
      <Link
        href="/"
        className="flex flex-none items-center gap-2.5"
        style={{ color: "inherit" }}
      >
        <div
          className="flex h-[34px] w-[34px] items-center justify-center rounded-xl2"
          style={{
            background: "linear-gradient(135deg,#FF5A36,#FFC93C)",
            boxShadow: "0 3px 8px rgba(255,90,54,.35)",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: 18, height: 18 }}
          >
            <path d="M6 2v7a3 3 0 0 0 3 3v10" />
            <path d="M6 2v7" />
            <path d="M9 2v7" />
            <path d="M18 2c-1.5 2-2 4-2 7 0 2 1 3 2 3v10" />
          </svg>
        </div>
        <span
          className="font-display text-[25px] font-bold"
          style={{ color: "#FF5A36" }}
        >
          Kulinara
        </span>
      </Link>

      <nav
        className="flex min-w-0 flex-1 gap-0.5 overflow-x-auto rounded-2xl p-1"
        style={{ background: "var(--nav-wrap)", maxWidth: 520, flexBasis: 340 }}
      >
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-xl px-4 py-2 text-[13px] font-semibold"
              style={{
                background: active ? "#FF5A36" : "transparent",
                color: active ? "#fff" : "var(--ink)",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-none flex-nowrap items-center gap-2">
        <Link
          href="/faq"
          className="flex-none rounded-xl2 border px-4 py-2 text-[13px] font-semibold"
          style={{ borderColor: "var(--card-border)", background: "var(--card)", color: "var(--ink)" }}
        >
          FAQ
        </Link>

        {currentUser?.role === "admin" && (
          <Link
            href="/admin"
            title="Panel Admin"
            className="flex-none rounded-xl2 border px-4 py-2 text-[13px] font-semibold"
            style={{ borderColor: "var(--card-border)", background: "var(--card)", color: "var(--ink)" }}
          >
            Admin
          </Link>
        )}

        {currentUser && (
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex-none rounded-xl2 border px-4 py-2 text-[13px] font-semibold"
            style={{ borderColor: "var(--card-border)", background: "var(--card)", color: "var(--ink)" }}
          >
            Keluar
          </button>
        )}

        <button
          type="button"
          onClick={toggleTheme}
          title="Ganti mode gelap/terang"
          className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full border"
          style={{ borderColor: "var(--card-border)", background: "var(--card)", color: "var(--ink)" }}
        >
          {isDark ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 17, height: 17 }}>
              <circle cx="12" cy="12" r="4" />
              <line x1="12" y1="2" x2="12" y2="4" />
              <line x1="12" y1="20" x2="12" y2="22" />
              <line x1="4.9" y1="4.9" x2="6.3" y2="6.3" />
              <line x1="17.7" y1="17.7" x2="19.1" y2="19.1" />
              <line x1="2" y1="12" x2="4" y2="12" />
              <line x1="20" y1="12" x2="22" y2="12" />
              <line x1="4.9" y1="19.1" x2="6.3" y2="17.7" />
              <line x1="17.7" y1="6.3" x2="19.1" y2="4.9" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 17, height: 17 }}>
              <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
            </svg>
          )}
        </button>

        {currentUser ? (
          <div
            className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full text-[13px] font-bold text-white"
            style={{
              background: "linear-gradient(135deg,#FF5A36,#FFC93C)",
              boxShadow: "0 3px 8px rgba(255,90,54,.3)",
            }}
          >
            {initials(currentUser.name)}
          </div>
        ) : (
          <Link
            href="/masuk"
            className="flex-none rounded-xl2 px-4.5 py-2 text-[13px] font-semibold text-white"
            style={{ background: "#FF5A36" }}
          >
            Masuk
          </Link>
        )}
      </div>
    </div>
  );
}
