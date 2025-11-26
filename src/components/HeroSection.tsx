"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TabsShowcase from "./TabsShowcase";
import { Zap } from "lucide-react";

export default function HeroSection() {
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
      className="bg-white relative isolate pt-14"
      aria-label="Introduction Formwise"
    >
      <div className="py-24 sm:py-32 lg:pb-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto text-center">
            <h1
              ref={titleRef}
              className="fancy-gradient-text text-balance text-5xl sm:text-7xl leading-[57px] sm:leading-[83px] font-semibold tracking-tight text-gray-900"
            >
              Réduisez de 80% le temps passé sur les inscriptions{" "}
              <span className="fancy-gradient-span">scolaires.</span>
            </h1>
            <p
              ref={paragraphRef}
              className="fancy-gradient-text mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8"
            >
              Simplifiez la gestion des élèves, des paiements et des documents
              en une seule plateforme.
            </p>
            <div
              ref={buttonsRef}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-x-6"
            >
              <Link href="/register/school-register">
                <Button className="cursor-pointer w-full sm:w-auto">
                  <Zap className="mr-2 h-4 w-4" />
                  Profitez de 20 jours gratuitement
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
                  Réserver une démo
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
