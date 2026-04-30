"use client";

import { useTranslations } from "next-intl";

export default function HowItWorksSection() {
  const t = useTranslations("HowItWorks");

  const steps = [
    { number: "1", title: t("step1Title"), description: t("step1Description") },
    { number: "2", title: t("step2Title"), description: t("step2Description") },
    { number: "3", title: t("step3Title"), description: t("step3Description") },
  ];

  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#2563EB]">
            {t("section")}
          </h2>
          <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            {t("title")}
          </p>
          <p className="mt-6 text-lg text-gray-600">{t("subtitle")}</p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl sm:mt-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-0">
            {steps.map((step, index) => (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {index < steps.length - 1 && (
                  <div
                    className="absolute left-[calc(50%+24px)] top-6 hidden h-px w-[calc(100%-48px)] bg-gray-200 md:block"
                    aria-hidden="true"
                  />
                )}

                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF] text-lg font-bold text-[#2563EB]">
                  {step.number}
                </div>

                <div className="mt-6 max-w-xs">
                  <h3 className="text-base font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
