"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import {
  recipeRatingAvg,
  recipeRatingCount,
  recipeLikeCount,
  commentsFor,
  isLikedBy,
  isBookmarkedBy,
  ratingByUser,
  isVerifiedCommenter,
  authorName,
  cookPhotosFor,
} from "@/lib/selectors";
import { CATEGORIES } from "@/lib/constants";
import { formatCookTime, formatRupiah, initials, timeAgo } from "@/lib/utils";
import RecipePhoto from "@/components/RecipePhoto";
import ImageUpload from "@/components/ImageUpload";
import { StarInput } from "@/components/StarRating";
import ReportControl from "@/components/ReportControl";
import EmptyState from "@/components/EmptyState";

const DIFF_COLORS: Record<string, { bg: string; fg: string }> = {
  Mudah: { bg: "#E1F5E4", fg: "#1F8A3B" },
  Sedang: { bg: "#FFF3D1", fg: "#A6740A" },
  Sulit: { bg: "#FADADA", fg: "#C23A3A" },
};

export default function RecipeDetailPage() {
  return (
    <Suspense fallback={null}>
      <RecipeDetailContent />
    </Suspense>
  );
}

function RecipeDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const recipeId = searchParams.get("id") ?? "";

  const recipe = useAppStore((s) => s.recipes.find((r) => r.id === recipeId));
  const currentUser = useAppStore((s) =>
    s.users.find((u) => u.id === s.currentUserId)
  );
  const rating = useAppStore((s) => recipeRatingAvg(s, recipeId));
  const ratingCount = useAppStore((s) => recipeRatingCount(s, recipeId));
  const likes = useAppStore((s) => recipeLikeCount(s, recipeId));
  const comments = useAppStore((s) => commentsFor(s, recipeId));
  const liked = useAppStore((s) => isLikedBy(s, currentUser?.id ?? null, recipeId));
  const bookmarked = useAppStore((s) =>
    isBookmarkedBy(s, currentUser?.id ?? null, recipeId)
  );
  const myRating = useAppStore((s) =>
    ratingByUser(s, currentUser?.id ?? null, recipeId)
  );
  const cookPhotos = useAppStore((s) => cookPhotosFor(s, recipeId));
  const recipeReports = useAppStore((s) =>
    s.recipeReports.filter((r) => r.recipeId === recipeId)
  );
  const recipeReportPending = recipeReports.some((r) => r.status === "pending");
  const commentReports = useAppStore((s) => s.commentReports);
  const forkedFrom = useAppStore((s) =>
    recipe?.forkedFromId ? s.recipes.find((r) => r.id === recipe.forkedFromId) : null
  );

  const toggleLike = useAppStore((s) => s.toggleLike);
  const toggleBookmark = useAppStore((s) => s.toggleBookmark);
  const submitRating = useAppStore((s) => s.submitRating);
  const addComment = useAppStore((s) => s.addComment);
  const reportRecipe = useAppStore((s) => s.reportRecipe);
  const reportComment = useAppStore((s) => s.reportComment);
  const forkRecipe = useAppStore((s) => s.forkRecipe);

  const [myStars, setMyStars] = useState(myRating?.stars ?? 0);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [stagingPhoto, setStagingPhoto] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  if (!hasHydrated) return null;

  if (!recipe) {
    return (
      <div className="mx-auto max-w-[600px] px-8 py-16 text-center">
        <p className="text-[15px] text-muted">Resep tidak ditemukan.</p>
        <Link href="/" className="mt-3 inline-block font-semibold text-[#D94A24]">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const isLoggedIn = !!currentUser;
  const canInteract = !!currentUser && currentUser.emailVerified;
  const isMine = currentUser?.id === recipe.userId;
  const diff = DIFF_COLORS[recipe.difficulty];
  const category = CATEGORIES.find((c) => c.value === recipe.category);

  function requireLogin(action: () => void) {
    if (!isLoggedIn) {
      router.push("/masuk");
      return;
    }
    action();
  }

  function handleFork() {
    requireLogin(() => {
      const newId = forkRecipe(recipe!.id);
      if (newId) router.push(`/resep-saya/edit?id=${newId}`);
    });
  }

  function handleRate(n: number) {
    if (!canInteract) return;
    setMyStars(n);
    if (!showPhotoUpload) {
      submitRating(recipe!.id, n, myRating?.photoDataUrl ?? null);
    }
  }

  return (
    <div className="mx-auto max-w-[1100px] px-8 pb-16 pt-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4.5 flex items-center gap-1.5 border-none bg-transparent p-0 text-sm font-semibold text-ink"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 18, height: 18 }}>
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Kembali
      </button>

      {forkedFrom && (
        <Link
          href={`/resep?id=${forkedFrom.id}`}
          className="mb-3.5 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs text-muted"
          style={{ background: "var(--nav-wrap)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 13, height: 13 }}>
            <path d="M6 3v12a3 3 0 0 0 3 3h6" />
            <path d="M15 6l3 3-3 3" />
          </svg>
          Dimodifikasi dari {forkedFrom.title} oleh {authorName(useAppStore.getState(), forkedFrom.userId)}
        </Link>
      )}

      {cookPhotos.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
            Hasil Masakan Pengguna
          </p>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {cookPhotos.map((cp, i) => (
              <div
                key={i}
                className="h-[84px] w-[84px] flex-none overflow-hidden rounded-2xl border-2"
                style={{ borderColor: "var(--card-border)" }}
              >
                <RecipePhoto
                  src={cp.photoDataUrl}
                  gradientIndex={i}
                  alt={`Foto oleh ${cp.author}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative mb-5 aspect-[20/9] overflow-hidden rounded-xl4">
        <RecipePhoto
          src={recipe.imageDataUrl}
          gradientIndex={recipe.placeholderIndex}
          alt={recipe.title}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(20,12,8,.88) 0%, rgba(20,12,8,.2) 55%, transparent 78%)",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-2 px-8 py-7">
          <div className="flex gap-2.5">
            <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: "#FFFFFFE0", color: "#D94A24" }}>
              {recipe.category}
            </span>
            <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: diff.bg, color: diff.fg }}>
              {recipe.difficulty}
            </span>
          </div>
          <h1 className="font-display m-0 text-[34px] font-semibold tracking-tight text-white">
            {recipe.title}
          </h1>
          <p className="m-0 text-sm text-white/80">oleh {authorName(useAppStore.getState(), recipe.userId)}</p>
        </div>
      </div>

      <div className="mb-5 grid gap-3.5" style={{ gridTemplateColumns: `repeat(${recipe.estimatedCost !== null ? 4 : 3},1fr)` }}>
        <StatCard icon="clock" bg="#FFE1D6" fg="#D94A24" label="Waktu Masak" value={formatCookTime(recipe.cookTimeMinutes)} />
        <StatCard icon="users" bg="#DDF3F6" fg="#1D7A8C" label="Porsi" value={`${recipe.servings} orang`} />
        <StatCard icon="star" bg="#FFF3D1" fg="#A6740A" label="Rating" value={`${rating.toFixed(1)} / 5 (${ratingCount})`} />
        {recipe.estimatedCost !== null && (
          <StatCard icon="cost" bg="#E1F5E4" fg="#1F8A3B" label="Estimasi Biaya" value={`~${formatRupiah(recipe.estimatedCost)}`} />
        )}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => router.push(`/masak?id=${recipe.id}`)}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-none py-3.5 text-[15px] font-semibold text-white"
          style={{ background: "#FF5A36" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 18, height: 18 }}>
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Mulai Masak
        </button>
        {!isMine && (
          <button
            type="button"
            onClick={handleFork}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 px-5 py-3.5 text-[15px] font-semibold"
            style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 18, height: 18 }}>
              <path d="M6 3v12a3 3 0 0 0 3 3h6" />
              <path d="M15 6l3 3-3 3" />
            </svg>
            Modifikasi Resep Ini
          </button>
        )}
        <div className="px-1.5">
          <ReportControl
            reported={recipeReportPending}
            onSubmit={(reason) => requireLogin(() => reportRecipe(recipe.id, reason))}
          />
        </div>
      </div>

      <div
        className="mb-7 flex flex-wrap items-center justify-between gap-4 rounded-xl3 p-5 px-6"
        style={{ background: "var(--card)" }}
      >
        <div>
          <StarInput value={myStars} onChange={handleRate} disabled={!canInteract} />
          <span className="text-xs text-muted2">
            {canInteract
              ? myRating
                ? "Kamu sudah memberi rating untuk resep ini"
                : "Beri rating untuk resep ini"
              : "Verifikasi email untuk memberi rating"}
          </span>
          {canInteract && !showPhotoUpload && (
            <button
              type="button"
              onClick={() => setShowPhotoUpload(true)}
              className="mt-2 block border-none bg-transparent p-0 text-xs font-semibold text-[#D94A24]"
            >
              + Sertakan foto hasil masakanmu (opsional)
            </button>
          )}
          {canInteract && showPhotoUpload && (
            <div className="mt-2.5 flex items-center gap-2.5">
              <div className="h-16 w-16 flex-none overflow-hidden rounded-xl2">
                <ImageUpload
                  value={stagingPhoto}
                  gradientIndex={0}
                  onChange={setStagingPhoto}
                  aspect="aspect-square"
                />
              </div>
              <button
                type="button"
                disabled={myStars === 0}
                onClick={() => {
                  submitRating(recipe.id, myStars, stagingPhoto);
                  setShowPhotoUpload(false);
                }}
                className="rounded-lg border-none px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-40"
                style={{ background: "#FF5A36" }}
              >
                Kirim rating & foto
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={!canInteract}
            title="Verifikasi email untuk menyukai resep"
            onClick={() => requireLogin(() => toggleLike(recipe.id))}
            className="flex items-center gap-2 rounded-xl2 border-2 px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
            style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
          >
            <svg viewBox="0 0 24 24" fill={liked ? "#FF5A36" : "none"} stroke="currentColor" strokeWidth={2} style={{ width: 18, height: 18 }}>
              <path d="M12 21s-7.5-4.8-10-9.5C0.3 8 1.8 4 6 4c2.4 0 3.8 1.4 6 3.6C14.2 5.4 15.6 4 18 4c4.2 0 5.7 4 4 7.5C19.5 16.2 12 21 12 21z" />
            </svg>
            Suka ({likes})
          </button>
          <button
            type="button"
            onClick={() => requireLogin(() => toggleBookmark(recipe.id))}
            className="flex items-center gap-2 rounded-xl2 border-2 px-4 py-2.5 text-sm font-semibold"
            style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
          >
            <svg viewBox="0 0 24 24" fill={bookmarked ? "#FFC93C" : "none"} stroke="currentColor" strokeWidth={2} style={{ width: 18, height: 18 }}>
              <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
            </svg>
            Simpan
          </button>
        </div>
      </div>

      <div className="mb-7 grid gap-9" style={{ gridTemplateColumns: "1fr 1.4fr" }}>
        <div>
          <h2 className="font-display m-0 mb-3.5 text-[19px] text-ink">Bahan-Bahan</h2>
          <div className="flex flex-col gap-2.5">
            {recipe.ingredients.map((ing) => (
              <div
                key={ing.id}
                className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm"
                style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
              >
                <span className="h-[7px] w-[7px] flex-none rounded-full" style={{ background: "#FF5A36" }} />
                {ing.name}
                {ing.secukupnya
                  ? " — secukupnya"
                  : ing.qty !== null
                  ? ` — ${ing.qty} ${ing.unit ?? ""}`
                  : ""}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-display m-0 mb-3.5 text-[19px] text-ink">Langkah-Langkah</h2>
          <div className="flex flex-col gap-3.5">
            {recipe.steps.map((step) => (
              <div key={step.id} className="flex gap-3.5">
                <span
                  className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-[13px] font-bold text-white"
                  style={{ background: "#FF5A36" }}
                >
                  {step.n}
                </span>
                <p className="m-0 mt-0.5 text-sm leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {recipe.notes && (
        <div className="mb-8 rounded-2xl border-2 px-5.5 py-4.5" style={{ background: "#FFF3D1", borderColor: "#FFC93C" }}>
          <p className="m-0 mb-1 text-[13px] font-bold" style={{ color: "#A6740A" }}>
            Tips dari {authorName(useAppStore.getState(), recipe.userId)}
          </p>
          <p className="m-0 text-sm leading-relaxed text-ink">{recipe.notes}</p>
        </div>
      )}

      <div>
        <h2 className="font-display m-0 mb-4 text-[19px] text-ink">Komentar</h2>
        <div className="mb-4.5 flex flex-col gap-3.5">
          {comments.length === 0 && <EmptyState text="Belum ada komentar. Jadilah yang pertama!" />}
          {comments.map((c) => {
            const author = authorName(useAppStore.getState(), c.userId);
            const verified = isVerifiedCommenter(useAppStore.getState(), c.userId, recipe.id);
            return (
              <div key={c.id} className="flex gap-3">
                <span
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#FF5A36,#FFC93C)" }}
                >
                  {initials(author)}
                </span>
                <div className="flex-1">
                  <p className="m-0 flex items-center gap-1.5 text-[13px] font-semibold">
                    {author}
                    <span className="text-[11px] font-normal text-muted2">{timeAgo(c.createdAt)}</span>
                    {verified && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ background: "#E1F5E4", color: "#1F8A3B" }}
                      >
                        Sudah dicoba
                      </span>
                    )}
                  </p>
                  <p className="m-0 mt-0.5 text-sm leading-snug text-ink">{c.text}</p>
                  <ReportControl
                    reported={commentReports.some(
                      (cr) => cr.commentId === c.id && cr.status === "pending"
                    )}
                    onSubmit={(reason) => requireLogin(() => reportComment(c.id, reason))}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2.5">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Tulis komentar..."
            className="min-h-[44px] max-h-[120px] flex-1 resize-y rounded-xl2 border-2 px-3.5 py-2.5 text-sm"
            style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
          />
          <button
            type="button"
            disabled={!canInteract || !newComment.trim()}
            title="Verifikasi email untuk berkomentar"
            onClick={() => {
              addComment(recipe.id, newComment);
              setNewComment("");
            }}
            className="rounded-xl2 border-none px-5.5 text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: "#FF5A36" }}
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  bg,
  fg,
  label,
  value,
}: {
  icon: "clock" | "users" | "star" | "cost";
  bg: string;
  fg: string;
  label: string;
  value: string;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4.5 py-3.5"
      style={{ background: "var(--card)" }}
    >
      <div
        className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-xl2"
        style={{ background: bg }}
      >
        <StatIcon icon={icon} fg={fg} />
      </div>
      <div>
        <span className="block text-[11px] text-muted2">{label}</span>
        <span className="text-[15px] font-bold">{value}</span>
      </div>
    </div>
  );
}

function StatIcon({ icon, fg }: { icon: string; fg: string }) {
  const common = { fill: "none", stroke: fg, strokeWidth: 2, width: 20, height: 20 };
  if (icon === "clock")
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 16 14" />
      </svg>
    );
  if (icon === "users")
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <circle cx="9" cy="8" r="4" />
        <path d="M2 21c0-4 3-6 7-6s7 2 7 6" />
        <circle cx="17" cy="8" r="3" />
        <path d="M22 21c0-3-2-5-4.5-5.7" />
      </svg>
    );
  if (icon === "cost")
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" fill="#FFC93C" stroke="#A6740A" strokeWidth={1}>
      <polygon points="12 2 14.9 8.6 22 9.3 16.5 14 18.2 21 12 17.3 5.8 21 7.5 14 2 9.3 9.1 8.6" />
    </svg>
  );
}
