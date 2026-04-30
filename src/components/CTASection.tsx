"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Zap } from "lucide-react";

export default function CTASection() {
  const t = useTranslations("CTA");

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
      <div className="rounded-3xl bg-[#0F172A] p-8 text-center sm:p-12">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
          {t("subtitle")}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-x-4">
          <Link href="/register/free-trial">
            <Button className="cursor-pointer bg-[#2563EB] px-6 py-3 font-semibold text-white hover:bg-[#1D4ED8]">
              <Zap className="mr-2 h-4 w-4" />
              {t("primaryButton")}
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              variant="outline"
              className="cursor-pointer border-gray-500 bg-transparent px-6 py-3 font-semibold text-gray-300 hover:border-gray-300 hover:text-white"
            >
              {t("secondaryButton")}
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-500">{t("trustBadge")}</p>
      </div>
    </section>
  );
}
