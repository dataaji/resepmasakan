"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import RecipeCard from "@/components/RecipeCard";
import EmptyState from "@/components/EmptyState";

export default function SavedPage() {
  const router = useRouter();
  const currentUser = useAppStore((s) =>
    s.users.find((u) => u.id === s.currentUserId)
  );
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const recipes = useAppStore((s) => {
    if (!s.currentUserId) return [];
    const ids = s.bookmarks
      .filter((b) => b.userId === s.currentUserId)
      .map((b) => b.recipeId);
    return s.recipes.filter((r) => ids.includes(r.id));
  });

  if (!hasHydrated) return null;

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-[600px] px-8 py-16 text-center">
        <p className="mb-3 text-[15px] text-muted">Masuk dulu untuk melihat koleksimu.</p>
        <button
          type="button"
          onClick={() => router.push("/masuk")}
          className="rounded-xl2 border-none px-5 py-2.5 text-sm font-semibold text-white"
          style={{ background: "#FF5A36" }}
        >
          Masuk
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-8 pb-16 pt-7">
      <div className="mb-6.5">
        <h1 className="font-display m-0 mb-1 text-[32px] text-ink">Koleksi</h1>
        <p className="m-0 text-[15px] text-muted">Resep yang kamu simpan</p>
      </div>

      {recipes.length === 0 ? (
        <EmptyState text="Belum ada resep yang kamu simpan." />
      ) : (
        <div className="grid gap-5.5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} variant="public" />
          ))}
        </div>
      )}
    </div>
  );
}
