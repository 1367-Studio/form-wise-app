"use client";

import { useState } from "react";
import { Check, Minus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type BillingCycle = "monthly" | "annual";

interface Tier {
  id: string;
  href: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  featured: boolean;
  cta: string;
}

interface ComparisonFeature {
  label: string;
  trial: boolean;
  monthly: boolean;
  annual: boolean;
}

export default function PricingSection() {
  const t = useTranslations("Pricing");
  const [billing, setBilling] = useState<BillingCycle>("annual");

  const tiers: Tier[] = [
    {
      id: "tier-freemium",
      href: "/register/free-trial",
      name: t("trialName"),
      price: t("trialPrice"),
      period: t("trialCycle"),
      description: t("trialDescription"),
      features: [
        t("trialFeature1"),
        t("trialFeature2"),
        t("trialFeature3"),
        t("trialFeature4"),
        t("trialFeature5"),
      ],
      featured: false,
      cta: t("ctaTrial"),
    },
    {
      id: "tier-annuel",
      href: "/contact",
      name: t("annualName"),
      price: billing === "annual" ? t("annualPrice") : t("monthlyPrice"),
      period: billing === "annual" ? t("annualCycle") : t("monthlyCycle"),
      description: t("annualDescription"),
      features: [
        t("annualFeature1"),
        t("annualFeature2"),
        t("annualFeature3"),
        t("annualFeature4"),
        t("annualFeature5"),
      ],
      featured: true,
      cta: t("ctaTrial"),
    },
    {
      id: "tier-mensuel",
      href: "/contact",
      name: t("monthlyName"),
      price: t("monthlyPrice"),
      period: t("monthlyCycle"),
      description: t("monthlyDescription"),
      features: [
        t("monthlyFeature1"),
        t("monthlyFeature2"),
        t("monthlyFeature3"),
        t("monthlyFeature4"),
        t("monthlyFeature5"),
      ],
      featured: false,
      cta: t("ctaTrial"),
    },
  ];

  const comparisonFeatures: ComparisonFeature[] = [
    { label: t("compareStudents"), trial: true, monthly: true, annual: true },
    { label: t("compareDashboards"), trial: true, monthly: true, annual: true },
    {
      label: t("compareNotifications"),
      trial: true,
      monthly: true,
      annual: true,
    },
    {
      label: t("comparePaymentTracking"),
      trial: false,
      monthly: true,
      annual: true,
    },
    {
      label: t("comparePrioritySupport"),
      trial: false,
      monthly: false,
      annual: true,
    },
    {
      label: t("compareOnlineTraining"),
      trial: false,
      monthly: false,
      annual: true,
    },
    {
      label: t("compareGdprCertificate"),
      trial: false,
      monthly: false,
      annual: true,
    },
    {
      label: t("compareCustomBranding"),
      trial: false,
      monthly: false,
      annual: true,
    },
    {
      label: t("compareDedicatedManager"),
      trial: false,
      monthly: false,
      annual: true,
    },
    {
      label: t("compareDataExport"),
      trial: false,
      monthly: true,
      annual: true,
    },
  ];

  return (
    <section className="relative isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-base/7 font-semibold text-[#2563EB]">
          {t("section")}
        </h2>
        <p className="mt-2 text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
          {t("title")}
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg font-medium text-gray-600 sm:text-xl/8">
          {t("subtitle")}
        </p>
      </div>

      {/* Billing toggle */}
      <div className="mt-12 flex items-center justify-center gap-3">
        <div className="inline-flex items-center rounded-full bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              billing === "monthly"
                ? "bg-[#0F172A] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t("toggleMonthly")}
          </button>
          <button
            type="button"
            onClick={() => setBilling("annual")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              billing === "annual"
                ? "bg-[#0F172A] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t("toggleAnnual")}
          </button>
        </div>
        <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
          {t("savePercent")}
        </span>
      </div>

      {/* Pricing cards */}
      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 items-start gap-8 sm:mt-20 md:grid-cols-2 lg:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`relative rounded-2xl bg-white p-8 ${
              tier.featured
                ? "border-2 border-[#2563EB]"
                : "border border-gray-200"
            }`}
          >
            {/* Most popular badge */}
            {tier.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#2563EB] px-3 py-1 text-xs font-medium text-white">
                {t("mostPopular")}
              </span>
            )}

            {/* Plan name */}
            <h3 className="text-lg font-semibold text-gray-900">
              {tier.name}
            </h3>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-x-2">
              <span className="text-5xl font-bold tracking-tight text-gray-900">
                {tier.price}
              </span>
              <span className="text-base text-gray-500">/{tier.period}</span>
            </div>

            {/* Description */}
            <p className="mt-4 text-sm text-gray-500">{tier.description}</p>

            {/* Divider */}
            <div className="my-6 border-t border-gray-100" />

            {/* Feature list */}
            <ul role="list" className="space-y-3 text-sm">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-x-3">
                  <Check
                    aria-hidden="true"
                    className="h-5 w-5 flex-none text-[#2563EB]"
                  />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-8">
              <Button
                asChild
                variant={tier.featured ? "default" : "outline"}
                className={`w-full ${
                  tier.featured
                    ? "bg-[#2563EB] hover:bg-[#1D4ED8]"
                    : "border-gray-300 text-gray-700 hover:border-[#2563EB] hover:text-[#2563EB]"
                }`}
                size="lg"
              >
                <Link href={tier.href}>{tier.cta}</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="mx-auto mt-24 max-w-5xl">
        <h3 className="mb-8 text-center text-2xl font-semibold text-gray-900">
          {t("comparisonTitle")}
        </h3>
        <div className="-mx-6 overflow-x-auto px-6">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-4 pr-6 font-medium text-gray-500">
                  {t("compareFeatureHeader")}
                </th>
                <th className="pb-4 text-center font-semibold text-gray-900">
                  {t("trialName")}
                </th>
                <th className="pb-4 text-center font-semibold text-gray-900">
                  {t("monthlyName")}
                </th>
                <th className="pb-4 text-center font-semibold text-[#2563EB]">
                  {t("annualName")}
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((feature, idx) => (
                <tr
                  key={feature.label}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="py-3 pr-6 text-gray-700">{feature.label}</td>
                  <td className="py-3 text-center">
                    {feature.trial ? (
                      <Check
                        aria-hidden="true"
                        className="mx-auto h-5 w-5 text-[#2563EB]"
                      />
                    ) : (
                      <Minus
                        aria-hidden="true"
                        className="mx-auto h-5 w-5 text-gray-300"
                      />
                    )}
                  </td>
                  <td className="py-3 text-center">
                    {feature.monthly ? (
                      <Check
                        aria-hidden="true"
                        className="mx-auto h-5 w-5 text-[#2563EB]"
                      />
                    ) : (
                      <Minus
                        aria-hidden="true"
                        className="mx-auto h-5 w-5 text-gray-300"
                      />
                    )}
                  </td>
                  <td className="py-3 text-center">
                    {feature.annual ? (
                      <Check
                        aria-hidden="true"
                        className="mx-auto h-5 w-5 text-[#2563EB]"
                      />
                    ) : (
                      <Minus
                        aria-hidden="true"
                        className="mx-auto h-5 w-5 text-gray-300"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
