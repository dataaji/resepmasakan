"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export default function StoreInit() {
  const initAuth = useAppStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return null;
}
