"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { initials } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Beranda" },
  { href: "/peringkat", label: "Peringkat" },
  { href: "/resep-saya", label: "Resep Saya" },
  { href: "/koleksi", label: "Koleksi" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const signOut = useAppStore((s) => s.signOut);
  const loadNotifications = useAppStore((s) => s.loadNotifications);
  const unreadCount = useAppStore(
    (s) => s.notifications.filter((n) => !n.read).length
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isDark = theme === "dark";

  useEffect(() => {
    if (profile) loadNotifications();
  }, [profile, loadNotifications]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div
      className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 py-3 backdrop-blur-md sm:px-5"
      style={{
        background: "var(--header-bg)",
        boxShadow: "0 1px 0 var(--header-border-color)",
      }}
    >
      <Link
        href="/"
        onClick={() => {
          if (pathname === "/") window.dispatchEvent(new Event("kulinara:home-reset"));
        }}
        className="flex flex-none items-center gap-2.5"
        style={{ color: "inherit" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt="Logo Kulinara"
          className="h-[36px] w-[36px]"
          style={{ boxShadow: "0 3px 8px rgba(255,90,54,.35)", borderRadius: 10 }}
        />
        <span
          className="font-display text-[25px] font-bold"
          style={{ color: "#FF5A36" }}
        >
          Kulinara
        </span>
      </Link>

      <nav
        className="order-last flex w-full min-w-0 gap-0.5 overflow-x-auto rounded-2xl p-1 lg:order-none lg:w-auto lg:max-w-[460px] lg:flex-1"
        style={{ background: "var(--nav-wrap)" }}
      >
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (item.href === "/" && pathname === "/")
                  window.dispatchEvent(new Event("kulinara:home-reset"));
              }}
              className="flex-1 whitespace-nowrap rounded-xl px-2 py-2 text-center text-[12.5px] font-semibold lg:flex-none lg:px-4 lg:text-[13px] lg:text-left"
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

        {profile && (profile.role === "admin" || profile.role === "super_admin") && (
          <Link
            href="/admin"
            title="Panel Admin"
            className="flex-none rounded-xl2 border px-4 py-2 text-[13px] font-semibold"
            style={{ borderColor: "var(--card-border)", background: "var(--card)", color: "var(--ink)" }}
          >
            Admin
          </Link>
        )}

        {profile && (
          <Link
            href="/notifikasi"
            title="Notifikasi"
            className="relative flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full border"
            style={{ borderColor: "var(--card-border)", background: "var(--card)", color: "var(--ink)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 17, height: 17 }}>
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
            {unreadCount > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                style={{ background: "#C23A3A" }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
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

        {profile ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="block"
              aria-label="Menu profil"
            >
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="h-[38px] w-[38px] flex-none rounded-full object-cover"
                  style={{ boxShadow: "0 3px 8px rgba(255,90,54,.3)" }}
                />
              ) : (
                <div
                  className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full text-[13px] font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg,#FF5A36,#FFC93C)",
                    boxShadow: "0 3px 8px rgba(255,90,54,.3)",
                  }}
                >
                  {initials(profile.name)}
                </div>
              )}
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-[46px] w-[220px] overflow-hidden rounded-2xl border shadow-xl"
                style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
              >
                <div className="border-b px-4 py-3" style={{ borderColor: "var(--card-border)" }}>
                  <p className="m-0 truncate text-sm font-semibold text-ink">{profile.name}</p>
                  <p className="m-0 text-xs text-muted2">
                    {profile.role === "super_admin"
                      ? "Super Admin"
                      : profile.role === "admin"
                      ? "Admin"
                      : "Pengguna"}
                  </p>
                </div>
                <Link
                  href="/profil"
                  className="flex items-center gap-2.5 px-4 py-3 text-sm font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 15, height: 15 }}>
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                  Pengaturan Profil
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    setMenuOpen(false);
                    await signOut();
                    router.push("/");
                  }}
                  className="flex w-full items-center gap-2.5 border-none bg-transparent px-4 py-3 text-left text-sm font-semibold"
                  style={{ color: "#C23A3A" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 15, height: 15 }}>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Keluar
                </button>
              </div>
            )}
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
