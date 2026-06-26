"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAudience } from "@/contexts/AudienceContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function VideoHeroSection() {
  const { audience, setAudience } = useAudience();
  const t = useTranslations(`Hero.${audience}`);
  const tToggle = useTranslations("Hero");

  const leftFeatures = [1, 2, 3].map((i) => ({
    title: t(`leftFeature${i}Title` as Parameters<typeof t>[0]),
    description: t(`leftFeature${i}Desc` as Parameters<typeof t>[0]),
  }));

  const rightFeatures = [1, 2, 3].map((i) => ({
    title: t(`rightFeature${i}Title` as Parameters<typeof t>[0]),
    description: t(`rightFeature${i}Desc` as Parameters<typeof t>[0]),
  }));
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const videoRowRef = useRef<HTMLDivElement>(null);
  const videoCardRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }

    const mm = gsap.matchMedia();

    mm.add("(max-width: 1279px)", () => {
      const tl = gsap.timeline({ delay: 0.3 });
      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" },
      )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
          "-=0.4",
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "-=0.3",
        )
        .fromTo(
          videoCardRef.current,
          { opacity: 0, y: 40, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out" },
          "-=0.2",
        )
        .fromTo(
          questionRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
          "-=0.3",
        );

      return () => tl.kill();
    });

    mm.add("(min-width: 1280px)", () => {
      gsap.set(leftPanelRef.current, { opacity: 0, x: -24 });
      gsap.set(rightPanelRef.current, { opacity: 0, x: 24 });

      const tl = gsap.timeline({ delay: 0.3 });
      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" },
      )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
          "-=0.4",
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "-=0.3",
        )
        .fromTo(
          videoCardRef.current,
          { opacity: 0, y: 40, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out" },
          "-=0.2",
        )
        .fromTo(
          questionRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
          "-=0.3",
        );

      const textBlockHeight = (textRef.current?.offsetHeight ?? 0) + 24;

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=600",
          scrub: 1,
          pin: true,
        },
      });

      scrollTl
        .to(textRef.current, { opacity: 0, y: -40, ease: "none" }, 0)
        .to(videoRowRef.current, { y: -textBlockHeight, ease: "none" }, 0)
        .to(leftPanelRef.current, { opacity: 1, x: 0, ease: "none" }, 0.35)
        .to(rightPanelRef.current, { opacity: 1, x: 0, ease: "none" }, 0.35);

      return () => {
        tl.kill();
        ScrollTrigger.getAll().forEach((st) => st.kill());
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-hero
      role="banner"
      aria-label={t("introAriaLabel")}
      className="relative w-full xl:min-h-screen bg-black flex flex-col items-center justify-start pt-20 px-4 pb-6 xl:pb-0 overflow-hidden"
    >
      {/* Background glow blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-600/20 blur-[140px] rounded-full" />
        <div className="absolute bottom-[10%] left-[5%] w-[350px] h-[300px] bg-blue-800/15 blur-[100px] rounded-full" />
        <div className="absolute bottom-[20%] right-[5%] w-[300px] h-[250px] bg-indigo-700/10 blur-[100px] rounded-full" />
      </div>

      {/* Text content */}
      <div
        ref={textRef}
        className="relative z-20 text-center max-w-3xl w-full mb-6 pt-5"
      >
        {/* Audience switch */}
        <div
          role="group"
          aria-label={tToggle("toggleAriaLabel")}
          className="mx-auto mb-8 inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 p-1 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={() => setAudience("associations")}
            aria-pressed={audience === "associations"}
            className={`cursor-pointer rounded-md px-5 py-2 text-sm font-medium transition-colors ${
              audience === "associations"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:text-white"
            }`}
          >
            {tToggle("toggleAssociations")}
          </button>
          <button
            type="button"
            onClick={() => setAudience("schools")}
            aria-pressed={audience === "schools"}
            className={`cursor-pointer rounded-md px-5 py-2 text-sm font-medium transition-colors ${
              audience === "schools"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:text-white"
            }`}
          >
            {tToggle("toggleSchools")}
          </button>
        </div>

        <h1
          ref={titleRef}
          className="text-3xl md:text-5xl font-bold leading-tight text-white opacity-0"
        >
          {t("titlePrefix")}{" "}
          <span className="text-blue-400">{t("titleHighlight")}</span>
        </h1>
        <p
          ref={subtitleRef}
          className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-gray-300 opacity-0"
        >
          {t("subtitle")}
        </p>
        <div
          ref={ctaRef}
          className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-x-4 opacity-0"
        >
          <Link href="/register/free-trial">
            <Button className="cursor-pointer w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
              <Zap className="mr-2 h-4 w-4" />
              {t("ctaTrial")}
            </Button>
          </Link>
          <Link
            href="https://calendly.com/hello1367studio/30min"
            target="_blank"
          >
            <Button
              variant="outline"
              className="cursor-pointer w-full sm:w-auto border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent"
            >
              {t("ctaDemo")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Video row */}
      <div ref={videoRowRef} className="relative z-20 w-full max-w-5xl mx-auto">
        {/* Left panel */}
        <div
          ref={leftPanelRef}
          className="hidden xl:flex flex-col gap-5 absolute right-full top-8 mr-8 w-44 opacity-0"
        >
          {leftFeatures.map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white leading-snug">
                  {f.title}
                </p>
                <p className="mt-0.5 text-xs text-gray-400 leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Video card */}
        <div ref={videoCardRef} className="relative opacity-0">
          <div className="absolute -inset-2 bg-blue-500/15 blur-2xl rounded-3xl pointer-events-none" />
          <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60">
            <div className="flex items-center gap-2 bg-[#111111] px-4 py-3 border-b border-white/[0.07]">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="flex-1 mx-4 bg-white/5 rounded-md h-5 flex items-center px-3">
                <span className="text-xs text-white/20 truncate">
                  app.formwise.io
                </span>
              </div>
            </div>
            <div className="w-full aspect-video overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                loop
                playsInline
                preload="auto"
                className="w-full h-full object-cover"
              >
                <source src="/hero.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div
          ref={rightPanelRef}
          className="hidden xl:flex flex-col gap-5 absolute left-full top-8 ml-8 w-44 opacity-0"
        >
          {rightFeatures.map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white leading-snug">
                  {f.title}
                </p>
                <p className="mt-0.5 text-xs text-gray-400 leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
