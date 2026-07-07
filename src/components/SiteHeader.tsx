"use client";

import { useState } from "react";
import { List } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import NavDrawerMobile from "./NavDrawerMobile";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";

export default function SiteHeader() {
  // const [showSticky, setShowSticky] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("SiteHeader");


  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/app")) {
    return null;
  }

  return (
    <>
      {/* Normal header — visible on the hero, scrolls away with the page */}
      <header className="absolute inset-x-0 top-0 z-50 fixed w-full bg-transparent px-4 pt-4">
        <div
          className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-6 py-3 backdrop-blur-xl lg:px-8"
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
