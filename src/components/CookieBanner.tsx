"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  COOKIE_BANNER_OPEN_EVENT,
  getCookieConsent,
  setCookieConsent,
  type CookieConsent,
} from "@/lib/cookie-consent";

/**
 * RGPD / CNIL cookie banner.
 *
 * - Shown until the visitor makes a choice; nothing non-essential loads before.
 * - "Reject all" and "Accept all" are one click each and equally prominent
 *   (refusing must be as easy as accepting).
 * - Can be re-opened at any time via `openCookieBanner()` (footer link) so the
 *   visitor can withdraw or change their consent.
 */
export default function CookieBanner() {
  const t = useTranslations("CookieBanner");
  // Start hidden and decide after mount: the cookie is only readable in the
  // browser, and rendering server-side would cause a hydration mismatch.
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (getCookieConsent() === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(COOKIE_BANNER_OPEN_EVENT, reopen);
    return () => window.removeEventListener(COOKIE_BANNER_OPEN_EVENT, reopen);
  }, []);

  if (!open) return null;

  const choose = (value: CookieConsent) => {
    setCookieConsent(value);
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-text"
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-black/10 bg-white p-5 shadow-2xl shadow-black/15 sm:p-6">
        <h2
          id="cookie-banner-title"
          className="text-base font-semibold text-ink"
        >
          {t("title")}
        </h2>
        <p
          id="cookie-banner-text"
          className="mt-2 text-sm leading-relaxed text-gray-600"
        >
          {t("text")}{" "}
          <Link
            href="/politique-de-confidentialite"
            className="font-medium text-brand underline underline-offset-4 hover:text-brand-dark"
          >
            {t("privacyLink")}
          </Link>
        </p>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => choose("rejected")}
            className="h-10 cursor-pointer rounded-full border-black/20 px-6 text-gray-900 hover:bg-black/5 hover:text-gray-900 sm:min-w-[9rem]"
          >
            {t("rejectAll")}
          </Button>
          <Button
            type="button"
            onClick={() => choose("accepted")}
            className="h-10 cursor-pointer rounded-full bg-brand px-6 text-white hover:bg-brand-dark sm:min-w-[9rem]"
          >
            {t("acceptAll")}
          </Button>
        </div>
      </div>
    </div>
  );
}
