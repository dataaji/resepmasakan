"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { filterAndSortHome, HomeFilters } from "@/lib/selectors";
import { CATEGORIES, POPULAR_SEARCHES } from "@/lib/constants";
import ChipGroup from "@/components/ChipGroup";
import BannerCarousel from "@/components/BannerCarousel";
import RecipeCard from "@/components/RecipeCard";
import EmptyState from "@/components/EmptyState";

const CATEGORY_OPTIONS = [
  { value: "Semua", label: "Semua" },
  ...CATEGORIES.map((c) => ({ value: c.value, label: c.value, dot: c.dot })),
];

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

  const list = useAppStore((s) => filterAndSortHome(s, filters));

  const resultsLabel = useMemo(
    () => `${list.length} resep ditemukan`,
    [list.length]
  );

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

      <div
        className="mb-7 rounded-xl4 border p-5"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <div className="relative mb-4">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ width: 18, height: 18, color: "var(--muted2)" }}
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder="Cari resep, mis. rendang, nasi goreng..."
            className="w-full rounded-xl border-2 py-3 pl-11 pr-4 text-[15px]"
            style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <ChipGroup
            options={CATEGORY_OPTIONS}
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
      </div>

      <BannerCarousel />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[13px] font-semibold text-muted">Pencarian populer:</span>
        {POPULAR_SEARCHES.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => setFilters((f) => ({ ...f, search: term, category: "Semua" }))}
            className="rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={{
              borderColor: "var(--card-border)",
              background: "var(--card)",
              color: "var(--ink)",
            }}
          >
            {term}
          </button>
        ))}
      </div>

      <p className="mb-4 text-[13px] text-muted">
        {publicLoaded ? resultsLabel : "Memuat resep..."}
      </p>

      {publicLoaded && list.length === 0 ? (
        <EmptyState text="Tidak ada resep yang cocok dengan filter kamu." />
      ) : (
        <div className="grid gap-5.5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
          {list.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} variant="public" />
          ))}
        </div>
      )}
    </div>
  );
}
