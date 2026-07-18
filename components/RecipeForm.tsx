"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, DIFFICULTIES, UNIT_GROUPS } from "@/lib/constants";
import { Category, Difficulty, Recipe, RecipeInput } from "@/lib/types";
import ChipGroup from "@/components/ChipGroup";
import { fileToCompressedDataUrl } from "@/lib/utils";

const CUSTOM_UNIT = "__custom__";
const CUSTOM_CATEGORY = "__custom_cat__";
const KNOWN_UNITS = UNIT_GROUPS.flatMap((g) => g.units);
const KNOWN_CATEGORIES = CATEGORIES.map((c) => c.value);

interface IngredientRow {
  key: string;
  name: string;
  qty: string;
  unit: string;
  customUnit: string;
  secukupnya: boolean;
}

interface StepRow {
  key: string;
  text: string;
  photos: string[];
}

interface FormErrors {
  title?: string;
  category?: string;
  cookTime?: string;
  servings?: string;
  ingredients?: string;
  steps?: string;
}

function rowKey() {
  return Math.random().toString(36).slice(2, 9);
}

function toIngredientRows(recipe?: Recipe): IngredientRow[] {
  if (!recipe || recipe.ingredients.length === 0) {
    return [{ key: rowKey(), name: "", qty: "", unit: "gram", customUnit: "", secukupnya: false }];
  }
  return recipe.ingredients.map((ing) => {
    const isCustom = !!ing.unit && !KNOWN_UNITS.includes(ing.unit);
    return {
      key: rowKey(),
      name: ing.name,
      qty: ing.qty !== null ? String(ing.qty) : "",
      unit: isCustom ? CUSTOM_UNIT : ing.unit ?? "gram",
      customUnit: isCustom ? ing.unit ?? "" : "",
      secukupnya: ing.secukupnya,
    };
  });
}

function toStepRows(recipe?: Recipe): StepRow[] {
  if (!recipe || recipe.steps.length === 0) {
    return [{ key: rowKey(), text: "", photos: [] }];
  }
  return recipe.steps.map((s) => ({ key: rowKey(), text: s.text, photos: s.photos ?? [] }));
}

function toPhotos(recipe?: Recipe): string[] {
  if (!recipe) return [];
  if (recipe.images.length > 0) return recipe.images;
  return recipe.imageUrl ? [recipe.imageUrl] : [];
}

