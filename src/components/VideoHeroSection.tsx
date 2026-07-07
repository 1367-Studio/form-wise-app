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

export default function VideoHeroSection() {
  const t = useTranslations("Hero");
  const features = featureIcons.map((icon, i) => ({
    label: t(`feature${i + 1}` as Parameters<typeof t>[0]),
    icon,
  }));

  return (
    <section
      data-hero
      role="banner"
      aria-label={t("introAriaLabel")}
      className="relative w-full bg-black flex flex-col items-center justify-start pt-28 px-4 pb-6 overflow-hidden"
    >
      {/* Background glow blobs */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-600/20 blur-[140px] rounded-full" />
        <div className="absolute bottom-[10%] left-[5%] w-[350px] h-[300px] bg-blue-800/15 blur-[100px] rounded-full" />
        <div className="absolute bottom-[20%] right-[5%] w-[300px] h-[250px] bg-indigo-700/10 blur-[100px] rounded-full" />
      </div> */}

      {/* Subtle geometric decoration — skewed parallelogram panels */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Right side */}
        <div className="absolute -right-16 top-[8%] h-[16%] w-[22%] skew-x-[-18deg] bg-gradient-to-l from-white/[0.06] to-white/[0.02]" />
        <div className="absolute -right-8 top-[28%] h-[16%] w-[26%] skew-x-[-18deg] bg-gradient-to-l from-white/[0.05] to-transparent" />
        <div className="absolute -right-24 top-[48%] h-[12%] w-[30%] skew-x-[-18deg] bg-gradient-to-l from-white/[0.03] to-transparent" />
        {/* Left side — mirrored */}
        <div className="absolute -left-16 top-[8%] h-[16%] w-[22%] skew-x-[18deg] bg-gradient-to-r from-white/[0.06] to-white/[0.02]" />
        <div className="absolute -left-8 top-[28%] h-[16%] w-[26%] skew-x-[18deg] bg-gradient-to-r from-white/[0.05] to-transparent" />
        <div className="absolute -left-24 top-[48%] h-[12%] w-[30%] skew-x-[18deg] bg-gradient-to-r from-white/[0.03] to-transparent" />
      </div>

      {/* Text content */}
      <div className="relative z-20 text-center max-w-5xl w-full mb-10">
        {/* Badge */}
        <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-gray-200 backdrop-blur-sm">
          {t("badge")}
        </div>

        <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight text-white">
          {t("title")}
        </h1>
        <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-gray-300">
          {t("subtitle")}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-x-4">
          <Link href="/register/free-trial">
            <Button className="cursor-pointer w-full sm:w-auto rounded-full bg-white text-black hover:bg-gray-200">
              {t("ctaTrial")}
            </Button>
          </Link>
          <Link href="https://calendly.com/hello1367studio/30min" target="_blank">
            <Button
              variant="outline"
              className="cursor-pointer w-full sm:w-auto rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              {t("ctaDemo")}
            </Button>
          </Link>
        </div>

        {/* Trust line */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-300">
          <span className="inline-flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-white" />
            {t("reassurance1")}
          </span>
          <span className="inline-flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-white" />
            {t("reassurance2")}
          </span>
        </div>

        {/* Feature pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {features.map(({ label, icon: Icon }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200"
            >
              <Icon className="h-4 w-4 text-gray-400" />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Preview card */}
      <div className="relative z-20 w-full max-w-5xl mx-auto">
        <div className="relative">
          <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60">
            <div className="flex items-center gap-2 bg-[#111111] px-4 py-3 border-b border-white/[0.07]">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="flex-1 mx-4 bg-white/5 rounded-md h-5 flex items-center px-3">
                <span className="text-xs text-white/20 truncate">
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
