"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SOCIALS: { label: string; href: string; path: string }[] = [
  {
    label: "Instagram",
    href: "#",
    path: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm5.5-.8a1 1 0 1 0 0 2 1 1 0 0 0 0-2z",
  },
  {
    label: "TikTok",
    href: "#",
    path: "M16 3c.3 2.3 1.9 4 4 4.2v3c-1.5 0-2.9-.5-4-1.3v6.6a6 6 0 1 1-6-6c.3 0 .7 0 1 .1v3.1a3 3 0 1 0 2 2.8V3h3z",
  },
  {
    label: "YouTube",
    href: "#",
    path: "M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1c.3-1.3.4-2.6.4-3.8s-.1-2.5-.4-3.8zM10 15V9l5 3-5 3z",
  },
  {
    label: "Facebook",
    href: "#",
    path: "M14 9h3l.5-3H14V4.5c0-.9.3-1.5 1.6-1.5H18V.2C17.6.1 16.4 0 15.1 0 12.3 0 10.5 1.7 10.5 4.7V6H8v3h2.5v9H14V9z",
  },
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname === "/masak") return null;

  return (
    <footer
      className="mt-8 border-t px-6 py-9"
      style={{ borderColor: "var(--card-border)" }}
    >
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-start justify-between gap-8">
        <div className="max-w-[320px]">
          <div className="mb-2.5 flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Kulinara" className="h-8 w-8" style={{ borderRadius: 8 }} />
            <span className="font-display text-xl font-bold" style={{ color: "#FF5A36" }}>
              Kulinara
            </span>
          </div>
          <p className="m-0 text-sm leading-relaxed text-muted">
            Platform berbagi resep masakan, minuman, dan kue dari komunitas Indonesia —
            simpan, temukan, dan bagikan resep favoritmu.
          </p>
        </div>

        <div>
          <p className="m-0 mb-3 text-[13px] font-bold uppercase tracking-wide text-muted2">Jelajahi</p>
          <div className="flex flex-col gap-2">
            <FootLink href="/">Beranda</FootLink>
            <FootLink href="/peringkat">Peringkat</FootLink>
            <FootLink href="/tentang">Tentang Kami</FootLink>
            <FootLink href="/faq">FAQ & Kontak</FootLink>
          </div>
        </div>

        <div>
          <p className="m-0 mb-3 text-[13px] font-bold uppercase tracking-wide text-muted2">Ikuti Kami</p>
          <div className="flex gap-2.5">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border"
                style={{ borderColor: "var(--card-border)", background: "var(--card)", color: "var(--ink)" }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}>
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-[1200px] text-xs text-muted2">
        © {new Date().getFullYear()} Kulinara. Dibuat untuk komunitas pecinta masakan Indonesia.
      </p>
    </footer>
  );
}

function FootLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
      {children}
    </Link>
  );
}
