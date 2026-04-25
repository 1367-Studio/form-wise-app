"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { fr, enGB, ptBR, es } from "date-fns/locale";
import { Tenant } from "@prisma/client";
import { useLocale, useTranslations } from "next-intl";
import {
  GraduationCap,
  Users,
  LayoutGrid,
  UserRound,
  Mail,
  Phone,
  Activity,
} from "lucide-react";

const dateLocales = { fr, en: enGB, pt: ptBR, es } as const;

interface Props {
  tenant: Omit<Tenant, "status"> & {
    status: string | null;
    users: {
      email: string;
      firstName: string;
      lastName: string;
      phone?: string | null;
      address?: string | null;
    }[];
  };
  stats?: {
    students: number;
    teachers: number;
    classes: number;
    parents: number;
    lastActivity: string | null;
  };
}

function CustomBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${color}`}
    >
      {label}
    </span>
  );
}

export default function TenantDetailCard({ tenant, stats }: Props) {
  const t = useTranslations("TenantDetail");
  const locale = useLocale() as keyof typeof dateLocales;
  const dfLocale = dateLocales[locale] ?? fr;
  const director = tenant.users[0];
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(tenant.status || "ACTIVE");

  function getPlanLabel(plan: string) {
    switch (plan) {
      case "FREE_TRIAL":
        return {
          label: t("freeTrial"),
          color: "bg-[#e8f7ee] text-[#2fbf6c] ring-green-600/20",
        };
      case "MONTHLY":
        return {
          label: t("monthly"),
          color: "bg-[#f0f9ff] text-[#3b82f6] ring-blue-400/30",
        };
      case "YEARLY":
        return {
          label: t("annual"),
          color: "bg-[#eef2ff] text-[#6366f1] ring-gray-700/30",
        };
      default:
        return {
          label: t("unknown"),
          color: "bg-gray-200 text-gray-600 ring-gray-400/30",
        };
    }
  }

  function getStatusLabel(s: string) {
    return s === "ACTIVE"
      ? {
          label: t("active"),
          color: "bg-[#e8f7ee] text-[#2fbf6c] ring-green-600/20",
        }
      : {
          label: t("inactive"),
          color: "bg-red-100 text-red-600 ring-red-500/20",
        };
  }

  const toggleStatus = async () => {
    startTransition(async () => {
      const newStatus = status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await fetch(`/api/superadmin/tenants/${tenant.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      setStatus(newStatus);
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile
            icon={<GraduationCap className="h-4 w-4" />}
            label={t("statsStudents")}
            value={stats.students}
          />
          <StatTile
            icon={<UserRound className="h-4 w-4" />}
            label={t("statsTeachers")}
            value={stats.teachers}
          />
          <StatTile
            icon={<LayoutGrid className="h-4 w-4" />}
            label={t("statsClasses")}
            value={stats.classes}
          />
          <StatTile
            icon={<Users className="h-4 w-4" />}
            label={t("statsParents")}
            value={stats.parents}
          />
        </div>
      )}

      {/* Director quick contact */}
      {director && (
        <div className="rounded-xl border border-black/10 bg-white p-4 flex flex-wrap gap-2">
          <a
            href={`mailto:${director.email}`}
            className="inline-flex items-center gap-2 rounded-md bg-[#f84a00] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#d43e00]"
          >
            <Mail className="h-4 w-4" />
            {t("contactDirector")}
          </a>
          {director.phone && (
            <a
              href={`tel:${director.phone}`}
              className="inline-flex items-center gap-2 rounded-md border border-black/10 px-3 py-2 text-sm font-medium text-gray-900 transition-colors hover:border-[#f84a00] hover:text-[#f84a00]"
            >
              <Phone className="h-4 w-4" />
              {director.phone}
            </a>
          )}
          {stats?.lastActivity && (
            <span className="ml-auto inline-flex items-center gap-2 text-xs text-gray-500">
              <Activity className="h-3.5 w-3.5" />
              {t("lastActivity")}:{" "}
              {format(new Date(stats.lastActivity), "dd/MM/yyyy", {
                locale: dfLocale,
              })}
            </span>
          )}
        </div>
      )}

      <div className="hidden md:block border p-4">
        <table className="min-w-full text-sm border rounded-lg overflow-hidden">
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold">{t("name")}</td>
              <td className="px-4 py-3">{tenant.name}</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold">{t("schoolNumber")}</td>
              <td className="px-4 py-3">
                {tenant.uniqueNumber || t("noValue")}
              </td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold">{t("plan")}</td>
              <td className="px-4 py-3">
                <CustomBadge {...getPlanLabel(tenant.billingPlan)} />
              </td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold">{t("status")}</td>
              <td className="px-4 py-3 flex items-center gap-2">
                <CustomBadge {...getStatusLabel(status)} />
                <Button
                  className="cursor-pointer"
                  variant="outline"
                  size="sm"
                  onClick={toggleStatus}
                  disabled={isPending}
                >
                  {status === "ACTIVE" ? t("deactivate") : t("activate")}
                </Button>
              </td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold">{t("stripeId")}</td>
              <td className="px-4 py-3">
                {tenant.stripeCustomerId || t("noValue")}
              </td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold">{t("createdAt")}</td>
              <td className="px-4 py-3">
                {format(new Date(tenant.createdAt), "dd/MM/yyyy", {
                  locale: dfLocale,
                })}
              </td>
            </tr>
            {director && (
              <>
                <tr className="border-b">
                  <td className="px-4 py-3 font-semibold">{t("director")}</td>
                  <td className="px-4 py-3">
                    {director.firstName} {director.lastName}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-3 font-semibold">{t("email")}</td>
                  <td className="px-4 py-3">{director.email}</td>
                </tr>
                {director.phone && (
                  <tr className="border-b">
                    <td className="px-4 py-3 font-semibold">{t("phone")}</td>
                    <td className="px-4 py-3">{director.phone}</td>
                  </tr>
                )}
                {director.address && (
                  <tr>
                    <td className="px-4 py-3 font-semibold">{t("address")}</td>
                    <td className="px-4 py-3">{director.address}</td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      <Card className="md:hidden p-4 space-y-2">
        <h2 className="text-lg font-semibold">{tenant.name}</h2>
        <p className="text-sm">
          {t("schoolNumberLabel")} {tenant.uniqueNumber || t("noValue")}
        </p>
        <p className="text-sm">
          {t("planLabel")} <CustomBadge {...getPlanLabel(tenant.billingPlan)} />
        </p>
        <p className="text-sm">
          {t("statusLabel")} <CustomBadge {...getStatusLabel(status)} />
        </p>
        <p className="text-sm">
          {t("stripeIdLabel")} {tenant.stripeCustomerId || t("noValue")}
        </p>
        <p className="text-sm">
          {t("createdAtLabel")}{" "}
          {format(new Date(tenant.createdAt), "dd/MM/yyyy", {
            locale: dfLocale,
          })}
        </p>
        {director && (
          <>
            <p className="text-sm">
              {t("directorLabel")} {director.firstName} {director.lastName}
            </p>
            <p className="text-sm">
              {t("emailLabel")} {director.email}
            </p>
            {director.phone && (
              <p className="text-sm">
                {t("phoneLabel")} {director.phone}
              </p>
            )}
            {director.address && (
              <p className="text-sm">
                {t("addressLabel")} {director.address}
              </p>
            )}
          </>
        )}
        <div className="flex gap-4 mt-2">
          <Button className="cursor-pointer" variant="destructive" size="sm">
            {t("cancel")}
          </Button>
          <Button className="cursor-pointer" variant="default" size="sm">
            {t("upgrade")}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
        {value.toLocaleString()}
      </div>
    </div>
  );
}
