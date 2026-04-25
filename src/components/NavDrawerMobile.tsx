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

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
      <div
        className="fixed w-full h-full bg-white shadow-xl p-6 z-50"
        style={{
          background: "linear-gradient(0deg, #DEE9EE 0%, #F3F7F9 100%)",
        }}
      >
        <div className="flex justify-between items-center">
          <Link href="/" aria-label="formwise">
            <Logo />
          </Link>
          <button onClick={() => onClose(false)}>
            <X className="h-6 w-6 text-gray-700 cursor-pointer" />
          </button>
        </div>

        <nav className="absolute top-1/2 -translate-y-1/2 flex flex-col gap-4">
          <Link
            href="/contact"
            onClick={() => onClose(false)}
            className="text-sm font-medium text-gray-900"
          >
            {t("contactUs")}
          </Link>
          <Link href="/login" target="_blank">
            <Button className="cursor-pointer">{t("signIn")}</Button>
          </Link>
        </nav>
      </div>
    </div>
  );
}
