"use client";

import Link from "next/link";
import { Lightning } from "@phosphor-icons/react";

export default function MinimalFooter() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white py-4 px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 text-gray-900">
          <Lightning className="h-4 w-4 text-primary" />
          <span className="font-semibold">Formwise</span>
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
