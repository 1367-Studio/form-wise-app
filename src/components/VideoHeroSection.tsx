"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  CheckCircle,
  GearSix,
  Users,
  CreditCard,
  Bell,
  Sparkle,
} from "@phosphor-icons/react";

const featureIcons = [GearSix, Users, CreditCard, Bell, Sparkle];

export default function VideoHeroSection({ trialDays }: { trialDays: number }) {
  const t = useTranslations("Hero");
  const features = featureIcons.map((icon, i) => ({
    label: t(`feature${i + 1}` as Parameters<typeof t>[0]),
    icon,
  }));

  return (
    <section
      data-hero
      aria-label={t("introAriaLabel")}
      className="relative w-full bg-white flex flex-col items-center justify-start pt-28 px-4 pb-6 overflow-hidden"
    >
      {/* Subtle geometric decoration — skewed parallelogram panels */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Right side */}
        <div className="absolute -right-16 top-[8%] h-[16%] w-[22%] skew-x-[-18deg] bg-gradient-to-l from-black/[0.05] to-black/[0.015]" />
        <div className="absolute -right-8 top-[28%] h-[16%] w-[26%] skew-x-[-18deg] bg-gradient-to-l from-black/[0.04] to-transparent" />
        <div className="absolute -right-24 top-[48%] h-[12%] w-[30%] skew-x-[-18deg] bg-gradient-to-l from-black/[0.025] to-transparent" />
        {/* Left side — mirrored */}
        <div className="absolute -left-16 top-[8%] h-[16%] w-[22%] skew-x-[18deg] bg-gradient-to-r from-black/[0.05] to-black/[0.015]" />
        <div className="absolute -left-8 top-[28%] h-[16%] w-[26%] skew-x-[18deg] bg-gradient-to-r from-black/[0.04] to-transparent" />
        <div className="absolute -left-24 top-[48%] h-[12%] w-[30%] skew-x-[18deg] bg-gradient-to-r from-black/[0.025] to-transparent" />
      </div>

      {/* Text content */}
      <div className="relative z-20 text-center max-w-5xl w-full mb-10">
        {/* Badge */}
        <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-4 py-1.5 text-sm text-[#1a1a1a]">
          {t("badge")}
        </div>

        <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight text-[#1a1a1a]">
          {t("title")}
        </h1>
        <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#1a1a1a]">
          {t("subtitle")}
        </p>

        {/* Single primary CTA */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4">
          <Link href="/register/free-trial">
            <Button className="cursor-pointer h-12 w-full rounded-full bg-[#003EA3] px-8 text-base font-semibold text-white hover:bg-[#002E7A] sm:w-auto">
              {t("ctaTrial")}
            </Button>
          </Link>

          {/* Trust line */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#1a1a1a]">
            <span className="inline-flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#003EA3]" />
              {t("reassurance1", { days: trialDays })}
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#003EA3]" />
              {t("reassurance2")}
            </span>
          </div>
        </div>

        {/* Feature pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {features.map(({ label, icon: Icon }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-4 py-2 text-sm text-[#1a1a1a]"
            >
              <Icon className="h-4 w-4 text-[#1a1a1a]" />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Preview card */}
      <div className="relative z-20 w-full max-w-5xl mx-auto">
        <div className="relative">
          <div className="relative rounded-xl overflow-hidden border border-black/10 shadow-2xl shadow-black/15">
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 border-b border-black/[0.06]">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="flex-1 mx-4 bg-black/5 rounded-md h-5 flex items-center px-3">
                <span className="text-xs text-[#1a1a1a]/40 truncate">
                  app.formwise.io
                </span>
              </div>
            </div>
            <div className="w-full aspect-video overflow-hidden">
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="block w-full h-full object-cover"
              >
                <source src="/hero.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
