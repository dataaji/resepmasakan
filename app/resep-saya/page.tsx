"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import RecipeCard from "@/components/RecipeCard";
import EmptyState from "@/components/EmptyState";

export default function MyRecipesPage() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const authLoading = useAppStore((s) => s.authLoading);
  const loadMine = useAppStore((s) => s.loadMine);
  const deleteRecipe = useAppStore((s) => s.deleteRecipe);
  const askConfirm = useAppStore((s) => s.askConfirm);
  const showToast = useAppStore((s) => s.showToast);
  const recipes = useAppStore((s) =>
    s.recipes.filter((r) => r.userId === s.profile?.id)
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (profile) {
      loadMine().finally(() => setLoaded(true));
    }
  }, [profile, loadMine]);

  if (authLoading) return null;

  if (!profile) {
    return (
      <div className="mx-auto max-w-[600px] px-8 py-16 text-center">
        <p className="mb-3 text-[15px] text-muted">Masuk dulu untuk melihat resepmu.</p>
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
    <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-7 sm:px-8">
      <div className="mb-6.5 flex items-center justify-between">
        <div>
          <h1 className="font-display m-0 mb-1 text-[32px] text-ink">Resep Saya</h1>
          <p className="m-0 text-[15px] text-muted">Kelola resep buatanmu sendiri</p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/resep-saya/baru")}
          className="flex items-center gap-2 rounded-2xl border-none px-5.5 py-3 text-sm font-semibold text-white"
          style={{ background: "#FF5A36" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 16, height: 16 }}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah Resep Baru
        </button>
      </div>

      {!loaded ? (
        <EmptyState text="Memuat resepmu..." />
      ) : recipes.length === 0 ? (
        <EmptyState text="Kamu belum punya resep. Yuk buat yang pertama!" />
      ) : (
        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))" }}>
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              variant="mine"
              onEdit={() => router.push(`/resep-saya/edit?id=${recipe.id}`)}
              onDelete={() =>
                askConfirm({
                  title: "Hapus resep?",
                  message: `Resep "${recipe.title}" akan dihapus permanen beserta semua rating dan komentarnya.`,
                  onConfirm: async () => {
                    await deleteRecipe(recipe.id);
                    showToast("Resep dihapus");
                  },
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
