"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CenteredSpinner({ label }: { label?: string }) {
  const t = useTranslations("Common");
  const text = label ?? t("loading");
  return (
    <div className="flex flex-col items-center justify-center h-screen text-muted-foreground">
      <Loader2 className="w-8 h-8 animate-spin mb-4" />
      <p>{text}</p>
    </div>
  );
}
