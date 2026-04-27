"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function PreinscriptionSuccessPage() {
  const t = useTranslations("PreinscriptionSuccess");
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-2xl font-bold mb-4 text-green-600">{t("title")}</h1>
      <p className="text-gray-600 mb-6">{t("body")}</p>
      <Button className="cursor-pointer" onClick={() => router.push("/")}>
        {t("backHomeButton")}
      </Button>
    </div>
  );
}
