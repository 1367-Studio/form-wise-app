"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import NavDrawerMobile from "./NavDrawerMobile";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";

export default function SiteHeader() {
  const [showSticky, setShowSticky] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("SiteHeader");

  useEffect(() => {
    const handleScroll = () => {
      const hero = document.querySelector("[data-hero]");
      if (hero) {
        setShowSticky(hero.getBoundingClientRect().bottom <= 0);
      } else {
        setShowSticky(window.scrollY > 100);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/app")) {
    return null;
  }

  return (
    <>
      {/* Normal header — visible on the hero, scrolls away with the page */}
      <header className="absolute inset-x-0 top-0 z-50 mt-8">
        <div
          className="flex items-center justify-between p-6 lg:px-8"
          style={{ maxWidth: "1200px", margin: "0 auto" }}
        >
          <div className="flex-shrink-0">
            <Link href="/" aria-label="formwise" className="-m-1.5 p-1.5">
              <Logo tone="light" />
            </Link>
          </div>

          <nav className="flex items-center gap-3">
            <div className="hidden lg:flex gap-3 items-center">
              <LanguageSwitcher variant="ghost" className="text-white hover:text-white hover:bg-white/10" />
              <Link href="/register/free-trial">
                <Button className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white">
                  {t("signUp")}
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  className="cursor-pointer border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent"
                  variant="outline"
                >
                  {t("signIn")}
                </Button>
              </Link>
            </div>

            <div className="flex lg:hidden items-center gap-2">
              <LanguageSwitcher variant="ghost" className="text-white hover:text-white hover:bg-white/10" />
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="-m-2.5 inline-flex items-center justify-center rounded-md cursor-pointer p-2.5 text-white"
              >
                <span className="sr-only">{t("mobileMenu")}</span>
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Pill header — appears only after scrolling past the hero */}
      {showSticky && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 w-[90%] max-w-6xl rounded-full bg-white/10 backdrop-blur-3xl backdrop-saturate-200 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)] ring-1 ring-white/20 transition-all duration-300">
          <div className="flex items-center justify-between px-6 py-1 lg:py-3">
            <Link href="/" aria-label="formwise">
              <Logo />
            </Link>

            <div className="hidden lg:flex gap-3 items-center">
              <LanguageSwitcher variant="ghost" />
              <Link href="/register/free-trial">
                <Button className="cursor-pointer">{t("signUp")}</Button>
              </Link>
              <Link href="/login">
                <Button className="cursor-pointer" variant="outline">
                  {t("signIn")}
                </Button>
              </Link>
            </div>

            <div className="flex lg:hidden items-center gap-2">
              <LanguageSwitcher variant="ghost" />
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 cursor-pointer hover:bg-white/10 transition"
              >
                <span className="sr-only">{t("openMenu")}</span>
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      <NavDrawerMobile open={mobileMenuOpen} onClose={setMobileMenuOpen} />
    </>
  );
}
