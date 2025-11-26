"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Zap, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import NavDrawerMobile from "./NavDrawerMobile";
import { Button } from "@/components/ui/button";

// const navigation = [
//   // { name: "Contactez-nous", href: "/contact" },
//   // { name: "Fonctionnalités", href: "#" },
// ];

export default function SiteHeader() {
  const [showSticky, setShowSticky] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setShowSticky(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/app")) {
    return null;
  }

  return (
    <>
      <header className="absolute inset-x-0 top-0 z-50 mt-8">
        {/* Sticky Header */}
        {showSticky && (
          <div className="fixed top-4 left-1/2 z-40 -translate-x-1/2 w-[90%] max-w-6xl rounded-full bg-white/10 backdrop-blur-3xl backdrop-saturate-200 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)] ring-1 ring-white/20 transition-all duration-300">
            <div className="flex items-center justify-between px-6 py-1 lg:py-3">
              <Link
                href="/"
                className="flex fancy-gradient-text items-center font-semibold text-gray-900"
              >
                <Zap className="h-5 w-5 mr-1" />
                Form<span className="font-bold">wise</span>
              </Link>

              <div className="hidden lg:flex gap-6 items-center">
                <Link
                  href="/register/school-register"
                  className="text-sm flex font-semibold text-white-700 hover:text-indigo-600"
                >
                  <Button className="cursor-pointer">S&apos;inscrire</Button>
                </Link>
                <Link
                  href="/login"
                  className="text-sm flex font-semibold text-white-700 hover:text-indigo-600"
                >
                  <Button className="cursor-pointer" variant={"outline"}>
                    Se connecter
                  </Button>
                </Link>
              </div>
              <div className="flex lg:hidden">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 cursor-pointer hover:bg-white/10 transition"
                >
                  <span className="sr-only">Ouvrir le menu</span>
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Normal Header */}
        <div
          className="flex items-center justify-between p-6 lg:px-8"
          style={{ maxWidth: "1200px", margin: "0 auto" }}
        >
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="flex font-semibold items-center fancy-gradient-text -m-1.5 p-1.5"
            >
              <Zap className="h-5 w-5 mr-1" />
              Form<span className="font-bold">wise</span>
            </Link>
          </div>

          <nav className="flex items-center gap-6">
            {/* <div className="hidden lg:flex lg:gap-x-12">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div> */}
            <div className="hidden lg:flex gap-6 items-center">
              <Link
                href="/register/school-register"
                className="text-sm flex font-semibold text-white-700 hover:text-indigo-600"
              >
                <Button className="cursor-pointer">S&apos;inscrire</Button>
              </Link>
              <Link
                href="/login"
                className="text-sm flex font-semibold text-white-700 hover:text-indigo-600"
              >
                <Button className="cursor-pointer" variant={"outline"}>
                  Se connecter
                </Button>
              </Link>
            </div>

            <div className="flex lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="-m-2.5 inline-flex items-center justify-center rounded-md cursor-pointer p-2.5 text-gray-700"
              >
                <span className="sr-only">Menu mobile</span>
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <NavDrawerMobile open={mobileMenuOpen} onClose={setMobileMenuOpen} />
    </>
  );
}
