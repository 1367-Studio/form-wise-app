"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { AsteriskIcon, CaretDown, ChatCircle } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useAudience } from "@/contexts/AudienceContext";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

const FAQ_KEYS = [
  "pricing",
  "trial",
  "dataSecurity",
  "multiSchool",
  "mobile",
  "support",
] as const;

export default function FAQSection({ trialDays }: { trialDays: number }) {
  const { audience } = useAudience();
  const t = useTranslations(`FAQ.${audience}`);

  // Render a two-word title (e.g. "Questions fréquentes") on two lines to match
  // the editorial reference; longer titles wrap naturally within the column.
  const titleWords = t("title").split(" ");

  return (
    <section data-header-dark className="bg-black py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          {/* Left column — brand mark, title, support link */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <AsteriskIcon
              aria-hidden="true"
              weight="bold"
              className="h-14 w-14 text-gray-300 sm:h-20 sm:w-20"
            />

            <h2 className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
              {titleWords.length === 2 ? (
                <>
                  <span className="block">{titleWords[0]}</span>
                  <span className="block">{titleWords[1]}</span>
                </>
              ) : (
                t("title")
              )}
            </h2>

            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
              <span className="text-sm text-gray-400">{t("supportText")}</span>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/10 hover:text-white"
              >
                <Link href="/contact">
                  <ChatCircle aria-hidden="true" className="h-4 w-4" />
                  {t("supportLink")}
                </Link>
              </Button>
            </div>
          </div>

          {/* Right column — accordion */}
          <AccordionPrimitive.Root
            type="single"
            collapsible
            defaultValue="pricing"
            className="flex flex-col"
          >
            {FAQ_KEYS.map((key) => (
              <AccordionPrimitive.Item
                key={key}
                value={key}
                className="group border-b border-white/[0.07] last:border-b-0"
              >
                <AccordionPrimitive.Header>
                  <AccordionPrimitive.Trigger className="flex w-full items-start gap-3 rounded-2xl px-4 py-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:gap-4 sm:px-5">
                    <CaretDown
                      aria-hidden="true"
                      weight="bold"
                      className="mt-0.5 h-5 w-5 shrink-0 text-gray-500 transition-all duration-300 ease-out group-hover:text-gray-300 group-data-[state=open]:rotate-180 group-data-[state=open]:text-white"
                    />
                    <span className="text-base font-semibold text-gray-400 transition-colors group-hover:text-gray-200 group-data-[state=open]:text-white sm:text-lg">
                      {t(`${key}Question`)}
                    </span>
                  </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>

                <AccordionPrimitive.Content className="overflow-hidden motion-safe:data-[state=closed]:animate-accordion-up motion-safe:data-[state=open]:animate-accordion-down">
                  <div className="px-4 pb-5 sm:px-5">
                    <p className="max-w-prose pl-8 text-sm leading-relaxed text-gray-300 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300 sm:pl-9 sm:text-[0.95rem]">
                      {t(`${key}Answer`, { days: trialDays })}
                    </p>
                  </div>
                </AccordionPrimitive.Content>
              </AccordionPrimitive.Item>
            ))}
          </AccordionPrimitive.Root>
        </div>
      </div>
    </section>
  );
}
