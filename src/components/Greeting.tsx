"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export function Greeting({
  name,
  civility,
}: {
  name: string;
  civility: string;
}) {
  const t = useTranslations("Greeting");
  const [isEvening, setIsEvening] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    setIsEvening(!(hour >= 6 && hour < 18));
  }, []);

  const greeting = isEvening ? t("evening") : t("morning");

  return (
    <h2 className="text-lg font-semibold">
      {greeting}, {civility} {name}
    </h2>
  );
}
