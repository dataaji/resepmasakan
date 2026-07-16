"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import RecipeForm from "@/components/RecipeForm";

export default function NewRecipePage() {
  const router = useRouter();
  const currentUser = useAppStore((s) =>
    s.users.find((u) => u.id === s.currentUserId)
  );
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const addRecipe = useAppStore((s) => s.addRecipe);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!currentUser) {
      router.replace("/masuk");
    } else if (!currentUser.emailVerified) {
      router.replace("/resep-saya");
    }
  }, [hasHydrated, currentUser, router]);

  if (!hasHydrated || !currentUser || !currentUser.emailVerified) return null;

  return (
    <RecipeForm
      headerLabel="Tambah Resep Baru"
      onSubmit={(input) => {
        const id = addRecipe(input);
        router.push(id ? `/resep?id=${id}` : "/resep-saya");
      }}
    />
  );
}
