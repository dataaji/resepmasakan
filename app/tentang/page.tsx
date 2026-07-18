"use client";

import Link from "next/link";

const VALUES: { title: string; desc: string; path: string; bg: string; fg: string }[] = [
  {
    title: "Terverifikasi",
    desc: "Rating disertai foto hasil masakan asli, jadi kamu tahu resep mana yang benar-benar sudah dicoba dan berhasil.",
    bg: "#E1F5E4",
    fg: "#1F8A3B",
    path: "M20 6L9 17l-5-5",
  },
  {
    title: "Mode Masak",
    desc: "Ikuti resep langkah demi langkah di layar besar, lengkap dengan timer otomatis — tangan kotor pun tetap nyaman.",
    bg: "#FFE1D6",
    fg: "#D94A24",
    path: "M5 3l14 9-14 9V3z",
  },
  {
    title: "Komunitas",
    desc: "Suka, komentari, simpan, dan modifikasi resep pengguna lain. Setiap kontributor tetap dapat kredit atas karyanya.",
    bg: "#EEEDFE",
    fg: "#3C3489",
    path: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  },
];

export default function TentangPage() {
  return (
    <div className="mx-auto max-w-[820px] px-8 pb-16 pt-10">
      <div className="mb-10 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Kulinara" className="mx-auto mb-4 h-16 w-16" style={{ borderRadius: 14 }} />
        <h1 className="font-display m-0 mb-3 text-[36px] font-semibold tracking-tight text-ink">
          Tentang Kulinara
        </h1>
        <p className="mx-auto m-0 max-w-[560px] text-[15px] leading-relaxed text-muted">
          Kulinara adalah rumah bagi para pencinta masakan Indonesia untuk menyimpan,
          menemukan, dan membagikan resep — dari dapur ke dapur.
        </p>
      </div>

      <div
        className="mb-8 rounded-xl4 border p-7"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <h2 className="font-display m-0 mb-3 text-xl text-ink">Cerita Kami</h2>
        <p className="m-0 mb-3 text-sm leading-relaxed text-muted">
          Setiap keluarga punya resep andalan — nasi goreng ala ibu, rendang warisan nenek,
          atau es cendol racikan sendiri. Sayangnya, resep-resep itu sering hanya tersimpan
          di kepala atau catatan yang mudah hilang. Kulinara lahir untuk mengabadikan dan
          membagikannya, supaya masakan rumahan Indonesia tetap hidup dan bisa dinikmati
          siapa saja.
        </p>
        <p className="m-0 text-sm leading-relaxed text-muted">
          Di sini, siapa pun bisa membuat resep lengkap dengan foto tiap langkah, berbagi ke
          komunitas, dan mendapat masukan langsung dari orang yang sudah mencobanya. Bukan
          sekadar kumpulan resep, tapi tempat bertukar cerita di balik setiap masakan.
        </p>
      </div>

      <div className="mb-10 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
        {VALUES.map((v) => (
          <div
            key={v.title}
            className="rounded-xl4 border p-5"
            style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
          >
            <div
              className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl2"
              style={{ background: v.bg }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke={v.fg} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
                <path d={v.path} />
              </svg>
            </div>
            <h3 className="font-display m-0 mb-1.5 text-base text-ink">{v.title}</h3>
            <p className="m-0 text-[13px] leading-relaxed text-muted">{v.desc}</p>
          </div>
        ))}
      </div>

      <div
        className="rounded-xl4 p-8 text-center"
        style={{ background: "linear-gradient(120deg,#FF5A36,#FFC93C)" }}
      >
        <h2 className="font-display m-0 mb-2 text-2xl font-semibold text-white">
          Punya resep andalan?
        </h2>
        <p className="mx-auto m-0 mb-5 max-w-[420px] text-sm text-white/90">
          Bergabung dengan komunitas Kulinara dan bagikan kreasimu ke ribuan pencinta masakan.
        </p>
        <Link
          href="/masuk"
          className="inline-block rounded-full px-6 py-3 text-sm font-semibold"
          style={{ background: "#fff", color: "#D94A24" }}
        >
          Mulai Berbagi Resep
        </Link>
      </div>
    </div>
  );
}
