"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { authorName } from "@/lib/selectors";
import RecipePhoto from "@/components/RecipePhoto";
import EmptyState from "@/components/EmptyState";

export default function AdminPage() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const authLoading = useAppStore((s) => s.authLoading);
  const loadAdmin = useAppStore((s) => s.loadAdmin);

  const recipes = useAppStore((s) => s.recipes);
  const comments = useAppStore((s) => s.comments);
  const profiles = useAppStore((s) => s.profiles);
  const recipeReports = useAppStore((s) =>
    s.recipeReports.filter((r) => r.status === "pending")
  );
  const commentReports = useAppStore((s) =>
    s.commentReports.filter((r) => r.status === "pending")
  );

  const resolveRecipeReport = useAppStore((s) => s.resolveRecipeReport);
  const resolveCommentReport = useAppStore((s) => s.resolveCommentReport);
  const suspendUser = useAppStore((s) => s.suspendUser);
  const banUser = useAppStore((s) => s.banUser);
  const setUserRole = useAppStore((s) => s.setUserRole);
  const askConfirm = useAppStore((s) => s.askConfirm);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!profile) {
        router.replace("/masuk");
      } else if (profile.role !== "admin") {
        router.replace("/");
      } else {
        loadAdmin().finally(() => setLoaded(true));
      }
    }
  }, [authLoading, profile, router, loadAdmin]);

  if (authLoading || !profile || profile.role !== "admin") return null;

  const users = profiles.filter((p) => p.id !== profile.id);
  const recipeCountByUser: Record<string, number> = {};
  for (const r of recipes) {
    recipeCountByUser[r.userId] = (recipeCountByUser[r.userId] ?? 0) + 1;
  }

  const pendingRecipeReports = recipeReports
    .map((report) => ({ report, recipe: recipes.find((r) => r.id === report.recipeId) }))
    .filter((x) => x.recipe);
  const pendingCommentReports = commentReports
    .map((report) => ({ report, comment: comments.find((c) => c.id === report.commentId) }))
    .filter((x) => x.comment);

  return (
    <div className="mx-auto max-w-[1000px] px-4 pb-16 pt-7 sm:px-8">
      <div className="mb-7">
        <h1 className="font-display m-0 mb-1 text-[32px] text-ink">Panel Admin</h1>
        <p className="m-0 text-[15px] text-muted">Moderasi konten dan kelola pengguna Kulinara</p>
      </div>

      {!loaded ? (
        <EmptyState text="Memuat data moderasi..." />
      ) : (
        <>
          <Section title="Laporan Resep">
            {pendingRecipeReports.length === 0 ? (
              <EmptyState text="Tidak ada laporan resep yang menunggu." />
            ) : (
              <div className="flex flex-col gap-3">
                {pendingRecipeReports.map(({ report, recipe }) => (
                  <div key={report.id} className="flex flex-wrap items-center gap-3.5 rounded-2xl border p-3.5" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
                    <div className="h-14 w-14 flex-none overflow-hidden rounded-xl2">
                      <RecipePhoto src={recipe!.imageUrl} gradientIndex={recipe!.placeholderIndex} alt={recipe!.title} />
                    </div>
                    <div className="min-w-[160px] flex-1">
                      <p className="m-0 text-sm font-semibold text-ink">{recipe!.title}</p>
                      <p className="m-0 text-xs text-muted">oleh {authorName({ profiles }, recipe!.userId)}</p>
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
            {pendingCommentReports.length === 0 ? (
              <EmptyState text="Tidak ada laporan komentar yang menunggu." />
            ) : (
              <div className="flex flex-col gap-3">
                {pendingCommentReports.map(({ report, comment }) => {
                  const recipe = recipes.find((r) => r.id === comment!.recipeId);
                  return (
                    <div key={report.id} className="flex flex-wrap items-center gap-3.5 rounded-2xl border p-3.5" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
                      <div className="min-w-[160px] flex-1">
                        <p className="m-0 text-sm font-semibold text-ink">
                          {authorName({ profiles }, comment!.userId)} pada &ldquo;{recipe?.title ?? "Resep"}&rdquo;
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
                    <p className="m-0 flex items-center gap-2 text-sm font-semibold text-ink">
                      {u.name}
                      {u.role !== "user" && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={
                            u.role === "super_admin"
                              ? { background: "#EEEDFE", color: "#3C3489" }
                              : { background: "#FFE1D6", color: "#D94A24" }
                          }
                        >
                          {u.role === "super_admin" ? "Super Admin" : "Admin"}
                        </span>
                      )}
                    </p>
                    <p className="m-0 text-xs text-muted">{recipeCountByUser[u.id] ?? 0} resep</p>
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
                  <div className="flex flex-none flex-wrap gap-2">
                    {profile.role === "super_admin" && u.role !== "super_admin" && (
                      u.role === "admin" ? (
                        <AdminButton
                          color="#3C3489"
                          bg="#EEEDFE"
                          onClick={() =>
                            askConfirm({
                              title: "Cabut akses admin?",
                              message: `${u.name} tidak akan bisa lagi membuka panel admin.`,
                              confirmLabel: "Cabut",
                              danger: false,
                              onConfirm: () => setUserRole(u.id, "user"),
                            })
                          }
                        >
                          Cabut Admin
                        </AdminButton>
                      ) : (
                        <AdminButton
                          color="#3C3489"
                          bg="#EEEDFE"
                          onClick={() =>
                            askConfirm({
                              title: "Jadikan admin?",
                              message: `${u.name} akan bisa membuka panel admin dan memoderasi konten.`,
                              confirmLabel: "Jadikan Admin",
                              danger: false,
                              onConfirm: () => setUserRole(u.id, "admin"),
                            })
                          }
                        >
                          Jadikan Admin
                        </AdminButton>
                      )
                    )}
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
        </>
      )}
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
