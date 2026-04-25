"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { useParams } from "next/navigation";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

export default function LanguageSwitcher({
  variant = "default",
}: {
  variant?: "default" | "ghost";
}) {
  const t = useTranslations("Languages");
  const tCommon = useTranslations("Common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const onSelect = (next: Locale) => {
    if (next === locale) return;
    startTransition(() => {
      router.replace(
        // @ts-expect-error params shape varies per route
        { pathname, params },
        { locale: next }
      );
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant === "ghost" ? "ghost" : "outline"}
          size="sm"
          className="gap-2 cursor-pointer"
          disabled={isPending}
          aria-label={tCommon("language")}
        >
          <Globe className="h-4 w-4" />
          <span className="uppercase">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => onSelect(l)}
            className={l === locale ? "font-semibold" : ""}
          >
            {t(l)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
