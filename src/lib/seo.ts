import { routing } from "../i18n/routing";

// The site is served on www; the apex 307-redirects here. Canonicals and
// hreflang must point at the final destination, never at the redirecting host.
export const SITE_URL = "https://www.formwise.fr";

/**
 * routing.localePrefix is "as-needed", so the default locale (fr) lives at the
 * bare path and every other locale is prefixed: "/a-propos" vs "/en/a-propos".
 */
export function localePath(locale: string, path: string): string {
  const suffix = path === "/" ? "" : path;
  return locale === routing.defaultLocale
    ? suffix || "/"
    : `/${locale}${suffix}`;
}

/**
 * Canonical + hreflang cluster for one page, in the shape Next's Metadata
 * expects. `path` is the locale-less route, e.g. "/a-propos" or "/".
 *
 * Without this every locale of a page looks like a duplicate to Google, and it
 * picks one at random to show — which is why google.fr was surfacing English.
 */
export function localeAlternates(locale: string, path: string) {
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, localePath(l, path)]),
  );
  return {
    canonical: localePath(locale, path),
    languages: {
      ...languages,
      "x-default": localePath(routing.defaultLocale, path),
    },
  };
}
