/**
 * Cookie-consent helpers shared by the banner, the footer "manage cookies"
 * link and the analytics loaders.
 *
 * The choice is stored in a first-party cookie (not localStorage) so it can be
 * read server-side later if needed, and kept for 6 months — the CNIL's
 * recommended retention for a consent choice (13 months max).
 */

export type CookieConsent = "accepted" | "rejected";

export const COOKIE_CONSENT_NAME = "fw_cookie_consent";
const COOKIE_CONSENT_MAX_AGE = 60 * 60 * 24 * 182; // ~6 months, in seconds

/** Fired on `window` whenever the consent choice changes. */
export const COOKIE_CONSENT_CHANGED_EVENT = "fw:cookie-consent-changed";
/** Fired on `window` to re-open the banner (e.g. footer "manage cookies"). */
export const COOKIE_BANNER_OPEN_EVENT = "fw:cookie-banner-open";

export function getCookieConsent(): CookieConsent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_CONSENT_NAME}=`));
  const value = match?.split("=")[1];
  return value === "accepted" || value === "rejected" ? value : null;
}

export function setCookieConsent(value: CookieConsent) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_CONSENT_NAME}=${value}; Max-Age=${COOKIE_CONSENT_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(
    new CustomEvent<CookieConsent>(COOKIE_CONSENT_CHANGED_EVENT, { detail: value }),
  );
}

export function openCookieBanner() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(COOKIE_BANNER_OPEN_EVENT));
}
