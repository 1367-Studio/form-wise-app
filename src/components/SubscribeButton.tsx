"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTranslations } from "next-intl";

export function SubscribeButton() {
  const t = useTranslations("SubscribeButton");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");

  const handleCheckout = async () => {
    setLoading(true);

    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      body: JSON.stringify({ plan }),
    });

    if (!res.ok) {
      console.error("Stripe session error");
      setLoading(false);
      return;
    }

    const data = await res.json();
    window.location.href = data.url;
  };

  return (
    <div className="space-y-4">
      <RadioGroup
        value={plan}
        onValueChange={(value) => setPlan(value as "monthly" | "yearly")}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="monthly" id="monthly" />
          <Label htmlFor="monthly">{t("monthlyOption")}</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yearly" id="yearly" />
          <Label htmlFor="yearly">{t("yearlyOption")}</Label>
        </div>
      </RadioGroup>

      <Button
        className="cursor-pointer"
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading ? t("redirecting") : t("subscribe")}
      </Button>
    </div>
  );
}
