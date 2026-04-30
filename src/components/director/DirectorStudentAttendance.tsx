"use client";

import { useTranslations } from "next-intl";
import { ClipboardCheck, UserCheck, UserX, Clock, ShieldCheck } from "lucide-react";

export default function DirectorStudentAttendance() {
  const t = useTranslations("DirectorStudentAttendance");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("description")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <UserCheck className="h-4 w-4" />
            {t("presentToday")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">168</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <UserX className="h-4 w-4" />
            {t("absent")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">9</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <Clock className="h-4 w-4" />
            {t("late")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">5</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <ShieldCheck className="h-4 w-4" />
            {t("excused")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">3</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
          <ClipboardCheck className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{t("comingSoonTitle")}</h2>
        <p className="mt-1 max-w-sm text-sm text-gray-500">{t("comingSoonDescription")}</p>
      </div>
    </div>
  );
}
