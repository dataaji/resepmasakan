"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { authorName } from "@/lib/selectors";
import RecipePhoto from "@/components/RecipePhoto";
import EmptyState from "@/components/EmptyState";

export default function AdminPage() {
  const router = useRouter();
  const currentUser = useAppStore((s) =>
    s.users.find((u) => u.id === s.currentUserId)
  );
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  const recipeReports = useAppStore((s) =>
    s.recipeReports
      .filter((r) => r.status === "pending")
      .map((r) => ({ report: r, recipe: s.recipes.find((rec) => rec.id === r.recipeId) }))
      .filter((x) => x.recipe)
  );
  const commentReports = useAppStore((s) =>
    s.commentReports
      .filter((r) => r.status === "pending")
      .map((r) => ({ report: r, comment: s.comments.find((c) => c.id === r.commentId) }))
      .filter((x) => x.comment)
  );
  const users = useAppStore((s) =>
    s.users.filter((u) => u.id !== s.currentUserId)
  );
  const recipeCountByUser = useAppStore((s) => {
    const map: Record<string, number> = {};
    s.recipes.forEach((r) => {
      map[r.userId] = (map[r.userId] ?? 0) + 1;
    });
    return map;
  });

  const resolveRecipeReport = useAppStore((s) => s.resolveRecipeReport);
  const resolveCommentReport = useAppStore((s) => s.resolveCommentReport);
  const suspendUser = useAppStore((s) => s.suspendUser);
  const banUser = useAppStore((s) => s.banUser);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!currentUser) {
      router.replace("/admin/masuk");
    } else if (currentUser.role !== "admin") {
      router.replace("/");
    }
  }, [hasHydrated, currentUser, router]);

  if (!hasHydrated || !currentUser || currentUser.role !== "admin") return null;

  return (
    <div className="mx-auto max-w-[1000px] px-8 pb-16 pt-7">
      <div className="mb-7">
        <h1 className="font-display m-0 mb-1 text-[32px] text-ink">Panel Admin</h1>
        <p className="m-0 text-[15px] text-muted">Moderasi konten dan kelola pengguna ResepKita</p>
      </div>

      <Section title="Laporan Resep">
        {recipeReports.length === 0 ? (
          <EmptyState text="Tidak ada laporan resep yang menunggu." />
        ) : (
          <div className="flex flex-col gap-3">
            {recipeReports.map(({ report, recipe }) => (
              <div key={report.id} className="flex flex-wrap items-center gap-3.5 rounded-2xl border p-3.5" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
                <div className="h-14 w-14 flex-none overflow-hidden rounded-xl2">
                  <RecipePhoto src={recipe!.imageDataUrl} gradientIndex={recipe!.placeholderIndex} alt={recipe!.title} />
                </div>
                <div className="min-w-[160px] flex-1">
                  <p className="m-0 text-sm font-semibold text-ink">{recipe!.title}</p>
                  <p className="m-0 text-xs text-muted">oleh {authorName(useAppStore.getState(), recipe!.userId)}</p>
                  {report.reason && <p className="m-0 mt-1 text-xs text-muted2">Alasan: {report.reason}</p>}
                </div>
                <div className="flex flex-none gap-2">
                  <AdminButton color="#1F8A3B" bg="#E1F5E4" onClick={() => resolveRecipeReport(report.id, "approve")}>
                    Setujui
                  </AdminButton>
                  <AdminButton color="#A6740A" bg="#FFF3D1" onClick={() => resolveRecipeReport(report.id, "warn")}>
                    Peringatkan
                  </AdminButton>
                  <AdminButton color="#791F1F" bg="#FADADA" onClick={() => resolveRecipeReport(report.id, "delete")}>
                    Hapus
                  </AdminButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Laporan Komentar">
        {commentReports.length === 0 ? (
          <EmptyState text="Tidak ada laporan komentar yang menunggu." />
        ) : (
          <div className="flex flex-col gap-3">
            {commentReports.map(({ report, comment }) => {
              const recipe = useAppStore.getState().recipes.find((r) => r.id === comment!.recipeId);
              return (
                <div key={report.id} className="flex flex-wrap items-center gap-3.5 rounded-2xl border p-3.5" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
                  <div className="min-w-[160px] flex-1">
                    <p className="m-0 text-sm font-semibold text-ink">
                      {authorName(useAppStore.getState(), comment!.userId)} pada &ldquo;{recipe?.title ?? "Resep"}&rdquo;
                    </p>
                    <p className="m-0 mt-1 text-sm text-ink">{comment!.text}</p>
                    {report.reason && <p className="m-0 mt-1 text-xs text-muted2">Alasan: {report.reason}</p>}
                  </div>
                  <div className="flex flex-none gap-2">
                    <AdminButton color="var(--ink)" bg="var(--nav-wrap)" onClick={() => resolveCommentReport(report.id, "ignore")}>
                      Abaikan
                    </AdminButton>
                    <AdminButton color="#791F1F" bg="#FADADA" onClick={() => resolveCommentReport(report.id, "delete")}>
                      Hapus
                    </AdminButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Section title="Manajemen Pengguna">
        <div className="flex flex-col gap-2.5">
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center gap-3.5 rounded-2xl border p-3.5" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
              <div className="min-w-[160px] flex-1">
                <p className="m-0 text-sm font-semibold text-ink">{u.name}</p>
                <p className="m-0 text-xs text-muted">{u.email} &middot; {recipeCountByUser[u.id] ?? 0} resep</p>
              </div>
              <span
                className="flex-none rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={
                  u.status === "active"
                    ? { background: "#E1F5E4", color: "#1F8A3B" }
                    : u.status === "suspended"
                    ? { background: "#FFF3D1", color: "#A6740A" }
                    : { background: "#FADADA", color: "#791F1F" }
                }
              >
                {u.status === "active" ? "Aktif" : u.status === "suspended" ? "Ditangguhkan" : "Diblokir"}
              </span>
              <div className="flex flex-none gap-2">
                <AdminButton color="#A6740A" bg="#FFF3D1" onClick={() => suspendUser(u.id)}>
                  Tangguhkan
                </AdminButton>
                <AdminButton color="#791F1F" bg="#FADADA" onClick={() => banUser(u.id)}>
                  Blokir
                </AdminButton>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="font-display m-0 mb-3.5 text-lg text-ink">{title}</h2>
      {children}
    </div>
  );
}

function AdminButton({
  color,
  bg,
  onClick,
  children,
}: {
  color: string;
  bg: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border-none px-3 py-2 text-xs font-semibold"
      style={{ background: bg, color }}
    >
      {children}
    </button>
  );
}