export default function RecipeForm({
  headerLabel,
  initial,
  onSubmit,
}: {
  headerLabel: string;
  initial?: Recipe;
  onSubmit: (input: RecipeInput) => Promise<void> | void;
}) {
  const router = useRouter();

  const initialIsCustomCat = !!initial && !KNOWN_CATEGORIES.includes(initial.category);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [photos, setPhotos] = useState<string[]>(toPhotos(initial));
  const [categoryChoice, setCategoryChoice] = useState<string>(
    initialIsCustomCat ? CUSTOM_CATEGORY : initial?.category ?? "Makanan"
  );
  const [customCategory, setCustomCategory] = useState<string>(
    initialIsCustomCat ? initial!.category : ""
  );
  const [cookTime, setCookTime] = useState(initial ? String(initial.cookTimeMinutes) : "");
  const [servings, setServings] = useState(initial ? String(initial.servings) : "");
  const [difficulty, setDifficulty] = useState<Difficulty>(initial?.difficulty ?? "Mudah");
  const [estimatedCost, setEstimatedCost] = useState(
    initial?.estimatedCost !== null && initial?.estimatedCost !== undefined
      ? String(initial.estimatedCost)
      : ""
  );
  const [ingredients, setIngredients] = useState<IngredientRow[]>(toIngredientRows(initial));
  const [steps, setSteps] = useState<StepRow[]>(toStepRows(initial));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [photoBusy, setPhotoBusy] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

  function updateIngredient(key: string, patch: Partial<IngredientRow>) {
    setIngredients((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }
  function updateStep(key: string, text: string) {
    setSteps((rows) => rows.map((r) => (r.key === key ? { ...r, text } : r)));
  }

  async function handleAddPhotos(files: FileList | null) {
    if (!files || files.length === 0) return;
    setPhotoBusy(true);
    try {
      for (const file of Array.from(files)) {
        const dataUrl = await fileToCompressedDataUrl(file);
        setPhotos((p) => [...p, dataUrl]);
      }
    } finally {
      setPhotoBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleAddStepPhotos(key: string, files: FileList | null) {
    if (!files || files.length === 0) return;
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      urls.push(await fileToCompressedDataUrl(file));
    }
    setSteps((rows) =>
      rows.map((r) => (r.key === key ? { ...r, photos: [...r.photos, ...urls] } : r))
    );
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!title.trim()) e.title = "Judul resep wajib diisi";
    if (categoryChoice === CUSTOM_CATEGORY && !customCategory.trim())
      e.category = "Isi nama kategori";
    if (!cookTime.trim() || parseInt(cookTime, 10) <= 0)
      e.cookTime = "Waktu masak wajib diisi";
    if (!servings.trim() || parseInt(servings, 10) <= 0) e.servings = "Jumlah orang wajib diisi";
    if (!ingredients.some((r) => r.name.trim()))
      e.ingredients = "Isi minimal satu bahan";
    if (!steps.some((r) => r.text.trim())) e.steps = "Isi minimal satu langkah";
    return e;
  }

  async function handleSave() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      formTopRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const finalCategory =
      categoryChoice === CUSTOM_CATEGORY ? customCategory.trim() : categoryChoice;
    const input: RecipeInput = {
      title: title.trim(),
      category: finalCategory,
      imageDataUrls: photos,
      cookTimeMinutes: parseInt(cookTime, 10) || 0,
      servings: parseInt(servings, 10) || 1,
      difficulty,
      estimatedCost: estimatedCost.trim() ? parseInt(estimatedCost, 10) : null,
      notes: notes.trim(),
      ingredients: ingredients
        .filter((r) => r.name.trim())
        .map((r) => ({
          name: r.name.trim(),
          qty: r.secukupnya ? null : r.qty.trim() ? parseFloat(r.qty) : null,
          unit: r.secukupnya
            ? null
            : r.unit === CUSTOM_UNIT
            ? r.customUnit.trim() || null
            : r.unit,
          secukupnya: r.secukupnya,
        })),
      steps: steps
        .filter((r) => r.text.trim())
        .map((r) => ({ text: r.text.trim(), photos: r.photos })),
      isPublic,
    };
    setSaving(true);
    try {
      await onSubmit(input);
    } finally {
      setSaving(false);
    }
  }

  const errBorder = { borderColor: "#C23A3A" };
  const okBorder = { borderColor: "var(--input-border)" };

  return (
    <div className="mx-auto max-w-[820px] px-4 pb-16 pt-7 sm:px-8" ref={formTopRef}>
      <h1 className="font-display m-0 mb-2 text-[28px] font-semibold text-ink">{headerLabel}</h1>
      {Object.keys(errors).length > 0 && (
        <p className="m-0 mb-5 rounded-lg px-3.5 py-2.5 text-sm font-semibold" style={{ background: "#FADADA", color: "#791F1F" }}>
          Ada bagian yang belum lengkap — periksa tanda merah di bawah.
        </p>
      )}

      <Field label={`Foto resep (${photos.length}) — foto pertama jadi sampul`}>
        <div className="flex flex-wrap gap-3">
          {photos.map((src, i) => (
            <div key={i} className="relative h-[110px] w-[150px] overflow-hidden rounded-xl2 border" style={{ borderColor: "var(--card-border)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: "#FF5A36" }}>
                  Sampul
                </span>
              )}
              <button
                type="button"
                onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                aria-label="Hapus foto"
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-none text-white"
                style={{ background: "rgba(0,0,0,.55)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 11, height: 11 }}>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={photoBusy}
            className="flex h-[110px] w-[150px] flex-col items-center justify-center gap-1.5 rounded-xl2 border-2 border-dashed text-muted disabled:opacity-50"
            style={{ borderColor: "var(--input-border)", background: "var(--card)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 20, height: 20 }}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="text-xs font-semibold">{photoBusy ? "Memproses..." : "Tambah foto"}</span>
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleAddPhotos(e.target.files)}
        />
      </Field>

      <Field label="Judul resep" error={errors.title}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="mis. Nasi Goreng Kampung"
          className="w-full rounded-xl2 border-2 px-3.5 py-2.5 text-[15px]"
          style={{ ...(errors.title ? errBorder : okBorder), background: "var(--card)", color: "var(--ink)" }}
        />
      </Field>

      <Field label="Kategori" error={errors.category}>
        <ChipGroup
          options={[
            ...CATEGORIES.map((c) => ({ value: c.value, label: c.value, dot: c.dot })),
            { value: CUSTOM_CATEGORY, label: "Lainnya..." },
          ]}
          selected={categoryChoice}
          onSelect={(v) => setCategoryChoice(v)}
        />
        {categoryChoice === CUSTOM_CATEGORY && (
          <input
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="Ketik nama kategori sendiri (mis. Jajanan Pasar)"
            className="mt-2.5 w-full max-w-[360px] rounded-xl2 border-2 px-3.5 py-2.5 text-sm"
            style={{ ...(errors.category ? errBorder : okBorder), background: "var(--card)", color: "var(--ink)" }}
          />
        )}
      </Field>

      <div className="mb-5 grid grid-cols-3 gap-3.5">
        <Field label="Waktu masak (menit)" error={errors.cookTime} compact>
          <input
            type="number"
            min={0}
            value={cookTime}
            onChange={(e) => setCookTime(e.target.value)}
            className="w-full rounded-xl2 border-2 px-3.5 py-2.5 text-[15px]"
            style={{ ...(errors.cookTime ? errBorder : okBorder), background: "var(--card)", color: "var(--ink)" }}
          />
        </Field>
        <Field label="1 porsi untuk berapa orang" error={errors.servings} compact>
          <input
            type="number"
            min={1}
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            placeholder="mis. 6"
            className="w-full rounded-xl2 border-2 px-3.5 py-2.5 text-[15px]"
            style={{ ...(errors.servings ? errBorder : okBorder), background: "var(--card)", color: "var(--ink)" }}
          />
        </Field>
        <Field label="Estimasi biaya (Rp, opsional)" compact>
          <input
            type="number"
            min={0}
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
            className="w-full rounded-xl2 border-2 px-3.5 py-2.5 text-[15px]"
            style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
          />
        </Field>
      </div>

      <Field label="Tingkat kesulitan">
        <ChipGroup
          options={DIFFICULTIES.map((d) => ({ value: d, label: d }))}
          selected={difficulty}
          onSelect={(v) => setDifficulty(v as Difficulty)}
        />
      </Field>

      <Field label="Bahan-bahan" error={errors.ingredients}>
        <div className="flex flex-col gap-2.5">
          {ingredients.map((row) => (
            <div key={row.key} className="flex flex-wrap items-center gap-2">
              <input
                value={row.name}
                onChange={(e) => updateIngredient(row.key, { name: e.target.value })}
                placeholder="Nama bahan"
                className="min-w-[160px] flex-1 rounded-lg border-2 px-3 py-2 text-sm"
                style={{ ...(errors.ingredients ? errBorder : okBorder), background: "var(--card)", color: "var(--ink)" }}
              />
              <input
                type="number"
                disabled={row.secukupnya}
                value={row.qty}
                onChange={(e) => updateIngredient(row.key, { qty: e.target.value })}
                placeholder="Jumlah"
                className="w-[90px] rounded-lg border-2 px-3 py-2 text-sm disabled:opacity-40"
                style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
              />
              <select
                disabled={row.secukupnya}
                value={row.unit}
                onChange={(e) => updateIngredient(row.key, { unit: e.target.value })}
                className="w-[120px] rounded-lg border-2 px-2 py-2 text-sm disabled:opacity-40"
                style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
              >
                {UNIT_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.units.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <option value={CUSTOM_UNIT}>Lainnya...</option>
              </select>
              {row.unit === CUSTOM_UNIT && !row.secukupnya && (
                <input
                  value={row.customUnit}
                  onChange={(e) => updateIngredient(row.key, { customUnit: e.target.value })}
                  placeholder="Satuan custom"
                  className="w-[110px] rounded-lg border-2 px-3 py-2 text-sm"
                  style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
                />
              )}
              <button
                type="button"
                onClick={() => updateIngredient(row.key, { secukupnya: !row.secukupnya })}
                className="rounded-full px-3 py-1.5 text-xs font-semibold"
                style={
                  row.secukupnya
                    ? { background: "#FFE1D6", color: "#D94A24" }
                    : { background: "var(--nav-wrap)", color: "var(--muted)" }
                }
              >
                Secukupnya
              </button>
              <button
                type="button"
                disabled={ingredients.length <= 1}
                onClick={() => setIngredients((rows) => rows.filter((r) => r.key !== row.key))}
                aria-label="Hapus bahan"
                className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border disabled:opacity-30"
                style={{ borderColor: "var(--input-border)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#C23A3A" strokeWidth={2} style={{ width: 14, height: 14 }}>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setIngredients((rows) => [
                ...rows,
                { key: rowKey(), name: "", qty: "", unit: "gram", customUnit: "", secukupnya: false },
              ])
            }
            className="w-fit rounded-lg border-2 border-dashed px-3.5 py-2 text-sm font-semibold text-muted"
            style={{ borderColor: "var(--input-border)" }}
          >
            + Tambah bahan
          </button>
        </div>
      </Field>

      <Field label="Langkah-langkah — bisa tambah foto tiap langkah (opsional)" error={errors.steps}>
        <div className="flex flex-col gap-3.5">
          {steps.map((row, idx) => (
            <div key={row.key} className="flex items-start gap-2.5">
              <span
                className="mt-2 flex h-7 w-7 flex-none items-center justify-center rounded-full text-[13px] font-bold text-white"
                style={{ background: "#FF5A36" }}
              >
                {idx + 1}
              </span>
              <div className="flex-1">
                <textarea
                  value={row.text}
                  onChange={(e) => updateStep(row.key, e.target.value)}
                  placeholder="Tuliskan langkah memasak..."
                  className="min-h-[44px] w-full resize-y rounded-lg border-2 px-3 py-2 text-sm"
                  style={{ ...(errors.steps ? errBorder : okBorder), background: "var(--card)", color: "var(--ink)" }}
                />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {row.photos.map((src, pi) => (
                    <div key={pi} className="relative h-[54px] w-[72px] overflow-hidden rounded-lg border" style={{ borderColor: "var(--card-border)" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Foto langkah ${idx + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setSteps((rows) =>
                            rows.map((r) =>
                              r.key === row.key
                                ? { ...r, photos: r.photos.filter((_, i) => i !== pi) }
                                : r
                            )
                          )
                        }
                        aria-label="Hapus foto langkah"
                        className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-none text-white"
                        style={{ background: "rgba(0,0,0,.55)" }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 10, height: 10 }}>
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <label
                    className="flex h-[54px] w-[72px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-dashed text-muted2"
                    style={{ borderColor: "var(--input-border)" }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 15, height: 15 }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    <span className="text-[9px] font-semibold">Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleAddStepPhotos(row.key, e.target.files)}
                    />
                  </label>
                </div>
              </div>
              <button
                type="button"
                disabled={steps.length <= 1}
                onClick={() => setSteps((rows) => rows.filter((r) => r.key !== row.key))}
                aria-label="Hapus langkah"
                className="mt-1 flex h-8 w-8 flex-none items-center justify-center rounded-lg border disabled:opacity-30"
                style={{ borderColor: "var(--input-border)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#C23A3A" strokeWidth={2} style={{ width: 14, height: 14 }}>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setSteps((rows) => [...rows, { key: rowKey(), text: "", photos: [] }])}
            className="w-fit rounded-lg border-2 border-dashed px-3.5 py-2 text-sm font-semibold text-muted"
            style={{ borderColor: "var(--input-border)" }}
          >
            + Tambah langkah
          </button>
        </div>
      </Field>

      <Field label="Catatan / tips (opsional)">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="mis. bisa diganti santan kalau tidak ada susu"
          className="min-h-[80px] w-full resize-y rounded-xl2 border-2 px-3.5 py-2.5 text-sm"
          style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
        />
      </Field>

      <div className="mb-8 flex items-center gap-3">
        <span className="text-sm font-semibold text-ink">Privasi resep:</span>
        <button
          type="button"
          onClick={() => setIsPublic((v) => !v)}
          className="rounded-full px-3.5 py-1.5 text-xs font-semibold"
          style={
            isPublic
              ? { background: "#E1F5E4", color: "#1F8A3B" }
              : { background: "var(--nav-wrap)", color: "var(--muted)" }
          }
        >
          {isPublic ? "Publik" : "Privat"}
        </button>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-2xl border-2 px-5.5 py-3 text-sm font-semibold"
          style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
        >
          Batal
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="rounded-2xl border-none px-6.5 py-3 text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: "#FF5A36" }}
        >
          {saving ? "Menyimpan..." : "Simpan Resep"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  compact,
  children,
}: {
  label: string;
  error?: string;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={compact ? "" : "mb-5"}>
      <label
        className="mb-2 block text-[13px] font-semibold"
        style={{ color: error ? "#C23A3A" : "var(--muted)" }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="m-0 mt-1.5 text-xs font-semibold" style={{ color: "#C23A3A" }}>
          {error}
        </p>
      )}
    </div>
  );
}
