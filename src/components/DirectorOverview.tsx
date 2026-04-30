"use client";

import { Dispatch, SetStateAction } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import {
  Users,
  Briefcase,
  UserPlus,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  Building2,
  Clock,
  Sparkles,
  Bell,
  CheckCircle2,
  CalendarCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionSkeleton } from "./SectionSkeleton";
import { DashboardSection } from "../types/types";
import { useMoneyFormatter } from "../app/hooks/useMoneyFormatter";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type DirectorOverviewResponse = {
  students: { active: number; pending: number };
  staff: { total: number; teachers: number };
  finance: {
    revenueThisMonth: number;
    overdueCount: number;
    overdueAmount: number;
  };
  attendance: { present: number; absent: number; late: number; excused: number };
  contractsExpiringSoon: number;
  recentNotifications: {
    id: string;
    title: string;
    message: string;
    createdAt: string;
    isGlobal: boolean;
  }[];
  upcomingEvents: {
    id: string;
    title: string;
    startDate: string;
    type: string;
  }[];
};

function timeOfDayKey() {
  const h = new Date().getHours();
  if (h < 12) return "greetingMorning";
  if (h < 18) return "greetingAfternoon";
  return "greetingEvening";
}

export default function DirectorOverview({
  setActiveSectionAction,
}: {
  setActiveSectionAction: Dispatch<SetStateAction<DashboardSection>>;
}) {
  const t = useTranslations("DirectorOverview");
  const { data: session, status } = useSession();
  const fmtMoney = useMoneyFormatter();

  const { data, isLoading } = useSWR<DirectorOverviewResponse>(
    "/api/director/director-overview",
    fetcher,
    { refreshInterval: 60_000 },
  );

  if (status === "loading" || !session) {
    return <SectionSkeleton variant="stats" rows={4} />;
  }

  if (isLoading || !data) {
    return <SectionSkeleton variant="stats" rows={4} />;
  }

  const user = session.user;
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  const initials = [user.firstName, user.lastName]
    .map((n) => n?.[0] ?? "")
    .join("")
    .toUpperCase();

  const {
    students,
    staff,
    finance,
    attendance,
    contractsExpiringSoon,
    recentNotifications,
  } = data;

  const nextSteps: { id: string; label: string; section: DashboardSection }[] =
    [];
  if (students.pending > 0) {
    nextSteps.push({
      id: "pendingInscriptions",
      label: t("nextStepPendingInscriptions", { count: students.pending }),
      section: "directorInscriptions",
    });
  }
  if (finance.overdueCount > 0) {
    nextSteps.push({
      id: "latePayments",
      label: t("nextStepLatePayments", { count: finance.overdueCount }),
      section: "directorLatePayments",
    });
  }
  if (contractsExpiringSoon > 0) {
    nextSteps.push({
      id: "contractsToRenew",
      label: t("nextStepContractsToRenew", { count: contractsExpiringSoon }),
      section: "directorContracts",
    });
  }

  return (
    <div className="space-y-6">
      {/* ── Hero card ── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-[#0F172A] text-base font-semibold text-white">
            {initials || "·"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-wide text-[#2563EB]">
              {t(timeOfDayKey())}
            </p>
            <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
              {fullName || t("welcomeFallback")}
            </h1>
            {user.schoolCode && (
              <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <Building2 className="h-3.5 w-3.5" />
                {user.schoolCode}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── KPI Tiles ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<Users className="h-5 w-5" />}
          label={t("kpiStudents")}
          value={students.active}
          onClick={() => setActiveSectionAction("eleves")}
        />
        <KpiCard
          icon={<Briefcase className="h-5 w-5" />}
          label={t("kpiStaff")}
          value={staff.total}
          onClick={() => setActiveSectionAction("inviteStaff")}
        />
        <KpiCard
          icon={<UserPlus className="h-5 w-5" />}
          label={t("kpiPendingInscriptions")}
          value={students.pending}
          tone={students.pending > 0 ? "warning" : "neutral"}
          hint={
            students.pending > 0
              ? t("kpiPendingHint", { count: students.pending })
              : undefined
          }
          onClick={() => setActiveSectionAction("directorInscriptions")}
        />
        <KpiCard
          icon={<TrendingUp className="h-5 w-5" />}
          label={t("kpiMonthlyRevenue")}
          value={fmtMoney(finance.revenueThisMonth)}
          onClick={() => setActiveSectionAction("directorFinanceOverview")}
        />
      </div>

      {/* ── Next steps + Monthly revenue ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Next steps — 2/3 width */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#2563EB]" />
            <h2 className="text-base font-semibold text-gray-900">
              {t("nextStepsTitle")}
            </h2>
          </div>
          {nextSteps.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              {t("nextStepsAllDone")}
            </div>
          ) : (
            <ul className="space-y-2">
              {nextSteps.map((step) => (
                <li key={step.id}>
                  <button
                    onClick={() => setActiveSectionAction(step.section)}
                    className="group flex w-full items-center justify-between rounded-lg border border-black/5 bg-gray-50 px-3 py-3 text-left text-sm cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-gray-900">
                      <AlertCircle className="h-4 w-4 text-[#2563EB]" />
                      {step.label}
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Monthly revenue — 1/3 width */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-1 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-900">
              {t("monthlyRevenueTitle")}
            </h2>
          </div>
          <p className="text-3xl font-semibold text-gray-900">
            {fmtMoney(finance.revenueThisMonth)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {t("monthlyRevenueHint")}
          </p>
          {finance.overdueCount > 0 && (
            <div className="mt-3 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {t("overdueInfo", {
                count: finance.overdueCount,
                amount: fmtMoney(finance.overdueAmount),
              })}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full cursor-pointer"
            onClick={() => setActiveSectionAction("directorFinanceOverview")}
          >
            {t("viewFinanceDetails")}
          </Button>
        </div>
      </div>

      {/* ── Quick-access row: Notifications + Attendance ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Notifications */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              {t("notificationsTitle")}
            </h2>
            <button
              onClick={() => setActiveSectionAction("notification")}
              className="flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline cursor-pointer"
            >
              {t("seeAll")}
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {recentNotifications.length === 0 ? (
            <EmptyBlock
              icon={<Bell className="h-5 w-5" />}
              label={t("notificationsEmpty")}
            />
          ) : (
            <ul className="space-y-2">
              {recentNotifications.slice(0, 4).map((n) => (
                <li
                  key={n.id}
                  className="rounded-lg border border-[#2563EB]/20 bg-[#EFF6FF] p-3"
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-[#2563EB]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {n.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">
                        {n.message}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(n.createdAt).toLocaleString()}
                        {n.isGlobal && (
                          <Badge
                            variant="outline"
                            className="border-[#2563EB]/20 text-[10px] text-[#2563EB]"
                          >
                            {t("global")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Today's Attendance Summary */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              {t("attendanceTitle")}
            </h2>
            <button
              onClick={() => setActiveSectionAction("directorAttendance")}
              className="flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline cursor-pointer"
            >
              {t("seeAll")}
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-3">
            <AttendanceRow
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              label={t("attendancePresent")}
              value={attendance.present}
              badgeClass="bg-emerald-100 text-emerald-700"
            />
            <AttendanceRow
              icon={<AlertCircle className="h-4 w-4 text-red-500" />}
              label={t("attendanceAbsent")}
              value={attendance.absent}
              badgeClass="bg-red-100 text-red-700"
            />
            <AttendanceRow
              icon={<Clock className="h-4 w-4 text-[#2563EB]" />}
              label={t("attendanceLate")}
              value={attendance.late}
              badgeClass="bg-blue-100 text-[#2563EB]"
            />
            <AttendanceRow
              icon={<CalendarCheck className="h-4 w-4 text-gray-500" />}
              label={t("attendanceExcused")}
              value={attendance.excused}
              badgeClass="bg-gray-100 text-gray-700"
            />
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
            <CalendarCheck className="h-3.5 w-3.5" />
            {t("attendanceDate", {
              date: new Date().toLocaleDateString(),
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function KpiCard({
  icon,
  label,
  value,
  hint,
  tone = "neutral",
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  hint?: string;
  tone?: "neutral" | "success" | "warning" | "alert";
  onClick?: () => void;
}) {
  const toneClass = {
    neutral: "text-gray-900",
    success: "text-emerald-600",
    warning: "text-[#2563EB]",
    alert: "text-[#2563EB]",
  }[tone];

  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-gray-200 bg-white p-5 text-left cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </button>
  );
}

function AttendanceRow({
  icon,
  label,
  value,
  badgeClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  badgeClass: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-black/5 bg-gray-50 px-3 py-2.5">
      <div className="flex items-center gap-2 text-sm text-gray-900">
        {icon}
        {label}
      </div>
      <Badge className={`${badgeClass} hover:${badgeClass}`}>{value}</Badge>
    </div>
  );
}

function EmptyBlock({
  icon,
  label,
  cta,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  cta?: string;
  onClick?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-black/15 px-4 py-8 text-center">
      <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500">
        {icon}
      </span>
      <p className="text-sm text-gray-500">{label}</p>
      {cta && onClick && (
        <Button
          size="sm"
          variant="outline"
          className="mt-3 cursor-pointer"
          onClick={onClick}
        >
          {cta}
        </Button>
      )}
    </div>
  );
}
