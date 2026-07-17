"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import RecipeForm from "@/components/RecipeForm";

export default function NewRecipePage() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const authLoading = useAppStore((s) => s.authLoading);
  const addRecipe = useAppStore((s) => s.addRecipe);

  useEffect(() => {
    if (!authLoading && !profile) {
      router.replace("/masuk");
    }
  }, [authLoading, profile, router]);

  if (authLoading || !profile) return null;

  return (
    <RecipeForm
      headerLabel="Tambah Resep Baru"
      onSubmit={async (input) => {
        const id = await addRecipe(input);
        router.push(id ? `/resep?id=${id}` : "/resep-saya");
      }}
    />
  );
}
