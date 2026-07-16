"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export default function StoreInit() {
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    useAppStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return null;
}
