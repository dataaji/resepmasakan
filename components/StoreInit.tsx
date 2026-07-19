"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export default function StoreInit() {
  const initAuth = useAppStore((s) => s.initAuth);
  const loadSiteContent = useAppStore((s) => s.loadSiteContent);
  const logVisit = useAppStore((s) => s.logVisit);

  useEffect(() => {
    initAuth();
    loadSiteContent();
    logVisit();
  }, [initAuth, loadSiteContent, logVisit]);

  return null;
}
