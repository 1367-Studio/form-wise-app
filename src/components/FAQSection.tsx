"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const FAQ_KEYS = [
  "pricing",
  "trial",
  "dataSecurity",
  "multiSchool",
  "mobile",
  "support",
] as const;

export default function FAQSection() {
  const t = useTranslations("FAQ");

  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#2563EB]">
            {t("section")}
          </h2>
          <p className="mt-2 text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            {t("title")}
          </p>
          <p className="mt-6 text-lg text-gray-600">{t("subtitle")}</p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {FAQ_KEYS.map((key) => (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger className="text-base font-medium text-gray-900">
                  {t(`${key}Question`)}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-gray-600">
                  {t(`${key}Answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
