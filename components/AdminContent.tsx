"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { BannerItem, PopularSearch, CategoryItem } from "@/lib/types";
import ImageUpload from "@/components/ImageUpload";

/* ---------------- Statistik ---------------- */

function periodStarts() {
  const dayMs = 86400000;
  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return {
    today: todayStart.getTime(),
    week: now - 7 * dayMs,
    month: now - 30 * dayMs,
  };
}

function countSince<T extends { createdAt: number }>(arr: T[], since: number) {
  return arr.filter((x) => x.createdAt >= since).length;
}

export function StatsDashboard() {
  const recipes = useAppStore((s) => s.recipes);
  const profiles = useAppStore((s) => s.profiles);
  const comments = useAppStore((s) => s.comments);
  const banners = useAppStore((s) => s.banners);
  const visitStats = useAppStore((s) => s.visitStats);

  const p = periodStarts();

  const tiles = [
    { label: "Total Resep", value: recipes.length, bg: "#FFE1D6", fg: "#D94A24" },
    { label: "Total Pengguna", value: profiles.length, bg: "#DDF3F6", fg: "#1D7A8C" },
    { label: "Total Komentar", value: comments.length, bg: "#EEEDFE", fg: "#3C3489" },
    { label: "Banner Aktif", value: banners.filter((b) => b.isActive).length, bg: "#E1F5E4", fg: "#1F8A3B" },
  ];

  const fmt = (n: number | null | undefined) => (n === null || n === undefined ? "—" : String(n));

  const rows: { label: string; today: string; week: string; month: string; total: string }[] = [
    {
      label: "Pengunjung",
      today: fmt(visitStats?.today),
      week: fmt(visitStats?.week),
      month: fmt(visitStats?.month),
      total: fmt(visitStats?.total),
    },
    {
      label: "Resep baru",
      today: fmt(countSince(recipes, p.today)),
      week: fmt(countSince(recipes, p.week)),
      month: fmt(countSince(recipes, p.month)),
      total: fmt(recipes.length),
    },
    {
      label: "Akun baru",
      today: fmt(countSince(profiles, p.today)),
      week: fmt(countSince(profiles, p.week)),
      month: fmt(countSince(profiles, p.month)),
      total: fmt(profiles.length),
    },
    {
      label: "Komentar baru",
      today: fmt(countSince(comments, p.today)),
      week: fmt(countSince(comments, p.week)),
      month: fmt(countSince(comments, p.month)),
      total: fmt(comments.length),
    },
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

      <div className="overflow-x-auto rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr style={{ color: "var(--muted2)" }}>
              <th className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wide">Metrik</th>
              <th className="px-3 py-3 text-right text-[12px] font-bold uppercase tracking-wide">Hari ini</th>
              <th className="px-3 py-3 text-right text-[12px] font-bold uppercase tracking-wide">7 Hari</th>
              <th className="px-3 py-3 text-right text-[12px] font-bold uppercase tracking-wide">30 Hari</th>
              <th className="px-4 py-3 text-right text-[12px] font-bold uppercase tracking-wide">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.label} style={{ borderTop: "1px solid var(--card-border)" }}>
                <td className="px-4 py-3 font-semibold text-ink">{r.label}</td>
                <td className="px-3 py-3 text-right font-bold text-ink">{r.today}</td>
                <td className="px-3 py-3 text-right text-ink">{r.week}</td>
                <td className="px-3 py-3 text-right text-ink">{r.month}</td>
                <td className="px-4 py-3 text-right font-bold" style={{ color: "#D94A24" }}>{r.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!visitStats && (
        <p className="m-0 text-xs text-muted2">
          Data pengunjung akan terisi setelah upgrade4.sql dijalankan dan mulai ada kunjungan baru.
        </p>
      )}
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
