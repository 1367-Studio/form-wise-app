"use client";

import { useTranslations } from "next-intl";

export default function StatsSection() {
  const t = useTranslations("Stats");

  const stats = [
    { value: "120+", label: t("schoolsLabel") },
    { value: "15 000+", label: t("studentsLabel") },
    { value: "98%", label: t("satisfactionLabel") },
    { value: "24h", label: t("supportLabel") },
  ];

  return (
    <section className="bg-[#0F172A] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="relative flex flex-col items-center gap-y-2 border-l border-white/10 pl-6 first:border-l-0 first:pl-0 lg:border-l lg:first:border-l-0"
              >
                <p className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
