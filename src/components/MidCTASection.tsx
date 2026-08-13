"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useAudience } from "@/contexts/AudienceContext";

export default function MidCTASection({
  variant,
  trialDays,
  showDemo = false,
}: {
  variant: "afterFeatures" | "beforePricing";
  trialDays: number;
  showDemo?: boolean;
}) {
  const { audience } = useAudience();
  const t = useTranslations(`MidCTA.${audience}`);

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          {t(`${variant}Title`)}
        </h2>

        <div className="mt-8 flex flex-col items-center gap-4">
          <Link href="/register/free-trial">
            <Button className="cursor-pointer h-12 w-full rounded-full bg-[#003EA3] px-8 text-base font-semibold text-white hover:bg-[#002E7A] sm:w-auto">
              {t("button")}
            </Button>
          </Link>
          <p className="text-sm text-gray-500">
            {t("reassurance", { days: trialDays })}
          </p>

          {showDemo && (
            <p className="text-sm text-gray-500">
              {t("demoText")}{" "}
              <Link
                href="https://calendly.com/hello1367studio/30min"
                target="_blank"
                className="font-medium text-[#003EA3] underline underline-offset-4 hover:text-[#002E7A]"
              >
                {t("demoLink")}
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
