"use client";

import { Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type BillingPeriod = "monthly" | "annual";

interface BillingSelectorProps {
  value: BillingPeriod;
  onChange: (period: BillingPeriod) => void;
  label: string;
  monthlyLabel: string;
  annualLabel: string;
  annualBadge: string;
}

/**
 * Accessible segmented control for the billing period.
 * Uses real <button>s with aria-pressed so state is exposed to assistive tech,
 * and communicates selection through weight + a check icon + elevation, not
 * colour alone.
 */
export default function BillingSelector({
  value,
  onChange,
  label,
  monthlyLabel,
  annualLabel,
  annualBadge,
}: BillingSelectorProps) {
  const optionBase =
    "flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100";
  const selected = "bg-white text-gray-900 shadow-sm font-semibold";
  const unselected = "text-gray-500 hover:text-gray-900";

  return (
    <div
      role="group"
      aria-label={label}
      className="mx-auto flex w-full max-w-md items-center gap-1 rounded-full border border-gray-200 bg-gray-100 p-1"
    >
      <button
        type="button"
        aria-pressed={value === "monthly"}
        onClick={() => onChange("monthly")}
        className={cn(optionBase, "flex-1", value === "monthly" ? selected : unselected)}
      >
        {value === "monthly" && (
          <Check aria-hidden="true" weight="bold" className="h-4 w-4 flex-none" />
        )}
        {monthlyLabel}
      </button>

      <button
        type="button"
        aria-pressed={value === "annual"}
        onClick={() => onChange("annual")}
        className={cn(optionBase, "flex-1", value === "annual" ? selected : unselected)}
      >
        {value === "annual" && (
          <Check aria-hidden="true" weight="bold" className="h-4 w-4 flex-none" />
        )}
        <span>{annualLabel}</span>
        <span
          className={cn(
            "whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold",
            value === "annual"
              ? "bg-[#2563EB]/10 text-[#2563EB]"
              : "bg-gray-200 text-gray-600"
          )}
        >
          {annualBadge}
        </span>
      </button>
    </div>
  );
}
