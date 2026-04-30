"use client";

import { JSX, SVGProps } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "./Logo";

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/formwise.fr/",
    icon: (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path
          fillRule="evenodd"
          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    name: "X",
    href: "#",
    icon: (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
      </svg>
    ),
  },
];

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
              <Logo size="lg" />
            </Link>
            <p className="max-w-sm text-balance text-sm/6 text-gray-600">
              {t("tagline")}
            </p>
            <div className="flex items-center gap-x-5 pt-2">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-500 transition-colors hover:text-[#2563EB]"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon aria-hidden="true" className="size-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-7 lg:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                {t("company")}
              </h3>
              <ul role="list" className="mt-5 space-y-3">
                {companyLinks.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-900 transition-colors hover:text-[#2563EB]"
                    >
                      {t(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                {t("legal")}
              </h3>
              <ul role="list" className="mt-5 space-y-3">
                {legalLinks.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-900 transition-colors hover:text-[#2563EB]"
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
          <p className="text-xs text-gray-500">
            {t("copyright", {
              year: new Date().getFullYear(),
              studio: "1367 Studio",
            })}
          </p>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
              Made in Marseille
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
