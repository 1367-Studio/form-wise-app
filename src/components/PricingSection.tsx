"use client";

import { useEffect, useRef } from "react";
import { Check, Minus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const WHATSAPP_NUMBER = ""; // fill in your number e.g. "33612345678"

interface Tier {
  id: string;
  href: string;
  name: string;
  price: string;
  period?: string;
  note?: string;
  description: string;
  features: string[];
  featured: boolean;
  cta: string;
  isWhatsApp?: boolean;
}

interface ComparisonFeature {
  label: string;
  monthly: boolean;
  annual: boolean;
  custom: boolean;
}

export default function PricingSection() {
  const t = useTranslations("Pricing");
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 1, ease: "power2.out",
          scrollTrigger: { trigger: titleRef.current, start: "top 90%", toggleActions: "play none none none" },
        }
      );
    }

    cardsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, delay: i * 0.15, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
        }
      );
    });
  }, []);

  const tiers: Tier[] = [
    {
      id: "tier-monthly",
      href: "/register/free-trial",
      name: t("monthlyName"),
      price: t("monthlyPrice"),
      period: t("monthlyCycle"),
      description: t("monthlyDescription"),
      features: [t("monthlyFeature1"), t("monthlyFeature2"), t("monthlyFeature3"), t("monthlyFeature4"), t("monthlyFeature5")],
      featured: false,
      cta: t("ctaTrial"),
    },
    {
      id: "tier-annual",
      href: "/register/free-trial",
      name: t("annualName"),
      price: t("annualPrice"),
      period: t("annualCycle"),
      note: t("annualNote"),
      description: t("annualDescription"),
      features: [t("annualFeature1"), t("annualFeature2"), t("annualFeature3"), t("annualFeature4"), t("annualFeature5")],
      featured: true,
      cta: t("ctaTrial"),
    },
    {
      id: "tier-custom",
      href: WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : "/contact",
      name: t("customName"),
      price: t("customPrice"),
      description: t("customDescription"),
      features: [t("customFeature1"), t("customFeature2"), t("customFeature3"), t("customFeature4"), t("customFeature5")],
      featured: false,
      cta: t("ctaContact"),
      isWhatsApp: true,
    },
  ];

  const comparisonFeatures: ComparisonFeature[] = [
    { label: t("compareStudents"),        monthly: true,  annual: true,  custom: true },
    { label: t("compareDashboards"),      monthly: true,  annual: true,  custom: true },
    { label: t("compareNotifications"),   monthly: true,  annual: true,  custom: true },
    { label: t("comparePaymentTracking"), monthly: true,  annual: true,  custom: true },
    { label: t("comparePrioritySupport"), monthly: false, annual: true,  custom: true },
    { label: t("compareEarlyAccess"),     monthly: false, annual: true,  custom: true },
    { label: t("compareAI"),              monthly: false, annual: false, custom: true },
    { label: t("compareWhatsApp"),        monthly: false, annual: false, custom: true },
    { label: t("compareDedicatedSupport"),monthly: false, annual: false, custom: true },
    { label: t("compareDataExport"),      monthly: true,  annual: true,  custom: true },
  ];

  return (
    <section className="relative isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
      {/* Header */}
      <div ref={titleRef} className="mx-auto max-w-4xl text-center">
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

      {/* Pricing cards */}
      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 items-start gap-8 sm:mt-20 md:grid-cols-2 lg:grid-cols-3">
        {tiers.map((tier, index) => (
          <div
            key={tier.id}
            ref={(el) => { cardsRef.current[index] = el; }}
            className={`relative rounded-2xl bg-white p-8 ${
              tier.featured
                ? "border-2 border-[#2563EB]"
                : "border border-gray-200"
            }`}
          >
            {tier.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#2563EB] px-3 py-1 text-xs font-medium text-white">
                {t("mostPopular")}
              </span>
            )}

            <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>

            <div className="mt-4 flex items-baseline gap-x-2">
              <span className="text-5xl font-bold tracking-tight text-gray-900">
                {tier.price}
              </span>
              {tier.period && (
                <span className="text-base text-gray-500">/{tier.period}</span>
              )}
            </div>

            {tier.note && (
              <p className="mt-1 text-xs font-medium text-green-600">{tier.note}</p>
            )}

            <p className="mt-4 text-sm text-gray-500">{tier.description}</p>

            <div className="my-6 border-t border-gray-100" />

            <ul role="list" className="space-y-3 text-sm">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-x-3">
                  <Check aria-hidden="true" className="h-5 w-5 flex-none text-[#2563EB]" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {tier.isWhatsApp ? (
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:border-[#2563EB] hover:text-[#2563EB]"
                  size="lg"
                >
                  <a href={tier.href} target="_blank" rel="noopener noreferrer">
                    {tier.cta}
                  </a>
                </Button>
              ) : (
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
              )}
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
                  {t("monthlyName")}
                </th>
                <th className="pb-4 text-center font-semibold text-[#2563EB]">
                  {t("annualName")}
                </th>
                <th className="pb-4 text-center font-semibold text-gray-900">
                  {t("customName")}
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
                    {feature.monthly ? (
                      <Check aria-hidden="true" className="mx-auto h-5 w-5 text-[#2563EB]" />
                    ) : (
                      <Minus aria-hidden="true" className="mx-auto h-5 w-5 text-gray-300" />
                    )}
                  </td>
                  <td className="py-3 text-center">
                    {feature.annual ? (
                      <Check aria-hidden="true" className="mx-auto h-5 w-5 text-[#2563EB]" />
                    ) : (
                      <Minus aria-hidden="true" className="mx-auto h-5 w-5 text-gray-300" />
                    )}
                  </td>
                  <td className="py-3 text-center">
                    {feature.custom ? (
                      <Check aria-hidden="true" className="mx-auto h-5 w-5 text-[#2563EB]" />
                    ) : (
                      <Minus aria-hidden="true" className="mx-auto h-5 w-5 text-gray-300" />
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
