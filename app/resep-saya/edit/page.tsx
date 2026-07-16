"use client";

import { Suspense } from "react";
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
  const updateRecipe = useAppStore((s) => s.updateRecipe);
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  if (!hasHydrated) return null;

  if (!recipe) {
    return (
      <div className="mx-auto max-w-[600px] px-8 py-16 text-center text-muted">
        Resep tidak ditemukan.
      </div>
    );
  }

  return (
    <RecipeForm
      headerLabel="Edit Resep"
      initial={recipe}
      onSubmit={(input) => {
        updateRecipe(recipe.id, input);
        router.push(`/resep?id=${recipe.id}`);
      }}
    />
  );
}
