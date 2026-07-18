"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { initials, fileToCompressedDataUrl } from "@/lib/utils";
import RecipeCard from "@/components/RecipeCard";
import EmptyState from "@/components/EmptyState";

export default function ProfilePage() {
  const router = useRouter();
  const [tab, setTab] = useState<"created" | "saved">("created");
  const profile = useAppStore((s) => s.profile);
  const authLoading = useAppStore((s) => s.authLoading);
  const loadMine = useAppStore((s) => s.loadMine);
  const loadBookmarks = useAppStore((s) => s.loadBookmarks);
  const deleteRecipe = useAppStore((s) => s.deleteRecipe);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const askConfirm = useAppStore((s) => s.askConfirm);
  const showToast = useAppStore((s) => s.showToast);

  const created = useAppStore((s) =>
    s.recipes.filter((r) => r.userId === s.profile?.id)
  );
  const saved = useAppStore((s) => {
    if (!s.profile) return [];
    const ids = s.bookmarks
      .filter((b) => b.userId === s.profile!.id)
      .map((b) => b.recipeId);
    return s.recipes.filter((r) => ids.includes(r.id));
  });
  const [loaded, setLoaded] = useState(false);

  const [name, setName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      Promise.all([loadMine(), loadBookmarks()]).finally(() => setLoaded(true));
    }
  }, [profile?.id, loadMine, loadBookmarks]); // eslint-disable-line react-hooks/exhaustive-deps

  if (authLoading) return null;

  if (!profile) {
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

  const displayedAvatar = avatarPreview ?? profile.avatarUrl;
  const dirty = name.trim() !== profile.name || !!avatarPreview;
  const list = tab === "created" ? created : saved;

  async function handlePickAvatar(file: File | undefined) {
    if (!file) return;
    const dataUrl = await fileToCompressedDataUrl(file);
    setAvatarPreview(dataUrl);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    const ok = await updateProfile(name, avatarPreview);
    setSaving(false);
    if (ok) {
      setAvatarPreview(null);
      showToast("Profil tersimpan");
    } else {
      showToast("Gagal menyimpan profil", "error");
    }
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-7 sm:px-8">
      <div
        className="mb-8 rounded-xl4 border p-6"
        style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
      >
        <h1 className="font-display m-0 mb-5 text-2xl text-ink">Pengaturan Profil</h1>
        <div className="flex flex-wrap items-center gap-5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative block flex-none"
            title="Ganti foto profil"
          >
            {displayedAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayedAvatar}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
                style={{ background: "linear-gradient(135deg,#FF5A36,#FFC93C)" }}
              >
                {initials(profile.name)}
              </div>
            )}
            <span
              className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full text-white"
              style={{ background: "#FF5A36", boxShadow: "0 2px 6px rgba(0,0,0,.25)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 13, height: 13 }}>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePickAvatar(e.target.files?.[0])}
          />

          <div className="min-w-[220px] flex-1">
            <label className="mb-1.5 block text-[13px] font-semibold text-muted">Nama tampilan</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full max-w-[360px] rounded-xl2 border-2 px-3.5 py-2.5 text-[15px]"
              style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
            />
          </div>

          <button
            type="button"
            disabled={!dirty || !name.trim() || saving}
            onClick={handleSave}
            className="rounded-xl2 border-none px-5.5 py-3 text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: "#FF5A36" }}
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
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

      {!loaded ? (
        <EmptyState text="Memuat..." />
      ) : list.length === 0 ? (
        <EmptyState text={tab === "created" ? "Kamu belum punya resep." : "Belum ada resep yang kamu simpan."} />
      ) : (
        <div className="grid gap-5.5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
          {list.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              variant={tab === "created" ? "mine" : "public"}
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
