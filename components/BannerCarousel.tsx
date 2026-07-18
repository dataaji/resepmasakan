"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BANNERS } from "@/lib/banners";

export default function BannerCarousel() {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const touchStartX = useRef(0);

  const banner = BANNERS[index];

  function go(delta: number) {
    setIndex((i) => (i + delta + BANNERS.length) % BANNERS.length);
  }

  return (
    <div
      className="relative mb-7 flex min-h-[200px] items-center overflow-hidden rounded-xl4"
      style={{ background: banner.gradient }}
      onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        if (delta > 40) go(-1);
        else if (delta < -40) go(1);
      }}
    >
      {banner.imageUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(20,12,8,.82) 0%, rgba(20,12,8,.55) 45%, rgba(20,12,8,.15) 100%)",
            }}
          />
        </>
      )}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Sebelumnya"
        className="absolute left-3.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-none text-white backdrop-blur"
        style={{ background: "rgba(255,255,255,.25)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 16, height: 16 }}>
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Selanjutnya"
        className="absolute right-3.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-none text-white backdrop-blur"
        style={{ background: "rgba(255,255,255,.25)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 16, height: 16 }}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <div className="relative flex max-w-[600px] flex-col gap-2.5 px-12 py-6 text-white sm:px-20 sm:py-8">
        <span className="text-[11px] font-bold uppercase tracking-wider opacity-85">
          {banner.label}
        </span>
        <h2 className="font-display m-0 text-[20px] font-semibold tracking-tight sm:text-[26px]">
          {banner.title}
        </h2>
        <p className="m-0 text-sm opacity-90">{banner.subtitle}</p>
        <button
          type="button"
          onClick={() => router.push(banner.href)}
          className="mt-2 w-fit rounded-full border-none px-5 py-2.5 text-[13px] font-semibold"
          style={{ background: "#fff", color: "#2B2118" }}
        >
          {banner.ctaLabel}
        </button>
      </div>

      <div className="absolute bottom-3.5 left-0 right-0 flex justify-center gap-1.5">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className="h-1.5 rounded-full border-none"
            style={{
              width: i === index ? 20 : 8,
              background: i === index ? "#fff" : "rgba(255,255,255,.5)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
