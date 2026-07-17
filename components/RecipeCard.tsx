"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import {
  recipeRatingAvg,
  recipeLikeCount,
  isLikedBy,
  isBookmarkedBy,
} from "@/lib/selectors";
import { formatCookTime, formatRupiah } from "@/lib/utils";
import { Recipe } from "@/lib/types";
import RecipePhoto from "./RecipePhoto";
import { StarDisplay } from "./StarRating";

const DIFF_COLORS: Record<string, { bg: string; fg: string }> = {
  Mudah: { bg: "#E1F5E4", fg: "#1F8A3B" },
  Sedang: { bg: "#FFF3D1", fg: "#A6740A" },
  Sulit: { bg: "#FADADA", fg: "#C23A3A" },
};

export default function RecipeCard({
  recipe,
  variant = "public",
  onEdit,
  onDelete,
}: {
  recipe: Recipe;
  variant?: "public" | "mine";
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const rating = useAppStore((s) => recipeRatingAvg(s, recipe.id));
  const likes = useAppStore((s) => recipeLikeCount(s, recipe.id));
  const liked = useAppStore((s) => isLikedBy(s, profile?.id ?? null, recipe.id));
  const bookmarked = useAppStore((s) =>
    isBookmarkedBy(s, profile?.id ?? null, recipe.id)
  );
  const toggleLike = useAppStore((s) => s.toggleLike);
  const toggleBookmark = useAppStore((s) => s.toggleBookmark);
  const togglePrivacy = useAppStore((s) => s.togglePrivacy);

  const diff = DIFF_COLORS[recipe.difficulty];
  const likeDisabled = !profile;

  function open() {
    router.push(`/resep?id=${recipe.id}`);
  }

  return (
    <div
      onClick={open}
      className="flex cursor-pointer flex-col overflow-hidden rounded-xl3 border transition-transform hover:-translate-y-1"
      style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
    >
      <div className="relative aspect-[4/3] w-full">
        <RecipePhoto
          src={recipe.imageUrl}
          gradientIndex={recipe.placeholderIndex}
          alt={recipe.title}
        />
        <span
          className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
          style={{ background: "#FFFFFFE0", color: "#D94A24" }}
        >
          {recipe.category}
        </span>
        {variant === "public" && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!profile) {
                router.push("/masuk");
                return;
              }
              toggleBookmark(recipe.id);
            }}
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full"
            style={{ background: "rgba(0,0,0,.4)" }}
            aria-label="Simpan resep"
          >
            <svg
              viewBox="0 0 24 24"
              fill={bookmarked ? "#FFC93C" : "none"}
              stroke="#fff"
              strokeWidth={2}
              style={{ width: 16, height: 16 }}
            >
              <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3 className="m-0 text-[15px] font-semibold leading-tight text-ink">
          {recipe.title}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">
            {formatCookTime(recipe.cookTimeMinutes)}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{ background: diff.bg, color: diff.fg }}
          >
            {recipe.difficulty}
          </span>
          {recipe.estimatedCost !== null && (
            <span className="rounded-full bg-navWrap px-2 py-0.5 text-[11px] font-semibold text-muted">
              ~{formatRupiah(recipe.estimatedCost)}
            </span>
          )}
        </div>
        {variant === "public" ? (
          <div className="mt-auto flex items-center justify-between pt-1">
            <StarDisplay rating={rating} />
            <button
              type="button"
              disabled={likeDisabled}
              title={likeDisabled ? "Masuk untuk menyukai resep" : undefined}
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(recipe.id);
              }}
              className="flex items-center gap-1 rounded-full border-none bg-transparent px-2 py-1 text-xs font-semibold text-muted disabled:opacity-40"
            >
              <svg
                viewBox="0 0 24 24"
                fill={liked ? "#FF5A36" : "none"}
                stroke="currentColor"
                strokeWidth={2}
                style={{ width: 16, height: 16 }}
              >
                <path d="M12 21s-7.5-4.8-10-9.5C0.3 8 1.8 4 6 4c2.4 0 3.8 1.4 6 3.6C14.2 5.4 15.6 4 18 4c4.2 0 5.7 4 4 7.5C19.5 16.2 12 21 12 21z" />
              </svg>
              {likes}
            </button>
          </div>
        ) : (
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-muted">
              &#9733; {rating.toFixed(1)} &middot; {likes} suka
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePrivacy(recipe.id);
              }}
              className="ml-auto rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={
                recipe.isPublic
                  ? { background: "#E1F5E4", color: "#1F8A3B" }
                  : { background: "var(--nav-wrap)", color: "var(--muted)" }
              }
            >
              {recipe.isPublic ? "Publik" : "Privat"}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              aria-label="Edit resep"
              className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border"
              style={{ borderColor: "var(--input-border)" }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--ink)"
                strokeWidth={2}
                style={{ width: 14, height: 14 }}
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              aria-label="Hapus resep"
              className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border"
              style={{ borderColor: "var(--input-border)" }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C23A3A"
                strokeWidth={2}
                style={{ width: 14, height: 14 }}
              >
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
