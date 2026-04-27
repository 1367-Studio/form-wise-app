"use client";

import { useEffect } from "react";

/**
 * Warns the user before they leave the page when `isDirty` is true.
 *
 * Coverage:
 *   ✅ Browser refresh
 *   ✅ Tab close
 *   ✅ External navigation (browser address bar / external back)
 *   ⚠️ In-app <Link> clicks and router.push are NOT intercepted by
 *      `beforeunload` — those are SPA-internal. For those flows, pair
 *      this hook with an explicit ConfirmLeaveDialog on Cancel buttons,
 *      or wrap navigation in a guarded handler.
 *
 * Usage:
 *   const isDirty = name !== initial.name || email !== initial.email;
 *   useUnsavedChanges(isDirty);
 */
export function useUnsavedChanges(isDirty: boolean): void {
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      // Modern browsers ignore the custom string and show a generic prompt,
      // but setting returnValue is required to trigger that prompt.
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);
}
