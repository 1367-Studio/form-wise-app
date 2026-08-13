"use client";

import { useEffect, useState } from "react";
import { List, AsteriskIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import NavDrawerMobile from "./NavDrawerMobile";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "./LanguageSwitcher";

export default function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [overDark, setOverDark] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("SiteHeader");
  const isHome = pathname === "/";

  // The homepage fixed header passes over alternating light (hero, features,
  // testimonials, pricing) and dark (FAQ, CTA) sections. Detect which section is
  // currently behind the header bar so the logo/nav flip to stay readable —
  // white text over dark sections, dark text over light ones.
  useEffect(() => {
    if (!isHome) {
      setOverDark(false);
      return;
    }
    const onScroll = () => {
      const probeY = 40; // inside the header bar
      let dark = false;
      document.querySelectorAll<HTMLElement>("[data-header-dark]").forEach((el) => {
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
  const logoText = light ? "text-gray-900" : "text-white";

  const langSwitcher = light
    ? "text-gray-900 hover:text-gray-900 hover:bg-transparent"
    : "text-white hover:text-white hover:bg-transparen";

  const signInBtn = light
    ? "border-black/20 text-gray-900 hover:bg-black/5 hover:text-gray-900 bg-transparent"
    : "border-white/30 text-white hover:bg-transparen hover:text-white bg-transparent";
    
  const menuIcon = light ? "text-gray-900" : "text-white";

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
              className={`-m-1.5 p-1.5 flex items-center gap-2 font-bold text-lg transition-colors duration-300 ${logoText}`}
            >
              <AsteriskIcon size={32} />
              <span>formwise</span>
            </Link>
          </div>

          <nav className="flex items-center gap-3">
            <div className="hidden lg:flex gap-3 items-center">
              <LanguageSwitcher variant="ghost" className={langSwitcher} />
              <Link href="/register/free-trial">
                <Button className="min-w-[8rem] cursor-pointer rounded-full bg-[#003EA3] hover:bg-[#002E7A] text-white">
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
