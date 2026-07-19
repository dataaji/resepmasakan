"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BannerItem, PopularSearch, CategoryItem } from "@/lib/types";
import ImageUpload from "@/components/ImageUpload";

/* ---------------- Statistik ---------------- */

const CHART_DAYS = 14;
const ACCENT = "#FF5A36";

function dailyBuckets(times: number[], days: number) {
  const dayMs = 86400000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = today.getTime() - (days - 1) * dayMs;
  const buckets = Array.from({ length: days }, (_, i) => ({ start: start + i * dayMs, count: 0 }));
  for (const t of times) {
    if (t < start) continue;
    const idx = Math.floor((t - start) / dayMs);
    if (idx >= 0 && idx < days) buckets[idx].count++;
  }
  return buckets;
}

function countSince(times: number[], since: number) {
  return times.filter((t) => t >= since).length;
}

function BarChart({ times, empty }: { times: number[]; empty?: boolean }) {
  const buckets = dailyBuckets(times, CHART_DAYS);
  const max = Math.max(1, ...buckets.map((b) => b.count));
  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold text-muted2">maks {max}/hari</div>
      <div className="flex h-[150px] items-end gap-[3px]">
        {buckets.map((b, i) => {
          const d = new Date(b.start);
          const pct = empty ? 0 : (b.count / max) * 100;
          return (
            <div key={i} className="group relative flex flex-1 flex-col justify-end" style={{ height: "100%" }}>
              <div
                className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-semibold text-white group-hover:block"
                style={{ background: "var(--ink)" }}
              >
                {b.count} · {d.getDate()}/{d.getMonth() + 1}
              </div>
              <div
                className="w-full rounded-t-[4px] transition-opacity group-hover:opacity-80"
                style={{
                  height: `${Math.max(pct, b.count > 0 ? 4 : 1.5)}%`,
                  background: b.count > 0 ? ACCENT : "var(--card-border)",
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-[3px]">
        {buckets.map((b, i) => (
          <span key={i} className="flex-1 text-center text-[9px] text-muted2">
            {new Date(b.start).getDate()}
          </span>
        ))}
      </div>
    </div>
  );
}

export function StatsDashboard() {
  const recipes = useAppStore((s) => s.recipes);
  const profiles = useAppStore((s) => s.profiles);
  const comments = useAppStore((s) => s.comments);
  const banners = useAppStore((s) => s.banners);
  const visitStats = useAppStore((s) => s.visitStats);

  const [active, setActive] = useState(0);

  const tiles = [
    { label: "Total Resep", value: recipes.length, bg: "#FFE1D6", fg: "#D94A24" },
    { label: "Total Pengguna", value: profiles.length, bg: "#DDF3F6", fg: "#1D7A8C" },
    { label: "Total Komentar", value: comments.length, bg: "#EEEDFE", fg: "#3C3489" },
    { label: "Banner Aktif", value: banners.filter((b) => b.isActive).length, bg: "#E1F5E4", fg: "#1F8A3B" },
  ];

  const metrics = useMemo(
    () => [
      { label: "Pengunjung", times: visitStats?.times ?? [], total: visitStats?.total ?? null, available: !!visitStats },
      { label: "Resep baru", times: recipes.map((r) => r.createdAt), total: recipes.length, available: true },
      { label: "Akun baru", times: profiles.map((pf) => pf.createdAt), total: profiles.length, available: true },
      { label: "Komentar baru", times: comments.map((c) => c.createdAt), total: comments.length, available: true },
    ],
    [visitStats, recipes, profiles, comments]
  );

  const m = metrics[active];
  const dayMs = 86400000;
  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const summary: { label: string; value: number | null }[] = [
    { label: "Hari ini", value: countSince(m.times, todayStart.getTime()) },
    { label: "7 Hari", value: countSince(m.times, now - 7 * dayMs) },
    { label: "30 Hari", value: countSince(m.times, now - 30 * dayMs) },
    { label: "Total", value: m.total },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
            <div className="mb-1.5 inline-flex rounded-lg px-2 py-0.5 text-[11px] font-bold" style={{ background: t.bg, color: t.fg }}>
              {t.label}
            </div>
            <p className="m-0 text-[26px] font-bold text-ink">{t.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border p-4 sm:p-5" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
        <div className="mb-4 flex flex-wrap gap-2">
          {metrics.map((mt, i) => (
            <button
              key={mt.label}
              type="button"
              onClick={() => setActive(i)}
              className="rounded-full px-3.5 py-1.5 text-[13px] font-semibold"
              style={
                i === active
                  ? { background: ACCENT, color: "#fff" }
                  : { background: "var(--nav-wrap)", color: "var(--muted)" }
              }
            >
              {mt.label}
            </button>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1">
          {summary.map((s) => (
            <span key={s.label} className="text-[13px] text-muted">
              {s.label}: <b className="text-ink">{s.value === null ? "—" : s.value}</b>
            </span>
          ))}
        </div>

        <p className="m-0 mb-2 text-[13px] font-semibold text-ink">{m.label} — 14 hari terakhir</p>
        <BarChart times={m.times} empty={!m.available} />

        {!m.available && (
          <p className="m-0 mt-3 text-xs text-muted2">
            Data pengunjung akan terisi setelah upgrade4.sql dijalankan dan mulai ada kunjungan baru.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------- helper UI ---------------- */

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold text-muted2">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "w-full rounded-lg border-2 px-3 py-2 text-sm";
const inputStyle = {
  borderColor: "var(--input-border)",
  background: "var(--card)",
  color: "var(--ink)",
} as const;

function SaveBtn({ onClick, busy }: { onClick: () => void; busy: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="rounded-lg border-none px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
      style={{ background: "#FF5A36" }}
    >
      {busy ? "Menyimpan..." : "Simpan"}
    </button>
  );
}

function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border-none px-4 py-2 text-xs font-semibold"
      style={{ background: "#FADADA", color: "#791F1F" }}
    >
      Hapus
    </button>
  );
}

/* ---------------- Banner ---------------- */

function BannerEditor({ banner, onSaved }: { banner?: BannerItem; onSaved?: () => void }) {
  const saveBanner = useAppStore((s) => s.saveBanner);
  const deleteBanner = useAppStore((s) => s.deleteBanner);
  const askConfirm = useAppStore((s) => s.askConfirm);

  const [label, setLabel] = useState(banner?.label ?? "");
  const [title, setTitle] = useState(banner?.title ?? "");
  const [subtitle, setSubtitle] = useState(banner?.subtitle ?? "");
  const [ctaLabel, setCtaLabel] = useState(banner?.ctaLabel ?? "Lihat Resep");
  const [gradient, setGradient] = useState(banner?.gradient ?? "linear-gradient(120deg,#D94A24,#FF5A36)");
  const [href, setHref] = useState(banner?.href ?? "/");
  const [sortOrder, setSortOrder] = useState(String(banner?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(banner?.isActive ?? true);
  const [image, setImage] = useState<string | null>(banner?.imageUrl ?? null);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!title.trim()) return;
    setBusy(true);
    await saveBanner({
      id: banner?.id,
      label, title, subtitle, ctaLabel, gradient, href,
      sortOrder: parseInt(sortOrder, 10) || 0,
      isActive, image,
    });
    setBusy(false);
    onSaved?.();
  }

  return (
    <div className="rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
      <div className="grid gap-3 md:grid-cols-[200px_1fr]">
        <div>
          <ImageUpload value={image} gradientIndex={0} onChange={setImage} aspect="aspect-[20/9]" label="Foto banner" />
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <Labeled label="Judul"><input className={inputCls} style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} /></Labeled>
          <Labeled label="Label kecil"><input className={inputCls} style={inputStyle} value={label} onChange={(e) => setLabel(e.target.value)} /></Labeled>
          <Labeled label="Subjudul"><input className={inputCls} style={inputStyle} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} /></Labeled>
          <Labeled label="Teks tombol"><input className={inputCls} style={inputStyle} value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} /></Labeled>
          <Labeled label="Tautan (mis. /resep?id=... atau /?time=15)"><input className={inputCls} style={inputStyle} value={href} onChange={(e) => setHref(e.target.value)} /></Labeled>
          <Labeled label="Warna gradasi (CSS)"><input className={inputCls} style={inputStyle} value={gradient} onChange={(e) => setGradient(e.target.value)} /></Labeled>
          <Labeled label="Urutan"><input type="number" className={inputCls} style={inputStyle} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} /></Labeled>
          <label className="flex items-center gap-2 self-end pb-2 text-sm font-semibold text-ink">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Tampilkan
          </label>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <SaveBtn onClick={save} busy={busy} />
        {banner && !banner.id.startsWith("default-") && (
          <DeleteBtn
            onClick={() =>
              askConfirm({
                title: "Hapus banner?",
                message: `Banner "${banner.title}" akan dihapus.`,
                onConfirm: () => deleteBanner(banner.id),
              })
            }
          />
        )}
      </div>
    </div>
  );
}

export function BannerManager() {
  const banners = useAppStore((s) => s.banners);
  const sorted = useMemo(() => [...banners].sort((a, b) => a.sortOrder - b.sortOrder), [banners]);
  const [newKeys, setNewKeys] = useState<number[]>([]);

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((b) => (
        <BannerEditor key={b.id} banner={b} />
      ))}
      {newKeys.map((k) => (
        <BannerEditor key={`new-${k}`} onSaved={() => setNewKeys((ks) => ks.filter((x) => x !== k))} />
      ))}
      <button
        type="button"
        onClick={() => setNewKeys((ks) => [...ks, Date.now()])}
        className="self-start rounded-lg border-2 border-dashed px-4 py-2 text-sm font-semibold text-muted"
        style={{ borderColor: "var(--input-border)" }}
      >
        + Tambah Banner
      </button>
    </div>
  );
}

/* ---------------- Pencarian Populer ---------------- */

function PopularEditor({ item, onSaved }: { item?: PopularSearch; onSaved?: () => void }) {
  const savePopularSearch = useAppStore((s) => s.savePopularSearch);
  const deletePopularSearch = useAppStore((s) => s.deletePopularSearch);
  const askConfirm = useAppStore((s) => s.askConfirm);

  const [label, setLabel] = useState(item?.label ?? "");
  const [sortOrder, setSortOrder] = useState(String(item?.sortOrder ?? 0));
  const [image, setImage] = useState<string | null>(item?.imageUrl ?? null);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!label.trim()) return;
    setBusy(true);
    await savePopularSearch({ id: item?.id, label, sortOrder: parseInt(sortOrder, 10) || 0, image });
    setBusy(false);
    onSaved?.();
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border p-3.5" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
      <div className="w-[110px]">
        <ImageUpload value={image} gradientIndex={2} onChange={setImage} aspect="aspect-[16/10]" label="Foto" />
      </div>
      <div className="min-w-[160px] flex-1">
        <Labeled label="Kata kunci"><input className={inputCls} style={inputStyle} value={label} onChange={(e) => setLabel(e.target.value)} /></Labeled>
      </div>
      <div className="w-[90px]">
        <Labeled label="Urutan"><input type="number" className={inputCls} style={inputStyle} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} /></Labeled>
      </div>
      <div className="flex gap-2">
        <SaveBtn onClick={save} busy={busy} />
        {item && !item.id.startsWith("default-") && (
          <DeleteBtn
            onClick={() =>
              askConfirm({
                title: "Hapus item?",
                message: `"${item.label}" akan dihapus dari pencarian populer.`,
                onConfirm: () => deletePopularSearch(item.id),
              })
            }
          />
        )}
      </div>
    </div>
  );
}

export function PopularManager() {
  const items = useAppStore((s) => s.popularSearches);
  const sorted = useMemo(() => [...items].sort((a, b) => a.sortOrder - b.sortOrder), [items]);
  const [newKeys, setNewKeys] = useState<number[]>([]);

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((it) => (
        <PopularEditor key={it.id} item={it} />
      ))}
      {newKeys.map((k) => (
        <PopularEditor key={`new-${k}`} onSaved={() => setNewKeys((ks) => ks.filter((x) => x !== k))} />
      ))}
      <button
        type="button"
        onClick={() => setNewKeys((ks) => [...ks, Date.now()])}
        className="self-start rounded-lg border-2 border-dashed px-4 py-2 text-sm font-semibold text-muted"
        style={{ borderColor: "var(--input-border)" }}
      >
        + Tambah Kata Kunci
      </button>
    </div>
  );
}

