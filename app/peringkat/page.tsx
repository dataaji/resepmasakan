"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { rankingList, recipeRatingAvg, recipeRatingCount, authorName } from "@/lib/selectors";
import { CATEGORIES } from "@/lib/constants";
import { Category } from "@/lib/types";
import { formatCookTime } from "@/lib/utils";
import RecipePhoto from "@/components/RecipePhoto";
import { StarDisplay } from "@/components/StarRating";
import EmptyState from "@/components/EmptyState";

const CATEGORY_OPTIONS = [
  { value: "Semua", label: "Semua" },
  ...CATEGORIES.map((c) => ({ value: c.value, label: c.value, dot: c.dot })),
];

export default function RankingPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<"all" | "trending">("all");
  const [category, setCategory] = useState<Category | "Semua">("Semua");

  const list = useAppStore((s) => rankingList(s, period, category));

  return (
    <div className="mx-auto max-w-[900px] px-8 pb-16 pt-7">
      <div className="mb-5.5">
        <h1 className="font-display m-0 mb-1 text-[32px] text-ink">Peringkat Resep</h1>
        <p className="m-0 text-[15px] text-muted">Resep terbaik menurut komunitas ResepKita</p>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <TabButton active={period === "all"} onClick={() => setPeriod("all")}>
          All-Time
        </TabButton>
        <TabButton active={period === "trending"} onClick={() => setPeriod("trending")}>
          Trending Minggu Ini
        </TabButton>
        <span className="mx-1 h-5.5 w-px" style={{ background: "var(--card-border)" }} />
        {CATEGORY_OPTIONS.map((opt) => {
          const active = opt.value === category;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCategory(opt.value as Category | "Semua")}
              className="flex items-center gap-1.5 rounded-full border-2 px-3.5 py-2 text-[13px] font-semibold"
              style={{
                borderColor: active ? "#FF5A36" : "var(--input-border)",
                background: active ? "#FFE1D6" : "var(--card)",
                color: active ? "#D94A24" : "var(--ink)",
              }}
            >
              {"dot" in opt && opt.dot && (
                <span className="inline-block h-[7px] w-[7px] rounded-full" style={{ background: opt.dot }} />
              )}
              {opt.label}
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <EmptyState text="Tidak ada resep untuk kategori ini." />
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((recipe, i) => {
            const rating = recipeRatingAvg(useAppStore.getState(), recipe.id);
            const count = recipeRatingCount(useAppStore.getState(), recipe.id);
            return (
              <div
                key={recipe.id}
                onClick={() => router.push(`/resep?id=${recipe.id}`)}
                className="flex cursor-pointer items-center gap-4 rounded-2xl border px-4.5 py-3"
                style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
              >
                <span
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-sm font-bold"
                  style={
                    i < 3
                      ? { background: "#FFE1D6", color: "#D94A24" }
                      : { background: "var(--nav-wrap)", color: "var(--muted)" }
                  }
                >
                  {i + 1}
                </span>
                <div className="h-[60px] w-[60px] flex-none overflow-hidden rounded-xl2">
                  <RecipePhoto src={recipe.imageDataUrl} gradientIndex={recipe.placeholderIndex} alt={recipe.title} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="m-0 truncate text-[15px] font-semibold text-ink">{recipe.title}</h3>
                  </div>
                  <p className="m-0 text-xs text-muted">
                    oleh {authorName(useAppStore.getState(), recipe.userId)} &middot; {formatCookTime(recipe.cookTimeMinutes)}
                  </p>
                </div>
                <div className="flex-none text-right">
                  <StarDisplay rating={rating} showValue />
                  <p className="m-0 text-[11px] text-muted2">{count} rating</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-4 py-2 text-[13px] font-semibold"
      style={
        active
          ? { background: "#FF5A36", color: "#fff" }
          : { background: "var(--nav-wrap)", color: "var(--ink)" }
      }
    >
      {children}
    </button>
  );
}
