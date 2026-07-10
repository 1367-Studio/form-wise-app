import { Check } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { BillingPeriod } from "./BillingSelector";

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  /** Amounts in euros. Absent for the quote-only plan. */
  monthlyPrice?: number;
  annualPrice?: number;
  /** Pre-computed annual figures to avoid float rounding in the UI. */
  annualMonthlyEquivalent?: number;
  annualSavings?: number;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  /** Fixed, period-independent price label (e.g. "Sur devis"). */
  quotePrice?: string;
  ctaLabel: string;
  ctaHref: string;
  ctaExternal?: boolean;
}

interface PricingCardProps {
  plan: PricingPlan;
  period: BillingPeriod;
  formatPrice: (value: number) => string;
  labels: {
    perMonth: string;
    perYear: string;
    monthlyBillingNote: string;
    annualEquivalent: (amount: string) => string;
    annualBilled: (amount: string) => string;
    annualSavings: (amount: string) => string;
  };
}

export default function PricingCard({
  plan,
  period,
  formatPrice,
  labels,
}: PricingCardProps) {
  const isQuote = plan.quotePrice !== undefined;
  const isAnnual = period === "annual";

  const priceValue = isQuote
    ? undefined
    : isAnnual
      ? plan.annualPrice
      : plan.monthlyPrice;

  const mainPrice = isQuote ? plan.quotePrice! : formatPrice(priceValue ?? 0);
  const periodSuffix = isQuote ? null : isAnnual ? labels.perYear : labels.perMonth;

  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-2xl bg-white p-8",
        plan.highlighted
          ? "border-2 border-[#2563EB] shadow-lg shadow-[#2563EB]/5"
          : "border border-gray-200"
      )}
    >
      {plan.highlighted && plan.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#2563EB] px-3 py-1 text-xs font-medium text-white">
          {plan.badge}
        </span>
      )}

      <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>

      {/* Price block — min-height reserved so switching period causes no layout shift */}
      <div className="mt-4 min-h-[6.5rem]">
        <div
          key={period}
          className="animate-in fade-in slide-in-from-bottom-1 duration-300"
        >
          <div className="flex items-baseline gap-x-2">
            <span className="text-5xl font-bold tracking-tight text-gray-900">
              {mainPrice}
            </span>
            {periodSuffix && (
              <span className="text-base text-gray-500">{periodSuffix}</span>
            )}
          </div>

          {!isQuote && isAnnual && (
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-500">
                {labels.annualEquivalent(
                  formatPrice(plan.annualMonthlyEquivalent ?? 0)
                )}
              </p>
              <p className="text-xs text-gray-400">
                {labels.annualBilled(formatPrice(plan.annualPrice ?? 0))}
              </p>
              <p className="text-xs font-medium text-green-600">
                {labels.annualSavings(formatPrice(plan.annualSavings ?? 0))}
              </p>
            </div>
          )}

          {!isQuote && !isAnnual && (
            <p className="mt-2 text-sm text-gray-500">
              {labels.monthlyBillingNote}
            </p>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-500">{plan.description}</p>

      <div className="my-6 border-t border-gray-100" />

      <ul role="list" className="flex-1 space-y-3 text-sm">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-x-3">
            <Check
              aria-hidden="true"
              className="h-5 w-5 flex-none text-[#2563EB]"
            />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Button
          asChild
          variant={plan.highlighted ? "default" : "outline"}
          size="lg"
          className={cn(
            "w-full",
            plan.highlighted
              ? "bg-[#2563EB] hover:bg-[#1D4ED8]"
              : "border-gray-300 text-gray-700 hover:border-[#2563EB] hover:text-[#2563EB]"
          )}
        >
          {plan.ctaExternal ? (
            <a href={plan.ctaHref} target="_blank" rel="noopener noreferrer">
              {plan.ctaLabel}
            </a>
          ) : (
            <Link href={plan.ctaHref}>{plan.ctaLabel}</Link>
          )}
        </Button>
      </div>
    </div>
  );
}
