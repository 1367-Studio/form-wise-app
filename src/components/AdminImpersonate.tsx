"use client";

import { useTranslations } from "next-intl";
import { UserCheck, Lock } from "lucide-react";

export default function AdminImpersonate() {
  const t = useTranslations("AdminImpersonate");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-gray-500">{t("subtitle")}</p>
      </div>
      <div className="rounded-xl border border-dashed border-black/15 bg-white p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF]">
          <UserCheck className="h-6 w-6 text-[#2563EB]" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-gray-900">
          {t("comingSoon")}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          {t("needsMigration")}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-md border border-black/10 bg-gray-50 px-3 py-1.5 text-xs text-gray-600">
          <Lock className="h-3.5 w-3.5" />
          Prisma migration required
        </div>
      </div>
    </div>
  );
}