/* ---------------- Kategori ---------------- */

function CategoryEditor({ item, onSaved }: { item?: CategoryItem; onSaved?: () => void }) {
  const saveCategory = useAppStore((s) => s.saveCategory);
  const deleteCategory = useAppStore((s) => s.deleteCategory);
  const askConfirm = useAppStore((s) => s.askConfirm);

  const [name, setName] = useState(item?.name ?? "");
  const [dot, setDot] = useState(item?.dot ?? "#FF5A36");
  const [sortOrder, setSortOrder] = useState(String(item?.sortOrder ?? 0));
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!name.trim()) return;
    setBusy(true);
    await saveCategory({ id: item?.id, name, dot, sortOrder: parseInt(sortOrder, 10) || 0 });
    setBusy(false);
    onSaved?.();
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border p-3.5" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
      <div className="min-w-[150px] flex-1">
        <Labeled label="Nama kategori"><input className={inputCls} style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} /></Labeled>
      </div>
      <div className="w-[90px]">
        <Labeled label="Warna">
          <input type="color" value={dot} onChange={(e) => setDot(e.target.value)} className="h-[38px] w-full cursor-pointer rounded-lg border-2" style={{ borderColor: "var(--input-border)", background: "var(--card)" }} />
        </Labeled>
      </div>
      <div className="w-[90px]">
        <Labeled label="Urutan"><input type="number" className={inputCls} style={inputStyle} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} /></Labeled>
      </div>
      <div className="flex gap-2">
        <SaveBtn onClick={save} busy={busy} />
        {item && !item.id.startsWith("default-") && (
          <DeleteBtn
            onClick={() =>
              askConfirm({
                title: "Hapus kategori?",
                message: `Kategori "${item.name}" akan dihapus. Resep lama tetap menyimpan nama kategorinya.`,
                onConfirm: () => deleteCategory(item.id),
              })
            }
          />
        )}
      </div>
    </div>
  );
}

export function CategoryManager() {
  const items = useAppStore((s) => s.categories);
  const sorted = useMemo(() => [...items].sort((a, b) => a.sortOrder - b.sortOrder), [items]);
  const [newKeys, setNewKeys] = useState<number[]>([]);

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((it) => (
        <CategoryEditor key={it.id} item={it} />
      ))}
      {newKeys.map((k) => (
        <CategoryEditor key={`new-${k}`} onSaved={() => setNewKeys((ks) => ks.filter((x) => x !== k))} />
      ))}
      <button
        type="button"
        onClick={() => setNewKeys((ks) => [...ks, Date.now()])}
        className="self-start rounded-lg border-2 border-dashed px-4 py-2 text-sm font-semibold text-muted"
        style={{ borderColor: "var(--input-border)" }}
      >
        + Tambah Kategori
      </button>
    </div>
  );
}
