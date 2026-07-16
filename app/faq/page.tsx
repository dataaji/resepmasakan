"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/constants";

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mx-auto max-w-[720px] px-8 pb-16 pt-7">
      <div className="mb-7">
        <h1 className="font-display m-0 mb-1 text-[32px] text-ink">FAQ & Kontak</h1>
        <p className="m-0 text-[15px] text-muted">Pertanyaan umum dan cara menghubungi kami</p>
      </div>

      <div className="mb-10 flex flex-col gap-2.5">
        {FAQ_ITEMS.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={i} className="overflow-hidden rounded-xl2 border" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-center justify-between gap-3 border-none bg-transparent px-4.5 py-3.5 text-left text-sm font-semibold text-ink"
              >
                {item.q}
                <span className="flex-none text-muted">{open ? "−" : "+"}</span>
              </button>
              {open && (
                <p className="m-0 px-4.5 pb-4 text-sm leading-relaxed text-muted">{item.a}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-xl4 border p-6.5" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
        <h2 className="font-display m-0 mb-1 text-lg text-ink">Hubungi kami</h2>
        <p className="m-0 mb-5 text-sm text-muted">Kirim pesan dan tim kami akan membalas lewat email</p>

        {submitted ? (
          <p className="m-0 rounded-lg px-3.5 py-3 text-sm" style={{ background: "#E1F5E4", color: "#1F8A3B" }}>
            Pesanmu terkirim. Terima kasih sudah menghubungi kami.
          </p>
        ) : (
          <>
            <label className="mb-1.5 block text-[13px] font-semibold text-muted">Nama</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama kamu"
              className="mb-4 w-full rounded-xl2 border-2 px-3.5 py-2.5 text-sm"
              style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
            />
            <label className="mb-1.5 block text-[13px] font-semibold text-muted">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="mb-4 w-full rounded-xl2 border-2 px-3.5 py-2.5 text-sm"
              style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
            />
            <label className="mb-1.5 block text-[13px] font-semibold text-muted">Pesan</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tulis pesanmu..."
              className="mb-5 min-h-[100px] w-full resize-y rounded-xl2 border-2 px-3.5 py-2.5 text-sm"
              style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
            />
            <button
              type="button"
              disabled={!name.trim() || !email.trim() || !message.trim()}
              onClick={() => setSubmitted(true)}
              className="rounded-xl2 border-none px-5.5 py-3 text-sm font-semibold text-white disabled:opacity-40"
              style={{ background: "#FF5A36" }}
            >
              Kirim Pesan
            </button>
          </>
        )}
      </div>
    </div>
  );
}
