"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LogoFull from "./LogoFull";


export default function SiteFooter() {
  const t = useTranslations("SiteFooter");

  const companyLinks = [{ key: "about", href: "/a-propos" }] as const;

  const legalLinks = [
    { key: "termsOfUse", href: "/cgu" },
    { key: "privacyPolicy", href: "/politique-de-confidentialite" },
    { key: "termsOfService", href: "/cgs" },
    { key: "legalNotice", href: "/mentions-legales" },
  ] as const;

  return (
    <footer className="paper-bg border-t border-black/10">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-10 sm:pt-20 lg:px-8 lg:pt-24">
        {/* Top grid */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-5 space-y-6">
            <Link href="/" aria-label="formwise" className="inline-block">
              <LogoFull className="h-8 w-auto" />
            </Link>
            <p className="max-w-sm text-balance text-sm/6 text-ink/80">
              {t("tagline")}
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-7 lg:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/60">
                {t("company")}
              </h3>
              <ul role="list" className="mt-5 space-y-3">
                {companyLinks.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="text-sm text-ink transition-colors hover:text-brand"
                    >
                      {t(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/60">
                {t("legal")}
              </h3>
              <ul role="list" className="mt-5 space-y-3">
                {legalLinks.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="text-sm text-ink transition-colors hover:text-brand"
                    >
                      {t(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col-reverse items-start gap-4 border-t border-black/10 pt-6 sm:mt-20 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink/60">
            {t("copyright", {
              year: new Date().getFullYear(),
              studio: "1367 Studio",
            })}
          </p>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink/60">
              Made in Marseille
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
