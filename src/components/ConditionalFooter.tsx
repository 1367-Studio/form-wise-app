"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import SiteFooter from "./SiteFooter";

const HIDDEN_PREFIXES = [
  "/dashboard",
  "/app",
  "/login",
  "/register",
  "/preinscription-success",
  "/preinscription",
  "/admin",
];

export default function ConditionalFooter() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p))) return null;

  return <SiteFooter />;
}
