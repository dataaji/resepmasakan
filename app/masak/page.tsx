"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/lib/store";

function parseDurationSeconds(text: string): number | null {
  const match = text.match(/(\d+)\s*menit/i);
  if (!match) return null;
  return parseInt(match[1], 10) * 60;
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function CookModePage() {
  return (
    <Suspense fallback={null}>
      <CookModeContent />
    </Suspense>
  );
}

function CookModeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const recipeId = searchParams.get("id") ?? "";
  const recipe = useAppStore((s) => s.recipes.find((r) => r.id === recipeId));
  const loadRecipeDetail = useAppStore((s) => s.loadRecipeDetail);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!recipeId) return;
    loadRecipeDetail(recipeId).finally(() => setLoaded(true));
  }, [recipeId, loadRecipeDetail]);

  const [stepIndex, setStepIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);

  const duration = useMemo(() => {
    const text = recipe?.steps[stepIndex]?.text ?? "";
    return parseDurationSeconds(text);
  }, [recipe, stepIndex]);

  useEffect(() => {
    setRemaining(duration ?? 0);
    setRunning(false);
  }, [duration, stepIndex]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      setRunning(false);
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [running, remaining]);

  if (!recipe) {
    return (
      <div className="mx-auto max-w-[600px] px-8 py-16 text-center text-muted">
        {loaded ? "Resep tidak ditemukan." : "Memuat resep..."}
      </div>
    );
  }

  const steps = recipe.steps;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const step = steps[stepIndex];

  return (
    <div
      className="mx-auto flex flex-col items-center justify-center px-6 py-10 text-center"
      style={{ minHeight: "calc(100vh - 66px)", maxWidth: 800 }}
    >
      <p className="m-0 mb-2 text-[13px] font-bold uppercase tracking-wide text-muted">
        Langkah {stepIndex + 1} dari {steps.length}
      </p>
      <h1 className="font-display m-0 mb-7 text-2xl font-semibold text-muted">
        {recipe.title}
      </h1>
      <p className="m-0 mb-8 max-w-[640px] text-[34px] font-semibold leading-snug text-ink">
        {step.text}
      </p>

      {duration !== null && (
        <div
          className="mb-8 flex items-center gap-4 rounded-xl3 px-7 py-4"
          style={{ background: "var(--card)" }}
        >
          <span className="font-display text-[32px] font-semibold" style={{ color: "#FF5A36" }}>
            {formatTimer(remaining)}
          </span>
          <button
            type="button"
            onClick={() => setRunning(true)}
            disabled={running || remaining <= 0}
            className="rounded-xl2 border-none px-4.5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: "#FF5A36" }}
          >
            Mulai Timer
          </button>
          <button
            type="button"
            onClick={() => setRunning(false)}
            className="rounded-xl2 border-none px-4.5 py-2.5 text-sm font-semibold"
            style={{ background: "var(--nav-wrap)", color: "var(--ink)" }}
          >
            Berhenti
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          className="rounded-2xl border-2 px-6.5 py-3.5 text-[15px] font-semibold disabled:opacity-40"
          style={{ borderColor: "var(--input-border)", background: "var(--card)", color: "var(--ink)" }}
        >
          &larr; Sebelumnya
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
          className="rounded-2xl border-none px-6.5 py-3.5 text-[15px] font-semibold text-white disabled:opacity-40"
          style={{ background: "#FF5A36" }}
        >
          Selanjutnya &rarr;
        </button>
      </div>
      <button
        type="button"
        onClick={() => router.push(`/resep?id=${recipe.id}`)}
        className="mt-7 border-none bg-transparent text-[13px] font-semibold text-muted"
      >
        Keluar dari mode masak
      </button>
    </div>
  );
}
