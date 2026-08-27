"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import LogoIcon from "./LogoIcon";
import { useTranslations } from "next-intl";
import {
  Headset,
  LockSimpleOpen,
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
      {/* Background artwork, blurred to a wash of colour. Only a rim of it is
          ever visible — the white panel below covers the rest — so it reads as
          a coloured border on the page rather than as a picture. */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <Image
          src="/hero-image.png"
          alt=""
          fill
          priority
          sizes="100vw"
          // scale-110 pushes the blur's soft edge outside the section; without
          // it the blur feathers inward and the rim fades out at the corners.
          className="scale-110 object-cover object-top blur-3xl"
        />
        {/* The artwork's lower half is cream stone and green trees. This keeps
            the rim reading as brand blue all the way round. */}
        <div className="absolute inset-0 bg-brand/40" />
      </div>

      {/* White page surface, inset so the blurred artwork shows as a border.
          Open at the bottom so the white flows into the sections below instead
          of drawing a stray blue line across the middle of the page. */}
      <div
        className="pointer-events-none absolute inset-x-1.5 bottom-0 top-1.5 z-10 rounded-t-md bg-white sm:inset-x-2 sm:top-2"
        aria-hidden="true"
      />

      {/* A single brand mark bleeding off the top-right corner, rotated and very
          faint. It's a subtle reminder of the brand, not something meant to be
          read as a logo. */}
      <div
        className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
        aria-hidden="true"
      >
        <LogoIcon className="absolute -right-32 -top-28 h-[32rem] w-[32rem] rotate-[18deg] text-brand opacity-[0.03] sm:-right-44 sm:-top-40 sm:h-[48rem] sm:w-[48rem] lg:-right-56 lg:-top-52 lg:h-[64rem] lg:w-[64rem]" />
      </div>

      {/* Text content */}
      <div className="relative z-20 text-center max-w-5xl w-full mb-10">
        {/* Badge */}
        <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-4 py-1.5 text-sm text-ink">
          {t("badge")}
        </div>

        <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight text-ink">
          {t("title")}
        </h1>
        <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-ink">
          {t("subtitle")}
        </p>

        {/* Single primary CTA */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4">
          <Link href="/register/free-trial">
            <Button className="cursor-pointer h-12 w-full rounded-full bg-brand px-8 text-base font-semibold text-white hover:bg-brand-dark sm:w-auto">
              {t("ctaTrial")}
            </Button>
          </Link>

          {/* Trust line */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink">
            <span className="inline-flex items-center gap-2">
              {/* "No card": credit-card icon with a diagonal strike-through.
                  The white bar underneath knocks out the card lines so the
                  slash stays legible at 16px. */}
              <span
                className="relative inline-flex h-4 w-4 shrink-0 text-brand"
                aria-hidden="true"
              >
                <CreditCard className="h-4 w-4" />
                <span className="absolute left-1/2 top-1/2 h-[2px] w-[100%] -translate-x-1/2 -translate-y-1/2 -rotate-55 rounded-full bg-white" />
                <span className="absolute left-1/2 top-1/2 h-[1px] w-[100%] -translate-x-1/2 -translate-y-1/2 -rotate-55 rounded-full bg-current" />
              </span>
              {t("reassurance1", { days: trialDays })}
            </span>
            <span className="inline-flex items-center gap-2">
              {/* "No commitment": open padlock — not locked in */}
              <LockSimpleOpen
                className="h-4 w-4 shrink-0 text-brand"
                aria-hidden="true"
              />
              {t("reassurance2")}
            </span>
            <span className="inline-flex items-center gap-2">
              <Headset
                className="h-4 w-4 shrink-0 text-brand"
                aria-hidden="true"
              />
              {t("reassurance3")}
            </span>
          </div>
        </div>

        {/* Feature pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {features.map(({ label, icon: Icon }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-4 py-2 text-sm text-ink"
            >
              <Icon className="h-4 w-4 text-ink" />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Preview card */}
      <div className="relative z-20 w-full max-w-5xl mx-auto">
        {/* Frosted-glass frame around the browser mockup */}
        <div className="relative rounded-2xl border border-black/[0.06] bg-black/[0.035] p-2 backdrop-blur-xl sm:rounded-3xl sm:p-3">
          <div className="relative rounded-lg overflow-hidden border border-black/10 shadow-2xl shadow-black/15 sm:rounded-xl">
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 border-b border-black/[0.06]">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="flex-1 mx-4 bg-black/5 rounded-md h-5 flex items-center px-3">
                <span className="text-xs text-ink/40 truncate">
                  app.formwise.fr
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
