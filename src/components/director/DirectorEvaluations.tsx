"use client";

import { useTranslations } from "next-intl";
import { ListChecks, CheckCircle, BarChart3, Users } from "lucide-react";

export default function DirectorEvaluations() {
  const t = useTranslations("DirectorEvaluations");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("description")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <ListChecks className="h-4 w-4" />
            {t("evaluationsPlanned")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {t("kpi1Value")}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <CheckCircle className="h-4 w-4" />
            {t("completed")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {t("kpi2Value")}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <BarChart3 className="h-4 w-4" />
            {t("averageScore")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {t("kpi3Value")}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <Users className="h-4 w-4" />
            {t("teachersCoverage")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {t("kpi4Value")}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center">
        <p className="text-sm text-gray-500">{t("seeTeacherEvaluations")}</p>
      </div>
    </div>
  );
}
