"use client";

import { useTranslations } from "next-intl";
import { DoorOpen, Home, CheckCircle, BarChart3 } from "lucide-react";

export default function DirectorRooms() {
  const t = useTranslations("DirectorRooms");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink/60">{t("description")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink/60">
            <Home className="h-4 w-4" />
            {t("totalRooms")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">12</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink/60">
            <CheckCircle className="h-4 w-4" />
            {t("availableToday")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">4</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink/60">
            <BarChart3 className="h-4 w-4" />
            {t("utilizationRate")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">83%</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-tint text-brand">
          <DoorOpen className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-ink">{t("comingSoonTitle")}</h2>
        <p className="mt-1 max-w-sm text-sm text-ink/60">{t("comingSoonDescription")}</p>
      </div>
    </div>
  );
}
