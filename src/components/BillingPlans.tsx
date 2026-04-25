"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Gift } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type StripePrice = {
  id: string;
  name: string;
  amount: string;
  interval: "month" | "year";
  description: string;
};

export default function BillingPlans() {
  const t = useTranslations("BillingPlans");
  const [prices, setPrices] = useState<StripePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [redirectingPlan, setRedirectingPlan] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      const res = await fetch("/api/stripe/stripe-prices");
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setPrices(json.data);
      } else {
        console.error("Stripe prices fetch error");
      }

      setLoading(false);
    };

    fetchPrices();
  }, []);

  const handleCheckout = async (plan: "monthly" | "yearly") => {
    setRedirectingPlan(plan);

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) {
        console.error("Checkout session error:", res.status);
        setRedirectingPlan(null);
        return;
      }

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No URL in response:", data);
        setRedirectingPlan(null);
      }
    } catch (error) {
      console.error("Checkout request error:", error);
      setRedirectingPlan(null);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">{t("loading")}</div>;
  }

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl sm:text-center">
          <h2 className="text-base font-semibold text-blue-900">
            {t("section")}
          </h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            {t("title")}
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-gray-600 sm:text-center">
          {t("subtitle")}
        </p>

        <div className="mt-20 flow-root">
          <div className="isolate -mt-16 grid max-w-sm grid-cols-1 gap-y-16 divide-y divide-gray-100 sm:mx-auto lg:-mx-8 lg:mt-0 lg:max-w-none lg:grid-cols-2 lg:divide-x lg:divide-y-0 xl:-mx-4">
            {prices.map((tier) => (
              <div key={tier.id} className="pt-16 lg:px-8 lg:pt-0 xl:px-14">
                <h3
                  id={tier.id}
                  className="text-base font-semibold text-gray-900"
                >
                  {tier.name}
                </h3>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-5xl font-semibold tracking-tight text-gray-900">
                    {tier.amount}
                  </span>
                  <span className="text-sm font-semibold flex items-center gap-2 text-gray-600">
                    /{tier.interval === "year" ? t("perYear") : t("perMonth")}
                    {tier.interval === "year" && (
                      <Gift className="w-4 h-4 text-gray-600" />
                    )}
                  </span>
                </p>
                <p className="mt-3 text-sm text-gray-500">{tier.description}</p>
                <button
                  onClick={() =>
                    handleCheckout(
                      tier.interval === "year" ? "yearly" : "monthly"
                    )
                  }
                  disabled={redirectingPlan !== null}
                  className="mt-10 w-full rounded-md bg-blue-900 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {redirectingPlan ===
                  (tier.interval === "year" ? "yearly" : "monthly")
                    ? t("ctaRedirecting")
                    : t("ctaChoose")}
                </button>
                <ul
                  role="list"
                  className="mt-6 space-y-3 text-sm text-gray-600"
                >
                  <li className="flex gap-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-900" />{" "}
                    {t("featureMultiUser")}
                  </li>
                  <li className="flex gap-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-900" />{" "}
                    {t("featureAll")}
                  </li>
                  <li className="flex gap-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-900" />{" "}
                    {tier.interval === "year"
                      ? t("featureSupport24")
                      : t("featureSupport48")}
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-16 flex justify-center">
        <Link
          href="/dashboard/director"
          className="inline-flex items-center gap-2 rounded-md bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
        >
          {t("backToDashboard")}
        </Link>
      </div>
    </div>
  );
}
