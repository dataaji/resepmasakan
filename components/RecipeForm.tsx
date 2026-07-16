"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, DIFFICULTIES, UNIT_GROUPS } from "@/lib/constants";
import { Category, Difficulty, Recipe } from "@/lib/types";
import { RecipeInput } from "@/lib/store";
import ChipGroup from "@/components/ChipGroup";
import ImageUpload from "@/components/ImageUpload";

const CUSTOM_UNIT = "__custom__";
const KNOWN_UNITS = UNIT_GROUPS.flatMap((g) => g.units);

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
    return [{ key: rowKey(), text: "" }];
  }
  return recipe.steps.map((s) => ({ key: rowKey(), text: s.text }));
}

export default function RecipeForm({
  headerLabel,
  initial,
  onSubmit,
}: {
  headerLabel: string;
  initial?: Recipe;
  onSubmit: (input: RecipeInput) => void;
}) {
  const router = useRouter();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [photo, setPhoto] = useState<string | null>(initial?.imageDataUrl ?? null);
  const [category, setCategory] = useState<Category>(initial?.category ?? "Makanan");
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

  function updateIngredient(key: string, patch: Partial<IngredientRow>) {
    setIngredients((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }
  function updateStep(key: string, text: string) {
    setSteps((rows) => rows.map((r) => (r.key === key ? { ...r, text } : r)));
  }

  function handleSave() {
    const input: RecipeInput = {
      title: title.trim(),
      category,
      imageDataUrl: photo,
      placeholderIndex: initial?.placeholderIndex ?? Math.floor(Math.random() * 6),
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
      steps: steps.filter((r) => r.text.trim()).map((r) => ({ n: 0, text: r.text.trim() })),
      isPublic,
    };
    onSubmit(input);
  }

  return (
    <div className="mx-auto max-w-[820px] px-8 pb-16 pt-7">
      <h1 className="font-display m-0 mb-6 text-[28px] font-semibold text-ink">{headerLabel}</h1>

      <Field label="Foto resep">
        <ImageUpload value={photo} gradientIndex={0} onChange={setPhoto} />
      </Field>

      <Field label="Judul resep">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="mis. Nasi Goreng Kampung"
          className="w-full rounded-xl2 border-2 px-3.5 py-2.5 text-[15px]"
          style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
        />
      </Field>

      <Field label="Kategori">
        <ChipGroup
          options={CATEGORIES.map((c) => ({ value: c.value, label: c.value, dot: c.dot }))}
          selected={category}
          onSelect={(v) => setCategory(v as Category)}
        />
      </Field>

      <div className="mb-5 grid grid-cols-3 gap-3.5">
        <Field label="Waktu masak (menit)">
          <input
            type="number"
            min={0}
            value={cookTime}
            onChange={(e) => setCookTime(e.target.value)}
            className="w-full rounded-xl2 border-2 px-3.5 py-2.5 text-[15px]"
            style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
          />
        </Field>
        <Field label="Porsi">
          <input
            type="number"
            min={1}
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            className="w-full rounded-xl2 border-2 px-3.5 py-2.5 text-[15px]"
            style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
          />
        </Field>
        <Field label="Estimasi biaya (Rp, opsional)">
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

      <Field label="Bahan-bahan">
        <div className="flex flex-col gap-2.5">
          {ingredients.map((row) => (
            <div key={row.key} className="flex flex-wrap items-center gap-2">
              <input
                value={row.name}
                onChange={(e) => updateIngredient(row.key, { name: e.target.value })}
                placeholder="Nama bahan"
                className="min-w-[160px] flex-1 rounded-lg border-2 px-3 py-2 text-sm"
                style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
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

      <Field label="Langkah-langkah">
        <div className="flex flex-col gap-2.5">
          {steps.map((row, idx) => (
            <div key={row.key} className="flex items-start gap-2.5">
              <span
                className="mt-2 flex h-7 w-7 flex-none items-center justify-center rounded-full text-[13px] font-bold text-white"
                style={{ background: "#FF5A36" }}
              >
                {idx + 1}
              </span>
              <textarea
                value={row.text}
                onChange={(e) => updateStep(row.key, e.target.value)}
                placeholder="Tuliskan langkah memasak..."
                className="min-h-[44px] flex-1 resize-y rounded-lg border-2 px-3 py-2 text-sm"
                style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
              />
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
            onClick={() => setSteps((rows) => [...rows, { key: rowKey(), text: "" }])}
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
          disabled={!title.trim()}
          onClick={handleSave}
          className="rounded-2xl border-none px-6.5 py-3 text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: "#FF5A36" }}
        >
          Simpan Resep
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <label className="mb-2 block text-[13px] font-semibold text-muted">{label}</label>
      {children}
    </div>
  );
}
