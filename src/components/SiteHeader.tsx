"use client";

import { useEffect, useState } from "react";
import { List } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import NavDrawerMobile from "./NavDrawerMobile";
import LogoFull from "./LogoFull";
import LogoIcon from "./LogoIcon";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "./LanguageSwitcher";

// Scroll distance after which the desktop header collapses the full logo to
// the compact icon mark.
const COMPACT_LOGO_SCROLL_Y = 32;
// Rendered logo height (Tailwind h-8) and the SVG's intrinsic aspect ratios,
// used to animate the full logo's width down to just the icon mark.
const LOGO_HEIGHT = "2rem";
const LOGO_FULL_ASPECT = 580 / 93;
const LOGO_ICON_ASPECT = 92 / 93;

export default function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [overDark, setOverDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("SiteHeader");
  const isHome = pathname === "/";

  // One scroll listener drives two things:
  // 1. `scrolled` — the desktop header shows the full logo at the top of the
  //    page and the compact icon mark once the user scrolls (all pages).
  // 2. `overDark` — on the homepage the fixed header passes over alternating
  //    light (hero, features, testimonials, pricing) and dark (FAQ, CTA)
  //    sections. Detect which section is currently behind the header bar so
  //    the logo/nav flip to stay readable.
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > COMPACT_LOGO_SCROLL_Y);

      if (!isHome) {
        setOverDark(false);
        return;
      }
      const probeY = 40; // inside the header bar
      let dark = false;
      document
        .querySelectorAll<HTMLElement>("[data-header-dark]")
        .forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top <= probeY && r.bottom > probeY) dark = true;
        });
      setOverDark(dark);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isHome]);

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/app")) {
    return null;
  }

  // The contact page has a dark (black) hero, so the header uses white text
  // there. Other pages (legal, about, auth) and the homepage hero are on a
  // light/white background, so we use the dark-text ("light") variant unless
  // a [data-header-dark] section (FAQ, CTA) is behind the bar.
  const isContact = pathname === "/contact";
  const light = isContact ? false : isHome ? !overDark : true;

  const bar = light
    ? "border-white/20 bg-white/10"
    : "border-white/20 bg-white/10";
  // Brand blue over light sections, white over dark ones.
  const logoColor = light ? "text-brand" : "text-white";

  const langSwitcher = light
    ? "text-ink hover:text-ink hover:bg-transparent"
    : "text-white hover:text-white hover:bg-transparen";

  const signInBtn = light
    ? "border-black/20 text-ink hover:bg-black/5 hover:text-ink bg-transparent"
    : "border-white/30 text-white hover:bg-transparen hover:text-white bg-transparent";

  const menuIcon = light ? "text-ink" : "text-white";

  return (
    <>
      {/* Normal header — visible on the hero, scrolls away with the page */}
      <header className="absolute inset-x-0 top-0 z-50 fixed w-full bg-transparent px-4 pt-4">
        <div
          className={`flex items-center justify-between rounded-2xl border px-6 py-3 backdrop-blur-xl transition-colors duration-300 lg:px-8 ${bar}`}
          style={{ maxWidth: "1200px", margin: "0 auto" }}
        >
          <div className="flex-shrink-0">
            <Link
              href="/"
              aria-label="formwise"
              className="-m-1.5 flex items-center p-1.5"
            >
              {/* Mobile: always the compact icon mark */}
              <LogoIcon
                className={`h-8 w-8 transition-colors duration-300 lg:hidden ${logoColor}`}
              />
              {/* Desktop: full logo at the top of the page; once scrolled the
                  wrapper's width animates down to the icon mark while the
                  wordmark fades, so the mark itself never moves or resizes. */}
              <span
                className="hidden overflow-hidden transition-[width] duration-500 ease-in-out motion-reduce:transition-none lg:block"
                style={{
                  width: `calc(${LOGO_HEIGHT} * ${
                    scrolled ? LOGO_ICON_ASPECT : LOGO_FULL_ASPECT
                  })`,
                }}
              >
                <LogoFull
                  className={`h-8 w-auto max-w-none transition-colors duration-300 ${logoColor}`}
                  wordmarkClassName={`transition-opacity duration-300 motion-reduce:transition-none ${
                    scrolled ? "opacity-0" : "opacity-100"
                  }`}
                />
              </span>
            </Link>
          </div>

          <nav className="flex items-center gap-3">
            <div className="hidden lg:flex gap-3 items-center">
              <LanguageSwitcher variant="ghost" className={langSwitcher} />
              <Link href="/register/free-trial">
                <Button className="min-w-[8rem] cursor-pointer rounded-full bg-brand hover:bg-brand-dark text-white">
                  {t("signUp")}
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  className={`min-w-[9rem] cursor-pointer rounded-full ${signInBtn}`}
                  variant="outline"
                >
                  {t("signIn")}
                </Button>
              </Link>
            </div>

            <div className="flex lg:hidden items-center gap-2">
              <LanguageSwitcher variant="ghost" className={langSwitcher} />
              <button
                onClick={() => setMobileMenuOpen(true)}
                className={`-m-2.5 inline-flex items-center justify-center rounded-md cursor-pointer p-2.5 ${menuIcon}`}
              >
                <span className="sr-only">{t("mobileMenu")}</span>
                <List className="h-6 w-6" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <NavDrawerMobile open={mobileMenuOpen} onClose={setMobileMenuOpen} />
    </>
  );
}
