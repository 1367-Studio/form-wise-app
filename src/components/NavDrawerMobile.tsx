"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";

interface Props {
  open: boolean;
  onClose: (value: boolean) => void;
}

export default function NavDrawerMobile({ open, onClose }: Props) {
  const t = useTranslations("NavDrawer");
  if (!open) return null;

  const close = () => onClose(false);

  const navLinks = [
    { key: "pricing", href: "/#pricing" },
    { key: "about", href: "/a-propos" },
    { key: "bookDemo", href: "/contact" },
    { key: "contactUs", href: "/contact" },
  ] as const;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed w-full h-full bg-black/80 backdrop-blur-xl shadow-xl p-6 z-50 flex flex-col">
        <div className="flex justify-between items-center">
          <Link href="/" aria-label="formwise" onClick={close}>
            <Logo tone="light" />
          </Link>
          <button onClick={close} aria-label="Close menu">
            <X className="h-6 w-6 text-white cursor-pointer" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col justify-center gap-2">
          {navLinks.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={close}
              className="py-2 text-2xl font-semibold text-white transition-colors hover:text-white/70"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3 pb-4">
          <Link href="/register/free-trial" onClick={close}>
            <Button className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white">
              {t("signUp")}
            </Button>
          </Link>
          <Link href="/login" onClick={close}>
            <Button
              variant="outline"
              className="w-full cursor-pointer border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              {t("signIn")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
