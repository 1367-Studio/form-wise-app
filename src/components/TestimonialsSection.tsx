"use client";

import { Star, Quotes } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useAudience } from "@/contexts/AudienceContext";

export default function TestimonialsSection() {
  const { audience } = useAudience();
  const t = useTranslations(`Testimonials.${audience}`);

  const testimonials = [
    {
      quote: t("directorQuote"),
      name: t("directorName"),
      role: t("directorRole"),
      initials: t("directorInitials"),
    },
    {
      quote: t("parentQuote"),
      name: t("parentName"),
      role: t("parentRole"),
      initials: t("parentInitials"),
    },
    {
      quote: t("teacherQuote"),
      name: t("teacherName"),
      role: t("teacherRole"),
      initials: t("teacherInitials"),
    },
  ];

  return (
    <section className="paper-bg py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base/7 font-semibold text-brand">
            {t("section")}
          </h2>
          <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-balance">
            {t("title")}
          </p>
          <p className="mt-6 text-lg/8 text-ink/80">{t("subtitle")}</p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:mt-20 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <Quotes
                    weight="fill"
                    aria-hidden="true"
                    className="h-6 w-6 text-brand/20"
                  />
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        weight="fill"
                        aria-hidden="true"
                        className="h-4 w-4 text-yellow-400"
                      />
                    ))}
                  </div>
                </div>
                <blockquote className="text-sm italic leading-relaxed text-ink/85">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
              </div>

              <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F172A] text-sm font-semibold text-white">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-ink/60">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
