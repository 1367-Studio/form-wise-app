"use client";

import useSWR from "swr";
import { useTranslations } from "next-intl";
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Euro,
} from "lucide-react";

type Stats = {
  tenants: { total: number; active: number; trial: number; expired: number };
  users: {
    total: number;
    parents: number;
    teachers: number;
    directors: number;
    staff: number;
    admins: number;
  };
  students: { total: number };
  signups: {
    thisMonth: number;
    lastMonth: number;
    delta: number | null;
  };
  revenue: {
    mrr: number;
    activeMonthly: number;
    activeYearly: number;
  };
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminKpiCards() {
  const t = useTranslations("AdminKpi");
  const { data, error, isLoading } = useSWR<Stats>(
    "/api/superadmin/stats",
    fetcher
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl border border-gray-200 bg-gray-100"
          />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {t("loadError")}
      </div>
    );
  }

  const delta = data.signups.delta;
  const deltaLabel =
    delta === null
      ? t("deltaNoPrev")
      : delta >= 0
        ? t("deltaUp", { value: delta })
        : t("deltaDown", { value: delta });

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label={t("tenantsTotal")}
        value={data.tenants.total}
        icon={<Building2 className="h-5 w-5" />}
      />
      <KpiCard
        label={t("tenantsActive")}
        value={data.tenants.active}
        icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
      />
      <KpiCard
        label={t("tenantsTrial")}
        value={data.tenants.trial}
        icon={<Clock className="h-5 w-5 text-amber-600" />}
      />
      <KpiCard
        label={t("tenantsExpired")}
        value={data.tenants.expired}
        icon={<AlertCircle className="h-5 w-5 text-red-600" />}
      />
      <KpiCard
        label={t("usersTotal")}
        value={data.users.total}
        icon={<Users className="h-5 w-5" />}
        sub={
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            <span>{t("breakdownDirectors", { count: data.users.directors })}</span>
            <span>{t("breakdownTeachers", { count: data.users.teachers })}</span>
            <span>{t("breakdownParents", { count: data.users.parents })}</span>
            <span>{t("breakdownStaff", { count: data.users.staff })}</span>
          </div>
        }
      />
      <KpiCard
        label={t("studentsTotal")}
        value={data.students.total}
        icon={<GraduationCap className="h-5 w-5" />}
      />
      <KpiCard
        label={t("mrr")}
        value={data.revenue.mrr}
        icon={<Euro className="h-5 w-5 text-[#f84a00]" />}
        sub={t("mrrSub", {
          monthly: data.revenue.activeMonthly,
          yearly: data.revenue.activeYearly,
        })}
        format="currency"
      />
      <KpiCard
        className="col-span-2 lg:col-span-2"
        label={t("signupsThisMonth")}
        value={data.signups.thisMonth}
        icon={
          delta === null ? (
            <TrendingUp className="h-5 w-5" />
          ) : delta >= 0 ? (
            <TrendingUp className="h-5 w-5 text-green-600" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-600" />
          )
        }
        sub={
          <span
            className={
              delta === null
                ? "text-gray-500"
                : delta >= 0
                  ? "text-green-600"
                  : "text-red-600"
            }
          >
            {deltaLabel}
          </span>
        }
      />
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  sub,
  className = "",
  format = "number",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
  format?: "number" | "currency";
}) {
  const display =
    format === "currency"
      ? `${value.toLocaleString()} €`
      : value.toLocaleString();
  return (
    <div
      className={`rounded-xl border border-black/10 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
          {label}
        </span>
        <span className="text-gray-600">{icon}</span>
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">
        {display}
      </div>
      {sub && <div className="mt-2 text-xs text-gray-500">{sub}</div>}
    </div>
  );
}
