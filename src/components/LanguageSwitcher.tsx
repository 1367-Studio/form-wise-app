"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/** Flag assets in /public. pt → Brazil. */
const FLAG_SRC: Record<Locale, string> = {
  fr: "/france-flag.svg",
  en: "/uk-flag.svg",
  pt: "/Flag_of_Brazil.svg",
  es: "/Flag_of_Spain.svg",
};

/** Circular flag mark clipped to its container. */
function Flag({ locale }: { locale: Locale }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={FLAG_SRC[locale]}
      alt=""
      aria-hidden="true"
      draggable={false}
      className="h-full w-full object-cover"
    />
  );
}

export default function LanguageSwitcher({
  className = "",
}: {
  // Kept for backward compatibility with existing call sites; unused now.
  variant?: "default" | "ghost";
  className?: string;
}) {
  const t = useTranslations("Languages");
  const tCommon = useTranslations("Common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Active flag stays first; the others fan out to its right.
  const ordered: Locale[] = [
    locale,
    ...routing.locales.filter((l) => l !== locale),
  ];

  const select = (next: Locale) => {
    if (next === locale) return;
    startTransition(() => {
      router.replace(
        // @ts-expect-error params shape varies per route
        { pathname, params },
        { locale: next }
      );
    });
  };

  const handleClick = (loc: Locale) => {
    if (!open) {
      setOpen(true);
      return;
    }
    setOpen(false);
    select(loc);
  };

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div
        role="group"
        aria-label={tCommon("language")}
        className="flex items-center"
      >
        {ordered.map((loc, i) => {
          const isActive = loc === locale;
          const visible = open || isActive;
          return (
            <button
              key={loc}
              type="button"
              aria-label={t(loc)}
              aria-pressed={isActive}
              aria-hidden={!visible}
              tabIndex={visible ? 0 : -1}
              title={t(loc)}
              disabled={isPending}
              onClick={() => handleClick(loc)}
              style={{
                marginLeft: i === 0 ? 0 : open ? 8 : -24,
                opacity: visible ? 1 : 0,
                transform: visible ? "scale(1)" : "scale(0.8)",
                zIndex: open ? 1 : 20 - i,
                pointerEvents: visible ? "auto" : "none",
              }}
              className="relative shrink-0 cursor-pointer rounded-full transition-[margin,opacity,transform] duration-300 ease-out will-change-[margin,transform] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent motion-reduce:transition-none"
            >
              <span className="block h-6 w-6 overflow-hidden rounded-full bg-transparent">
                <Flag locale={loc} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
