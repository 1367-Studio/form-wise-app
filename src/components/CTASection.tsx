"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Lightning } from "@phosphor-icons/react";
import { useAudience } from "@/contexts/AudienceContext";

export default function CTASection({ trialDays }: { trialDays: number }) {
  const { audience } = useAudience();
  const t = useTranslations(`CTA.${audience}`);

  return (
    <section data-header-dark className="relative overflow-hidden bg-black">
      {/* Subtle geometric decoration */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -right-24 top-1/2 h-[130%] w-[45%] -translate-y-1/2 rotate-6 rounded-3xl bg-gradient-to-br from-white/[0.04] to-transparent" />
        <div className="absolute -right-10 top-1/2 h-[110%] w-[38%] -translate-y-1/2 rotate-6 rounded-3xl bg-gradient-to-br from-white/[0.03] to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="grid grid-cols-1 items-end gap-x-8 gap-y-10 lg:grid-cols-2">
          {/* Headline */}
          <h2 className="max-w-xl text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t("title")}
          </h2>

          {/* Subtitle + actions */}
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between lg:justify-end lg:gap-12">
            {/* <p className="max-w-sm text-lg text-gray-400">{t("subtitle")}</p> */}

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/register/free-trial">
                <Button className="w-full cursor-pointer rounded-full bg-white px-6 py-3 font-semibold text-black hover:bg-gray-200">
                  <Lightning className="mr-2 h-4 w-4" />
                  {t("primaryButton")}
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  className="w-full cursor-pointer rounded-full border-white/15 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10 hover:text-white"
                >
                  {t("secondaryButton")}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-10 text-sm text-gray-500">{t("trustBadge", { days: trialDays })}</p>
      </div>
    </section>
  );
}
