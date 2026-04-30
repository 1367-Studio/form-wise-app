"use client";

import { useTranslations } from "next-intl";

export default function LogoCloudSection() {
  const t = useTranslations("LogoCloud");

  const metrics = [
    { value: t("metric1Value"), label: t("metric1Label") },
    { value: t("metric2Value"), label: t("metric2Label") },
    { value: t("metric3Value"), label: t("metric3Label") },
  ];

  return (
    <section className="border-b border-gray-200 bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
            {t("kicker")}
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="flex flex-col items-center gap-1 rounded-2xl bg-white px-8 py-8 ring-1 ring-gray-900/5"
            >
              <span className="text-4xl font-bold tracking-tight text-[#0F172A]">
                {metric.value}
              </span>
              <span className="text-sm text-gray-500">{metric.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
