"use client";

import { Dispatch, SetStateAction } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import {
  Users,
  CalendarCheck,
  BookOpen,
  Bell,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionSkeleton } from "./SectionSkeleton";
import { DashboardSection } from "../types/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type TeacherOverviewResponse = {
  teacher: {
    firstName: string;
    lastName: string;
    className: string;
    subjectName: string;
  } | null;
  students: { total: number };
  attendance: { present: number; absent: number; late: number; excused: number };
  journal: { entriesThisWeek: number };
  notifications: { unread: number };
  recentJournals: {
    id: string;
    date: string;
    classSummary: string;
    subjectName: string;
  }[];
};

function timeOfDayKey() {
  const h = new Date().getHours();
  if (h < 12) return "greetingMorning";
  if (h < 18) return "greetingAfternoon";
  return "greetingEvening";
}

export default function TeacherOverview({
  setActiveSectionAction,
}: {
  setActiveSectionAction: Dispatch<SetStateAction<DashboardSection>>;
}) {
  const t = useTranslations("TeacherOverview");
  const { data: session, status } = useSession();

  const { data, isLoading } = useSWR<TeacherOverviewResponse>(
    "/api/teacher/overview",
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
  const fullName = data.teacher
    ? `${data.teacher.firstName} ${data.teacher.lastName}`.trim()
    : `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  const initials = fullName
    .split(" ")
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase();

  const { students, attendance, journal, notifications, recentJournals } = data;

  const totalAttendance =
    attendance.present + attendance.absent + attendance.late + attendance.excused;
  const attendanceRate =
    totalAttendance > 0
      ? Math.round((attendance.present / totalAttendance) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Hero card */}
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
            {(data.teacher?.className || data.teacher?.subjectName) && (
              <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <BookOpen className="h-3.5 w-3.5" />
                {[data.teacher.className, data.teacher.subjectName]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<Users className="h-5 w-5" />}
          label={t("kpiStudents")}
          value={students.total}
          onClick={() => setActiveSectionAction("teacherClassOverview")}
        />
        <KpiCard
          icon={<CalendarCheck className="h-5 w-5" />}
          label={t("kpiAttendanceRate")}
          value={`${attendanceRate}%`}
          tone={attendanceRate >= 90 ? "success" : attendanceRate >= 70 ? "warning" : "alert"}
          onClick={() => setActiveSectionAction("attendance")}
        />
        <KpiCard
          icon={<BookOpen className="h-5 w-5" />}
          label={t("kpiJournalEntries")}
          value={journal.entriesThisWeek}
          onClick={() => setActiveSectionAction("journal")}
        />
        <KpiCard
          icon={<Bell className="h-5 w-5" />}
          label={t("kpiUnreadNotifications")}
          value={notifications.unread}
          tone={notifications.unread > 0 ? "warning" : "neutral"}
          onClick={() => setActiveSectionAction("notification")}
        />
      </div>

      {/* Quick-access row: Attendance summary + Recent journals */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Today's Attendance Summary */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#2563EB]" />
              <h2 className="text-base font-semibold text-gray-900">
                {t("attendanceTitle")}
              </h2>
            </div>
            <button
              onClick={() => setActiveSectionAction("attendance")}
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
            {t("attendanceDate", { date: new Date().toLocaleDateString() })}
          </div>
        </div>

        {/* Recent Journal Entries */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              {t("recentJournalsTitle")}
            </h2>
            <button
              onClick={() => setActiveSectionAction("journal")}
              className="flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline cursor-pointer"
            >
              {t("seeAll")}
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {recentJournals.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-black/15 px-4 py-8 text-center">
              <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <BookOpen className="h-5 w-5" />
              </span>
              <p className="text-sm text-gray-500">{t("recentJournalsEmpty")}</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {recentJournals.map((j) => (
                <li
                  key={j.id}
                  className="rounded-lg border border-[#2563EB]/20 bg-[#EFF6FF] p-3"
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-[#2563EB]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {j.classSummary}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(j.date).toLocaleDateString()}
                        {j.subjectName && (
                          <Badge
                            variant="outline"
                            className="border-[#2563EB]/20 text-[10px] text-[#2563EB]"
                          >
                            {j.subjectName}
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
      </div>
    </div>
  );
}

/* ---- Sub-components ---- */

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
