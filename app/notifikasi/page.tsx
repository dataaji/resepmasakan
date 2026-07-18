"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { authorName } from "@/lib/selectors";
import { initials, timeAgo } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";
import { NotificationType } from "@/lib/types";

const TYPE_TEXT: Record<NotificationType, string> = {
  like: "menyukai resepmu",
  comment: "mengomentari resepmu",
  rating: "memberi rating resepmu",
  fork: "memodifikasi resepmu",
};

function TypeIcon({ type }: { type: NotificationType }) {
  const common = { fill: "none", strokeWidth: 2, width: 15, height: 15 };
  if (type === "like")
    return (
      <svg viewBox="0 0 24 24" {...common} stroke="#D4537E">
        <path d="M12 21s-7.5-4.8-10-9.5C0.3 8 1.8 4 6 4c2.4 0 3.8 1.4 6 3.6C14.2 5.4 15.6 4 18 4c4.2 0 5.7 4 4 7.5C19.5 16.2 12 21 12 21z" />
      </svg>
    );
  if (type === "comment")
    return (
      <svg viewBox="0 0 24 24" {...common} stroke="#1D7A8C">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  if (type === "rating")
    return (
      <svg viewBox="0 0 24 24" {...common} stroke="#A6740A">
        <polygon points="12 2 14.9 8.6 22 9.3 16.5 14 18.2 21 12 17.3 5.8 21 7.5 14 2 9.3 9.1 8.6" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" {...common} stroke="#639922">
      <path d="M6 3v12a3 3 0 0 0 3 3h6" />
      <path d="M15 6l3 3-3 3" />
    </svg>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const authLoading = useAppStore((s) => s.authLoading);
  const notifications = useAppStore((s) => s.notifications);
  const profiles = useAppStore((s) => s.profiles);
  const recipes = useAppStore((s) => s.recipes);
  const loadNotifications = useAppStore((s) => s.loadNotifications);
  const markNotificationsRead = useAppStore((s) => s.markNotificationsRead);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (profile) {
      loadNotifications()
        .then(() => markNotificationsRead())
        .finally(() => setLoaded(true));
    }
  }, [profile, loadNotifications, markNotificationsRead]);

  if (authLoading) return null;

  if (!profile) {
    return (
      <div className="mx-auto max-w-[600px] px-8 py-16 text-center">
        <p className="mb-3 text-[15px] text-muted">Masuk dulu untuk melihat notifikasimu.</p>
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
    <div className="mx-auto max-w-[680px] px-4 pb-16 pt-7 sm:px-8">
      <div className="mb-6">
        <h1 className="font-display m-0 mb-1 text-[32px] text-ink">Notifikasi</h1>
        <p className="m-0 text-[15px] text-muted">Aktivitas terbaru di resep-resepmu</p>
      </div>

      {!loaded ? (
        <EmptyState text="Memuat notifikasi..." />
      ) : notifications.length === 0 ? (
        <EmptyState text="Belum ada notifikasi. Bagikan resepmu supaya makin ramai!" />
      ) : (
        <div className="flex flex-col gap-2.5">
          {notifications.map((n) => {
            const actor = authorName({ profiles }, n.actorId);
            const recipe = n.recipeId
              ? recipes.find((r) => r.id === n.recipeId)
              : undefined;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => n.recipeId && router.push(`/resep?id=${n.recipeId}`)}
                className="flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left"
                style={{
                  background: n.read ? "var(--card)" : "var(--nav-wrap)",
                  borderColor: "var(--card-border)",
                }}
              >
                <span
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#FF5A36,#FFC93C)" }}
                >
                  {initials(actor)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-sm text-ink">
                    <span className="font-semibold">{actor}</span> {TYPE_TEXT[n.type]}
                    {recipe ? (
                      <span className="font-semibold"> &ldquo;{recipe.title}&rdquo;</span>
                    ) : null}
                  </p>
                  <p className="m-0 text-xs text-muted2">{timeAgo(n.createdAt)}</p>
                </div>
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full" style={{ background: "var(--nav-wrap)" }}>
                  <TypeIcon type={n.type} />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
