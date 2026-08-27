"use client";

import { useEffect } from "react";
import { injectContentsquareScript } from "@contentsquare/tag-sdk";
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  getCookieConsent,
} from "@/lib/cookie-consent";

/**
 * Contentsquare tag — audience measurement, so it is only injected once the
 * visitor has accepted cookies (RGPD / CNIL). It also listens for the consent
 * event so accepting from the banner starts it without a page reload.
 *
 * Must stay client-only — injectContentsquareScript touches document/window
 * and would throw during SSR.
 */
export function Contentsquare() {
  useEffect(() => {
    let injected = false;
    const injectIfAccepted = () => {
      if (injected || getCookieConsent() !== "accepted") return;
      injected = true;
      injectContentsquareScript({ clientId: "987f823ee2db3" });
    };
    injectIfAccepted();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, injectIfAccepted);
    return () =>
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, injectIfAccepted);
  }, []);
  return null;
}
