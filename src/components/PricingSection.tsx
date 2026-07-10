"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { AdheraPricingInfo, PlanTier } from "@/lib/adhera-pricing";
import BillingSelector, { type BillingPeriod } from "./pricing/BillingSelector";
import PricingCard, { type PricingPlan } from "./pricing/PricingCard";

gsap.registerPlugin(ScrollTrigger);

// Set to a bare international number (e.g. "33612345678") to route the custom
// plan's CTA straight to WhatsApp; empty keeps it pointing at the contact page.
const WHATSAPP_NUMBER = "";

// Used only if ADHERA_STRIPE_PRICE_* env vars aren't configured for this deployment
// (getAdheraPricing() then resolves to null — see src/app/[locale]/page.tsx) — never the
// primary source. Amounts are in euros, kept in sync with adhera's own
// scripts/stripe-setup-tiers.ts so a misconfigured env doesn't show wildly wrong numbers.
const FALLBACK_PLAN_PRICES = {
  essential: {
    monthlyPrice: 39.9,
    annualPrice: 399,
    annualMonthlyEquivalent: 33.25,
    annualSavings: 79.8,
  },
  pro: {
    monthlyPrice: 69.9,
    annualPrice: 699,
    annualMonthlyEquivalent: 58.25,
    annualSavings: 139.8,
  },
} as const;

type TierAmounts = {
  monthlyPrice: number;
  annualPrice: number;
  annualMonthlyEquivalent: number;
  annualSavings: number;
};

// Live Stripe values when configured, otherwise FALLBACK_PLAN_PRICES — same "never
// hardcode, Stripe is the source of truth" reasoning as adhera's own src/lib/stripe.ts.
function tierAmounts(tier: PlanTier, pricing: AdheraPricingInfo | null | undefined): TierAmounts {
  const live = pricing?.[tier];
  if (!live) return FALLBACK_PLAN_PRICES[tier];

  const monthlyPrice = live.monthlyAmountCents / 100;
  const annualPrice = live.yearlyAmountCents / 100;
  return {
    monthlyPrice,
    annualPrice,
    annualMonthlyEquivalent: Math.round((annualPrice / 12) * 100) / 100,
    annualSavings: Math.round((monthlyPrice * 12 - annualPrice) * 100) / 100,
  };
}

function formatEuro(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function PricingSection({
  pricing,
  trialDays,
}: {
  pricing?: AdheraPricingInfo | null;
  trialDays: number;
}) {
  const t = useTranslations("Pricing.associations");
  const [period, setPeriod] = useState<BillingPeriod>("annual");

  const titleRef = useRef<HTMLDivElement>(null);
  const cardsWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    const cards = cardsWrapRef.current?.querySelectorAll("[data-pricing-card]");
    cards?.forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: i * 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );
    });
  }, []);

  const freeTrialHref = "/register/free-trial";
  const customHref = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : "/contact";
  const ctaTrial = t("ctaTrial", { days: trialDays });

  const plans: PricingPlan[] = [
    {
      id: "essential",
      name: t("plans.essential.name"),
      description: t("plans.essential.description"),
      ...tierAmounts("essential", pricing),
      features: t.raw("plans.essential.features") as string[],
      ctaLabel: ctaTrial,
      ctaHref: freeTrialHref,
    },
    {
      id: "pro",
      name: t("plans.pro.name"),
      description: t("plans.pro.description"),
      ...tierAmounts("pro", pricing),
      features: t.raw("plans.pro.features") as string[],
      highlighted: true,
      badge: t("plans.pro.badge"),
      ctaLabel: ctaTrial,
      ctaHref: freeTrialHref,
    },
    {
      id: "custom",
      name: t("plans.custom.name"),
      description: t("plans.custom.description"),
      quotePrice: t("plans.custom.price"),
      features: t.raw("plans.custom.features") as string[],
      ctaLabel: t("ctaQuote"),
      ctaHref: customHref,
      ctaExternal: Boolean(WHATSAPP_NUMBER),
    },
  ];

  const cardLabels = {
    perMonth: t("perMonth"),
    perYear: t("perYear"),
    monthlyBillingNote: t("monthlyBillingNote"),
    annualEquivalent: (amount: string) => t("annualEquivalent", { amount }),
    annualBilled: (amount: string) => t("annualBilled", { amount }),
    annualSavings: (amount: string) => t("annualSavings", { amount }),
  };

  return (
    <section
      id="pricing"
      className="relative isolate scroll-mt-24 bg-white px-6 py-24 sm:py-32 lg:px-8"
    >
      {/* Header */}
      <div ref={titleRef} className="mx-auto max-w-4xl text-center">
        <h2 className="text-base/7 font-semibold text-[#2563EB]">{t("section")}</h2>
        <p className="mt-2 text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
          {t("title")}
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg font-medium text-gray-600 sm:text-xl/8">
          {t("subtitle")}
        </p>
      </div>

      {/* Billing selector */}
      <div className="mx-auto mt-10 max-w-md px-2">
        <BillingSelector
          value={period}
          onChange={setPeriod}
          label={t("billing.label")}
          monthlyLabel={t("billing.monthly")}
          annualLabel={t("billing.annual")}
          annualBadge={t("billing.annualBadge")}
        />
      </div>

      {/* Pricing cards */}
      <div
        ref={cardsWrapRef}
        className="mx-auto mt-12 grid max-w-6xl grid-cols-1 items-stretch gap-8 sm:mt-14 md:grid-cols-2 lg:grid-cols-3"
      >
        {plans.map((plan) => (
          <div key={plan.id} data-pricing-card className="h-full">
            <PricingCard
              plan={plan}
              period={period}
              formatPrice={formatEuro}
              labels={cardLabels}
            />
          </div>
        ))}
      </div>

      {/* ROI / reassurance block */}
      <div className="mx-auto mt-16 max-w-3xl">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-gray-900">{t("roi.title")}</h3>
          <p className="mt-3 text-sm/6 text-gray-600">{t("roi.description")}</p>
          <p className="mt-4 text-xs text-gray-400">{t("roi.disclaimer")}</p>
        </div>
      </div>
    </section>
  );
}
