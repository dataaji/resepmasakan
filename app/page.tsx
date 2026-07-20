"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { filterAndSortHome, HomeFilters } from "@/lib/selectors";
import CategoryDropdown from "@/components/CategoryDropdown";
import BannerCarousel from "@/components/BannerCarousel";
import RecipeCard from "@/components/RecipeCard";
import EmptyState from "@/components/EmptyState";

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const loadPublic = useAppStore((s) => s.loadPublic);
  const publicLoaded = useAppStore((s) => s.publicLoaded);
  const categories = useAppStore((s) => s.categories);
  const popularSearches = useAppStore((s) => s.popularSearches);

  const categoryOptions = useMemo(
    () => [
      { value: "Semua", label: "Semua" },
      ...[...categories]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((c) => ({ value: c.name, label: c.name, dot: c.dot })),
    ],
    [categories]
  );

  const [filters, setFilters] = useState<HomeFilters>({
    search: "",
    category: "Semua",
    ingredient: "",
    time: (searchParams.get("time") as HomeFilters["time"]) || "Semua",
    difficulty: "Semua",
    sort: "rating",
  });

  useEffect(() => {
    loadPublic();
  }, [loadPublic]);

  // Klik "Beranda"/logo saat sudah di halaman ini akan mengosongkan filter.
  useEffect(() => {
    const reset = () => {
      setFilters({
        search: "",
        category: "Semua",
        ingredient: "",
        time: "Semua",
        difficulty: "Semua",
        sort: "rating",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("kulinara:home-reset", reset);
    return () => window.removeEventListener("kulinara:home-reset", reset);
  }, []);

  const list = useAppStore((s) => filterAndSortHome(s, filters));

  const resultsLabel = useMemo(
    () => `${list.length} resep ditemukan`,
    [list.length]
  );

  const PAGE_SIZE = 12;
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Kembali ke halaman 1 setiap kali filter berubah.
  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.category, filters.ingredient, filters.time, filters.difficulty, filters.sort]);

  function goPage(p: number) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-7 sm:px-8">
      <div className="mb-7 pt-1.5">
        <h1 className="font-display m-0 mb-1.5 text-[30px] font-semibold tracking-tight text-ink sm:text-[38px]">
          Jelajah Resep
        </h1>
        <p className="m-0 text-[15px] text-muted">
          Temukan resep favorit dari komunitas Kulinara
        </p>
      </div>

      {/* Search bar utama — gaya bersih ala marketplace */}
      <div className="relative mb-4">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
          style={{ width: 20, height: 20, color: "var(--muted2)" }}
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          placeholder="Cari resep, mis. rendang, nasi goreng..."
          className="w-full rounded-full border-2 py-3.5 pl-12 pr-4 text-[15px] shadow-sm"
          style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
        />
      </div>

      {/* Kategori (dropdown) + filter tambahan + urutan */}
      <div className="mb-7 flex flex-wrap items-center gap-2.5">
        <CategoryDropdown
          options={categoryOptions}
          selected={filters.category}
          onSelect={(v) => setFilters((f) => ({ ...f, category: v as HomeFilters["category"] }))}
        />
        <input
          value={filters.ingredient}
          onChange={(e) => setFilters((f) => ({ ...f, ingredient: e.target.value }))}
          placeholder="Cari bahan (mis. ayam)"
          className="w-full rounded-full border-2 px-3.5 py-2 text-[13px] sm:w-[180px]"
          style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
        />
        <select
          value={filters.time}
          onChange={(e) => setFilters((f) => ({ ...f, time: e.target.value as HomeFilters["time"] }))}
          className="flex-1 rounded-full border-2 px-3.5 py-2 text-[13px] font-semibold sm:flex-none"
          style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
        >
          <option value="Semua">Semua Waktu</option>
          <option value="15">&le; 15 menit</option>
          <option value="30">&le; 30 menit</option>
          <option value="60">&le; 60 menit</option>
          <option value="60+">Lebih dari 60 menit</option>
        </select>
        <select
          value={filters.difficulty}
          onChange={(e) => setFilters((f) => ({ ...f, difficulty: e.target.value as HomeFilters["difficulty"] }))}
          className="flex-1 rounded-full border-2 px-3.5 py-2 text-[13px] font-semibold sm:flex-none"
          style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
        >
          <option value="Semua">Semua Tingkat</option>
          <option value="Mudah">Mudah</option>
          <option value="Sedang">Sedang</option>
          <option value="Sulit">Sulit</option>
        </select>
        <select
          value={filters.sort}
          onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as HomeFilters["sort"] }))}
          className="w-full rounded-full border-2 px-3.5 py-2 text-[13px] font-semibold sm:ml-auto sm:w-auto"
          style={{ borderColor: "#FF5A36", background: "#FFE1D6", color: "#D94A24" }}
        >
          <option value="rating">Rating Tertinggi</option>
          <option value="like">Paling Disukai</option>
          <option value="terbaru">Terbaru</option>
          <option value="termurah">Termurah</option>
        </select>
      </div>

      <BannerCarousel />

      <div className="mb-7">
        <h2 className="font-display mb-3 text-[19px] font-semibold text-ink">
          Pencarian Populer
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[...popularSearches]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setFilters((f) => ({ ...f, search: s.label, category: "Semua" }))}
              className="group relative h-[104px] overflow-hidden rounded-xl2 border text-left"
              style={{
                borderColor: "var(--card-border)",
                background: "linear-gradient(135deg,#FF5A36,#FFC93C)",
              }}
            >
              {s.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.imageUrl}
                  alt={s.label}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(20,12,8,.82) 0%, rgba(20,12,8,.25) 55%, rgba(20,12,8,.05) 100%)",
                }}
              />
              <span className="absolute inset-x-3 bottom-2.5 text-[14px] font-bold text-white">
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-[13px] text-muted">
        {publicLoaded ? resultsLabel : "Memuat resep..."}
      </p>

      {publicLoaded && list.length === 0 ? (
        <EmptyState text="Tidak ada resep yang cocok dengan filter kamu." />
      ) : (
        <>
          <div className="grid gap-5.5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
            {pageItems.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} variant="public" />
            ))}
          </div>

          {pageCount > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => goPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="rounded-full border-2 px-4 py-2 text-[13px] font-semibold disabled:opacity-40"
                style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
              >
                Sebelumnya
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pageCount || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center">
                    {idx > 0 && p - arr[idx - 1] > 1 && (
                      <span className="px-1 text-muted2">…</span>
                    )}
                    <button
                      type="button"
                      onClick={() => goPage(p)}
                      className="h-9 min-w-[36px] rounded-full border-2 px-2 text-[13px] font-semibold"
                      style={
                        p === currentPage
                          ? { borderColor: "#FF5A36", background: "#FF5A36", color: "#fff" }
                          : { borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }
                      }
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                type="button"
                onClick={() => goPage(currentPage + 1)}
                disabled={currentPage >= pageCount}
                className="rounded-full border-2 px-4 py-2 text-[13px] font-semibold disabled:opacity-40"
                style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
              >
                Selanjutnya
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
