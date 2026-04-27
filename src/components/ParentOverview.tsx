"use client";

import useSWR from "swr";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction } from "react";
import {
  Users,
  Bell,
  FileText,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CenteredSpinner from "./CenteredSpinner";
import { DashboardSection } from "../types/types";
import { useMoneyFormatter } from "../app/hooks/useMoneyFormatter";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type OverviewResponse = {
  parent: {
    firstName: string;
    lastName: string;
    tenantName: string | null;
    schoolCode: string | null;
  };
  stats: {
    childrenCount: number;
    pendingCount: number;
    unreadCount: number;
    documentsCount: number;
    ribComplete: boolean;
    monthlyTotal: number;
  };
  students: {
    id: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    status: string;
    className: string | null;
    monthlyFee: number | null;
    documentsCount: number;
  }[];
  notifications: {
    id: string;
    title: string;
    message: string;
    createdAt: string;
    isGlobal: boolean;
    studentName: string | null;
    isRead: boolean;
  }[];
};

function timeOfDayKey() {
  const h = new Date().getHours();
  if (h < 12) return "greetingMorning";
  if (h < 18) return "greetingAfternoon";
  return "greetingEvening";
}

function age(birthDate: string) {
  const d = new Date(birthDate);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

export default function ParentOverview({
  setActiveSectionAction,
}: {
  setActiveSectionAction: Dispatch<SetStateAction<DashboardSection>>;
}) {
  const t = useTranslations("ParentOverview");
  const tStatus = useTranslations("Dashboard");
  const fmtMoney = useMoneyFormatter();
  const { data, isLoading } = useSWR<OverviewResponse>(
    "/api/parent/overview",
    fetcher,
    { refreshInterval: 60_000 }
  );

  if (isLoading || !data) return <CenteredSpinner label={t("loading")} />;

  const { parent, stats, students, notifications } = data;
  const fullName = `${parent.firstName} ${parent.lastName}`.trim();
  const initials = [parent.firstName, parent.lastName]
    .map((n) => n?.[0] ?? "")
    .join("")
    .toUpperCase();

  const nextSteps: { id: string; label: string; section: DashboardSection }[] =
    [];
  if (stats.childrenCount === 0)
    nextSteps.push({
      id: "addChild",
      label: t("nextStepAddChild"),
      section: "children",
    });
  if (!stats.ribComplete)
    nextSteps.push({
      id: "rib",
      label: t("nextStepRib"),
      section: "rib",
    });
  if (stats.pendingCount > 0)
    nextSteps.push({
      id: "pending",
      label: t("nextStepPending", { count: stats.pendingCount }),
      section: "children",
    });
  if (stats.unreadCount > 0)
    nextSteps.push({
      id: "unread",
      label: t("nextStepUnread", { count: stats.unreadCount }),
      section: "notification",
    });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-[#fef1ea] via-white to-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-black text-base font-semibold text-white">
            {initials || "·"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-wide text-[#f84a00]">
              {t(timeOfDayKey())}
            </p>
            <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
              {fullName || t("welcomeFallback")}
            </h1>
            {parent.tenantName && (
              <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <Building2 className="h-3.5 w-3.5" />
                {parent.tenantName}
                {parent.schoolCode ? ` · ${parent.schoolCode}` : ""}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<Users className="h-5 w-5" />}
          label={t("kpiChildren")}
          value={stats.childrenCount}
          hint={
            stats.pendingCount > 0
              ? t("kpiChildrenPending", { count: stats.pendingCount })
              : undefined
          }
          tone={stats.pendingCount > 0 ? "warning" : "neutral"}
          onClick={() => setActiveSectionAction("children")}
        />
        <KpiCard
          icon={<Bell className="h-5 w-5" />}
          label={t("kpiUnread")}
          value={stats.unreadCount}
          tone={stats.unreadCount > 0 ? "alert" : "neutral"}
          onClick={() => setActiveSectionAction("notification")}
        />
        <KpiCard
          icon={<FileText className="h-5 w-5" />}
          label={t("kpiDocuments")}
          value={stats.documentsCount}
          onClick={() => setActiveSectionAction("documents")}
        />
        <KpiCard
          icon={<CreditCard className="h-5 w-5" />}
          label={t("kpiRib")}
          value={stats.ribComplete ? t("ribComplete") : t("ribIncomplete")}
          tone={stats.ribComplete ? "success" : "alert"}
          onClick={() => setActiveSectionAction("rib")}
        />
      </div>

      {/* Next steps + monthly total */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#f84a00]" />
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
                    className="group flex w-full items-center justify-between rounded-lg border border-black/5 bg-gray-50 px-3 py-3 text-left text-sm hover:border-[#f84a00]/30 hover:bg-[#fef1ea] cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-2 text-gray-900">
                      <AlertCircle className="h-4 w-4 text-[#f84a00]" />
                      {step.label}
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#f84a00]" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <div className="mb-1 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-900">
              {t("monthlyTotalTitle")}
            </h2>
          </div>
          <p className="text-3xl font-semibold text-gray-900">
            {fmtMoney(stats.monthlyTotal)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {t("monthlyTotalHint", {
              count: stats.childrenCount,
            })}
          </p>
          {!stats.ribComplete && stats.childrenCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full cursor-pointer"
              onClick={() => setActiveSectionAction("rib")}
            >
              {t("setupRib")}
            </Button>
          )}
        </div>
      </div>

      {/* Children + Notifications previews */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              {t("childrenTitle")}
            </h2>
            <button
              onClick={() => setActiveSectionAction("children")}
              className="flex items-center gap-1 text-xs font-medium text-[#f84a00] hover:underline cursor-pointer"
            >
              {t("seeAll")}
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {students.length === 0 ? (
            <EmptyBlock
              icon={<Users className="h-5 w-5" />}
              label={t("childrenEmpty")}
              cta={t("addFirstChild")}
              onClick={() => setActiveSectionAction("children")}
            />
          ) : (
            <ul className="space-y-2">
              {students.slice(0, 3).map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-3 rounded-lg border border-black/5 bg-gray-50 p-3"
                >
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                    {(s.firstName[0] ?? "") + (s.lastName[0] ?? "")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {s.firstName} {s.lastName}
                      </p>
                      <StatusBadge status={s.status} t={tStatus} />
                    </div>
                    <p className="text-xs text-gray-500">
                      {s.className ?? t("noClass")} ·{" "}
                      {t("ageYears", { years: age(s.birthDate) })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              {t("notificationsTitle")}
            </h2>
            <button
              onClick={() => setActiveSectionAction("notification")}
              className="flex items-center gap-1 text-xs font-medium text-[#f84a00] hover:underline cursor-pointer"
            >
              {t("seeAll")}
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {notifications.length === 0 ? (
            <EmptyBlock
              icon={<Bell className="h-5 w-5" />}
              label={t("notificationsEmpty")}
            />
          ) : (
            <ul className="space-y-2">
              {notifications.slice(0, 4).map((n) => (
                <li
                  key={n.id}
                  className={`rounded-lg border p-3 ${
                    n.isRead
                      ? "border-black/5 bg-gray-50"
                      : "border-[#f84a00]/20 bg-[#fef1ea]"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && (
                      <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-[#f84a00]" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {n.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">
                        {n.message}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(n.createdAt).toLocaleString()}
                        {n.studentName && (
                          <Badge
                            variant="outline"
                            className="border-black/10 text-[10px]"
                          >
                            {n.studentName}
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
    warning: "text-amber-600",
    alert: "text-[#f84a00]",
  }[tone];
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-black/10 bg-white p-5 text-left hover:border-[#f84a00]/30 hover:shadow-sm cursor-pointer transition-all"
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

function StatusBadge({
  status,
  t,
}: {
  status: string;
  t: ReturnType<typeof useTranslations>;
}) {
  if (status === "ACCEPTED")
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        {t("statusAccepted")}
      </Badge>
    );
  if (status === "PENDING")
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
        {t("statusPending")}
      </Badge>
    );
  if (status === "REJECTED")
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
        {t("statusRejected")}
      </Badge>
    );
  return <Badge variant="outline">{status}</Badge>;
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
