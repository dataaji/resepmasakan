"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { initials } from "@/lib/utils";
import RecipeCard from "@/components/RecipeCard";
import EmptyState from "@/components/EmptyState";

export default function ProfilePage() {
  const router = useRouter();
  const [tab, setTab] = useState<"created" | "saved">("created");
  const currentUser = useAppStore((s) =>
    s.users.find((u) => u.id === s.currentUserId)
  );
  const created = useAppStore((s) =>
    s.recipes.filter((r) => r.userId === s.currentUserId)
  );
  const saved = useAppStore((s) => {
    if (!s.currentUserId) return [];
    const ids = s.bookmarks
      .filter((b) => b.userId === s.currentUserId)
      .map((b) => b.recipeId);
    return s.recipes.filter((r) => ids.includes(r.id));
  });
  const deleteRecipe = useAppStore((s) => s.deleteRecipe);
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  if (!hasHydrated) return null;

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-[600px] px-8 py-16 text-center">
        <p className="mb-3 text-[15px] text-muted">Masuk dulu untuk melihat profilmu.</p>
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

  const list = tab === "created" ? created : saved;

  return (
    <div className="mx-auto max-w-[1200px] px-8 pb-16 pt-7">
      <div className="mb-7 flex items-center gap-4">
        <div
          className="flex h-16 w-16 flex-none items-center justify-center rounded-full text-xl font-bold text-white"
          style={{ background: "linear-gradient(135deg,#FF5A36,#FFC93C)" }}
        >
          {initials(currentUser.name)}
        </div>
        <div>
          <h1 className="font-display m-0 text-2xl text-ink">{currentUser.name}</h1>
          <p className="m-0 text-sm text-muted">{currentUser.email}</p>
          {!currentUser.emailVerified && (
            <p className="m-0 mt-1 text-xs font-semibold" style={{ color: "#A6740A" }}>
              Email belum diverifikasi
            </p>
          )}
        </div>
      </div>

      <div className="mb-5.5 flex gap-2.5">
        <TabButton active={tab === "created"} onClick={() => setTab("created")}>
          Dibuat ({created.length})
        </TabButton>
        <TabButton active={tab === "saved"} onClick={() => setTab("saved")}>
          Disimpan ({saved.length})
        </TabButton>
      </div>

      {list.length === 0 ? (
        <EmptyState text={tab === "created" ? "Kamu belum punya resep." : "Belum ada resep yang kamu simpan."} />
      ) : (
        <div className="grid gap-5.5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
          {list.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              variant={tab === "created" ? "mine" : "public"}
              onEdit={() => router.push(`/resep-saya/edit?id=${recipe.id}`)}
              onDelete={() => {
                if (window.confirm(`Hapus resep "${recipe.title}"?`)) {
                  deleteRecipe(recipe.id);
                }
              }}
            />
          ))}
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
