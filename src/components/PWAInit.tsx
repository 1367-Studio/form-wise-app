"use client";

import { useEffect } from "react";

/**
 * Mounted once at the top of the layout to register the service worker.
 * No UI. Safe to render in both authenticated and public sections.
 */
export function PWAInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // Don't register in dev unless the user opts in — SW caching can mask
    // hot-reload changes and confuse local debugging.
    if (
      process.env.NODE_ENV !== "production" &&
      !("__FW_FORCE_SW__" in window)
    ) {
      return;
    }
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((err) => {
        console.warn("SW registration failed", err);
      });
  }, []);

  return null;
}
