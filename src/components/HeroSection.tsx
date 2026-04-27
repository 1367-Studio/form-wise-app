"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import TabsShowcase from "./TabsShowcase";
import { Zap, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function HeroSection() {
  const t = useTranslations("Hero");
  const titleRef = useRef(null);
  const paragraphRef = useRef(null);
  const buttonsRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1 }
    )
      .fromTo(
        paragraphRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.6"
      )
      .fromTo(
        buttonsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.5"
      );
  }, []);

  return (
    <section
      className="paper-bg relative isolate pt-14"
      aria-label={t("introAriaLabel")}
    >
      <div className="py-24 sm:py-32 lg:pb-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto text-center">
            <h1
              ref={titleRef}
              className="fancy-gradient-text text-balance text-5xl sm:text-7xl leading-[57px] sm:leading-[83px] font-semibold tracking-tight text-gray-900"
            >
              {t("titlePrefix")}{" "}
              <span className="fancy-gradient-span">
                {t("titleHighlight")}
              </span>
            </h1>
            <p
              ref={paragraphRef}
              className="fancy-gradient-text mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8"
            >
              {t("subtitle")}
            </p>
            <div className="mt-6 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f84a00]/20 bg-[#fef1ea] px-3 py-1 text-xs font-medium text-[#7a2700]">
                <Smartphone className="h-3 w-3" />
                {t("mobileBadge")}
              </span>
            </div>
            <div
              ref={buttonsRef}
              className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-x-6"
            >
              <Link href="/register/free-trial">
                <Button className="cursor-pointer w-full sm:w-auto">
                  <Zap className="mr-2 h-4 w-4" />
                  {t("ctaTrial")}
                </Button>
              </Link>
              <Link
                href="https://calendly.com/hello1367studio/30min"
                target="_blank"
              >
                <Button
                  className="cursor-pointer w-full sm:w-auto"
                  variant="outline"
                >
                  {t("ctaDemo")}
                </Button>
              </Link>
            </div>
          </div>
          <TabsShowcase />
        </div>
      </div>
    </section>
  );
}
