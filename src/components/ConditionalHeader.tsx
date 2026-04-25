"use client";

import { usePathname } from "@/i18n/navigation";
import SiteHeader from "./SiteHeader";

const HIDDEN_PREFIXES = [
  "/dashboard",
  "/app",
  "/register",
  "/login",
  "/preinscription-success",
  "/preinscription",
  "/admin",
];

export default function ConditionalHeader() {
  const pathname = usePathname();

  if (HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p))) return null;

  return <SiteHeader />;
}
