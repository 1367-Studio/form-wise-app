"use client";

import { useTranslations } from "next-intl";
import { Cog, ToggleRight, Wrench, Rocket } from "lucide-react";

export default function AdminConfigPage() {
  const t = useTranslations("AdminConfigPage");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("description")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <ToggleRight className="h-4 w-4" />
            {t("featureFlags")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">0</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <Wrench className="h-4 w-4" />
            {t("maintenanceMode")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">--</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <Rocket className="h-4 w-4" />
            {t("lastDeploy")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">--</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
          <Cog className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{t("comingSoonTitle")}</h2>
        <p className="mt-1 max-w-sm text-sm text-gray-500">{t("comingSoonDescription")}</p>
      </div>
    </div>
  );
}
