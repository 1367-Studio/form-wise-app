"use client";

import { useEffect } from "react";
import { injectContentsquareScript } from "@contentsquare/tag-sdk";

/**
 * Contentsquare tag. Must stay client-only — injectContentsquareScript touches
 * document/window and would throw during SSR.
 */
export function Contentsquare() {
  useEffect(() => {
    injectContentsquareScript({ clientId: "987f823ee2db3" });
  }, []);
  return null;
}
