"use client";

import Link from "next/link";
import LogoFull from "./LogoFull";

export default function MinimalFooter() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white py-4 px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        {/* Logo */}
        <Link href="/" aria-label="formwise" className="flex items-center">
          <LogoFull className="h-6 w-auto" />
        </Link>

        {/* Liens */}
        <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm">
          <Link
            href="/cgu"
            className="hover:text-primary transition-colors duration-150"
          >
            CGU
          </Link>
          <Link
            href="/politique-de-confidentialite"
            className="hover:text-primary transition-colors duration-150"
          >
            Confidentialité
          </Link>
          <Link
            href="/contact"
            className="hover:text-primary transition-colors duration-150"
          >
            Contact
          </Link>
        </div>

        {/* Société */}
        <span className="text-xs text-gray-400 text-center sm:text-right">
          &copy; {new Date().getFullYear()} Formwise – 1367 Studio
        </span>
      </div>
    </footer>
  );
}
