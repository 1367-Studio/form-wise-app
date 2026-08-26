"use client";

import { useTranslations } from "next-intl";
import { Users, UserCheck, UserPlus, UsersRound } from "lucide-react";

export default function DirectorUsers() {
  const t = useTranslations("DirectorUsers");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink/60">{t("description")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink/60">
            <UsersRound className="h-4 w-4" />
            {t("totalUsers")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">48</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink/60">
            <UserCheck className="h-4 w-4" />
            {t("active")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">42</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink/60">
            <UserPlus className="h-4 w-4" />
            {t("invitedPending")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">6</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-tint text-brand">
          <Users className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-ink">{t("comingSoonTitle")}</h2>
        <p className="mt-1 max-w-sm text-sm text-ink/60">{t("comingSoonDescription")}</p>
      </div>
    </div>
  );
}
