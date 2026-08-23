/** @type {import('next-sitemap').IConfig} */

// The site is served on www; the apex 307-redirects to it. Every sitemap URL
// must be the final destination, otherwise Google crawls a redirect chain.
const SITE_URL = "https://www.formwise.fr";

const LOCALES = ["fr", "en", "pt", "es"];
const DEFAULT_LOCALE = "fr";

// Private / transactional routes: no SEO value, and several are behind auth.
const PRIVATE = [
  "/admin",
  "/dashboard",
  "/login",
  "/register",
  "/register-staff",
  "/create-password",
  "/forgot-password",
  "/reset-password",
  "/redirect",
  "/preinscription-success",
];

// routing.localePrefix is "as-needed", so French lives at the bare path and the
// other locales are prefixed. Turn "/fr/a-propos" into "/a-propos".
function localeUrl(locale, path) {
  const suffix = path === "/" ? "" : path;
  // No trailing slash on the root: the self-referencing hreflang has to match
  // <loc> byte for byte, and next-sitemap emits <loc> without one.
  return locale === DEFAULT_LOCALE
    ? `${SITE_URL}${suffix}`
    : `${SITE_URL}/${locale}${suffix}`;
}

// "/en/a-propos" -> { locale: "en", path: "/a-propos" }
function splitLocale(path) {
  const [, maybeLocale, ...rest] = path.split("/");
  if (LOCALES.includes(maybeLocale)) {
    return { locale: maybeLocale, path: "/" + rest.join("/") };
  }
  return { locale: DEFAULT_LOCALE, path };
}

// "/" and "/fr" both resolve to the same French URL; keep only the first.
const emitted = new Set();

module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  outDir: "./public",
  // Asset routes (icon0.svg, manifest.json, ...) are emitted by the app-folder
  // metadata conventions, not pages — they must not appear as sitemap entries.
  exclude: [
    "/api/*",
    "/*.svg",
    "/*.png",
    "/*.ico",
    "/*.json",
    ...PRIVATE.flatMap((p) => [p, `${p}/*`]),
    ...LOCALES.flatMap((l) =>
      PRIVATE.flatMap((p) => [`/${l}${p}`, `/${l}${p}/*`]),
    ),
  ],
  transform: async (config, path) => {
    const { locale, path: bare } = splitLocale(path);

    // Defence in depth: `exclude` uses glob matching, this catches the rest.
    if (PRIVATE.some((p) => bare === p || bare.startsWith(`${p}/`))) return null;
    if (/\.[a-z0-9]+$/i.test(bare)) return null;

    const loc = localeUrl(locale, bare);
    if (emitted.has(loc)) return null;
    emitted.add(loc);

    return {
      loc,
      changefreq: "weekly",
      priority: bare === "/" ? 1.0 : 0.7,
      lastmod: new Date().toISOString(),
      // hreflang: tells google.fr to serve the French URL to French searchers
      // and the others to their own audiences, instead of picking one at random.
      alternateRefs: [
        ...LOCALES.map((l) => ({
          href: localeUrl(l, bare),
          hreflang: l,
          hrefIsAbsolute: true,
        })),
        {
          href: localeUrl(DEFAULT_LOCALE, bare),
          hreflang: "x-default",
          hrefIsAbsolute: true,
        },
      ],
    };
  },
  // next-sitemap does not pick up the bare "/[locale]" index route from the
  // prerender manifest, so the homepage — the most important URL on the site —
  // has to be added by hand, once per locale.
  additionalPaths: async (config) =>
    Promise.all(LOCALES.map((l) => config.transform(config, `/${l}`))),
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...PRIVATE, ...PRIVATE.map((p) => `${p}/*`), "/api/*"],
      },
    ],
  },
};
