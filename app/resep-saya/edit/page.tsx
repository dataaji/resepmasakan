"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import RecipeForm from "@/components/RecipeForm";

export default function EditRecipePage() {
  return (
    <Suspense fallback={null}>
      <EditRecipeContent />
    </Suspense>
  );
}

function EditRecipeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const recipeId = searchParams.get("id") ?? "";

  const recipe = useAppStore((s) => s.recipes.find((r) => r.id === recipeId));
  const loadRecipeDetail = useAppStore((s) => s.loadRecipeDetail);
  const updateRecipe = useAppStore((s) => s.updateRecipe);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!recipeId) return;
    loadRecipeDetail(recipeId).finally(() => setLoaded(true));
  }, [recipeId, loadRecipeDetail]);

  if (!recipe) {
    return (
      <div className="mx-auto max-w-[600px] px-8 py-16 text-center text-muted">
        {loaded ? "Resep tidak ditemukan." : "Memuat resep..."}
      </div>
    );
  }

  return (
    <RecipeForm
      headerLabel="Edit Resep"
      initial={recipe}
      onSubmit={async (input) => {
        await updateRecipe(recipe.id, input);
        router.push(`/resep?id=${recipe.id}`);
      }}
    />
  );
}
