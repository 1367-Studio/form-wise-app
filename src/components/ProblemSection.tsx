"use client";

import { Clock, Files, BatteryLow, Sparkle } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useAudience } from "@/contexts/AudienceContext";

const painIcons = [Clock, Files, BatteryLow];

export default function ProblemSection() {
  const { audience } = useAudience();
  const t = useTranslations(`Problem.${audience}`);

  const pains = painIcons.map((icon, i) => ({
    title: t(`pain${i + 1}Title` as Parameters<typeof t>[0]),
    text: t(`pain${i + 1}Text` as Parameters<typeof t>[0]),
    icon,
  }));

  return (
    // pt-40 clears the hero preview card overlapping 100px into this section.
    <section className="bg-white pt-40 pb-20 sm:pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-[#003EA3]">
            {t("section")}
          </h2>
          <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl lg:text-balance">
            {t("title")}
          </p>
          <p className="mt-6 text-lg/8 text-gray-600">{t("subtitle")}</p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
          {pains.map(({ title, text, icon: Icon }) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-200 bg-white p-6"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-[#003EA3]/10">
                <Icon aria-hidden="true" className="size-6 text-[#003EA3]" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900">
                {title}
              </h3>
              <p className="mt-2 text-sm/6 text-gray-600">{text}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-gray-200 bg-gray-50 p-8">
          <h3 className="text-base font-semibold text-gray-900">
            {t("whyTitle")}
          </h3>
          <p className="mt-2 text-base/7 text-gray-600">{t("whyText")}</p>

          <div className="mt-8 flex items-start gap-3 border-t border-gray-200 pt-6">
            <Sparkle
              aria-hidden="true"
              weight="fill"
              className="mt-1 h-5 w-5 shrink-0 text-[#003EA3]"
            />
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {t("idealTitle")}
              </h3>
              <p className="mt-2 text-base/7 text-gray-600">{t("idealText")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
