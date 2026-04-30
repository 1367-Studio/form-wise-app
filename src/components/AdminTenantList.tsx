"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CenteredSpinner from "./CenteredSpinner";
import { Eye, Search, Download } from "lucide-react";
import { useTranslations } from "next-intl";

type Tenant = {
  id: string;
  name: string;
  uniqueNumber: string;
  billingPlan: string;
  createdAt: string;
  plan: string;
  subscriptionStatus?: "FREE_TRIAL" | "ACTIVE" | "EXPIRED";
  schoolCode: string;
  users: {
    firstName: string;
    lastName: string;
    email: string;
  }[];
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminTenantList() {
  const t = useTranslations("AdminTenants");
  const tExport = useTranslations("AdminExport");
  const { data, isLoading } = useSWR("/api/superadmin/tenants", fetcher);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("created-desc");
  const [exporting, setExporting] = useState(false);

  function getPlanBadge(
    plan: string,
    status?: "ACTIVE" | "FREE_TRIAL" | "EXPIRED"
  ) {
    if (status === "ACTIVE") {
      return (
        <Badge className="bg-green-100 text-green-800">
          {t("subscriptionActive")}
        </Badge>
      );
    }
    if (status === "EXPIRED") {
      return <Badge className="bg-red-100 text-red-800">{t("expired")}</Badge>;
    }
    if (status === "FREE_TRIAL") {
      return (
        <Badge className="bg-amber-500 text-white">{t("freeTrial")}</Badge>
      );
    }

    switch (plan) {
      case "MONTHLY":
        return (
          <Badge className="bg-[#2563EB] text-white">{t("monthly")}</Badge>
        );
      case "YEARLY":
        return <Badge className="bg-black text-white">{t("annual")}</Badge>;
      default:
        return (
          <Badge className="bg-gray-400 text-white">{t("freeTrial")}</Badge>
        );
    }
  }

  const filteredTenants = useMemo<Tenant[]>(() => {
    const tenants: Tenant[] = data?.tenants ?? [];
    const q = search.trim().toLowerCase();

    let out = tenants.filter((tenant) => {
      if (statusFilter !== "all") {
        if (statusFilter === "active" && tenant.subscriptionStatus !== "ACTIVE")
          return false;
        if (
          statusFilter === "trial" &&
          tenant.subscriptionStatus !== "FREE_TRIAL"
        )
          return false;
        if (
          statusFilter === "expired" &&
          tenant.subscriptionStatus !== "EXPIRED"
        )
          return false;
      }
      if (!q) return true;
      const director = tenant.users[0];
      const haystack = [
        tenant.name,
        tenant.schoolCode,
        tenant.uniqueNumber,
        director?.email,
        director?.firstName,
        director?.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    switch (sortOption) {
      case "created-asc":
        out = [...out].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "created-desc":
        out = [...out].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "name":
        out = [...out].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return out;
  }, [data, search, statusFilter, sortOption]);

  if (isLoading) return <CenteredSpinner label={t("loading")} />;
  if (!data?.tenants) return <div>{t("loadError")}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <button
          onClick={async () => {
            setExporting(true);
            try {
              const res = await fetch("/api/superadmin/tenants/export");
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `formwise-tenants-${new Date()
                .toISOString()
                .slice(0, 10)}.csv`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
            } finally {
              setExporting(false);
            }
          }}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-md border border-black/10 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#2563EB] hover:text-[#2563EB] disabled:opacity-60 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          {exporting ? tExport("exporting") : tExport("csv")}
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filterAll")}</SelectItem>
            <SelectItem value="active">{t("filterActive")}</SelectItem>
            <SelectItem value="trial">{t("filterTrial")}</SelectItem>
            <SelectItem value="expired">{t("filterExpired")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOption} onValueChange={setSortOption}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created-desc">{t("sortRecent")}</SelectItem>
            <SelectItem value="created-asc">{t("sortOldest")}</SelectItem>
            <SelectItem value="name">{t("sortName")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-gray-500">
        {t("countResults", { count: filteredTenants.length })}
      </p>

      <div className="hidden md:block overflow-auto rounded-xl border border-black/10 bg-white">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-black/10">
            <tr>
              <th className="px-4 py-3">{t("headerSchoolNumber")}</th>
              <th className="px-4 py-3">{t("headerName")}</th>
              <th className="px-4 py-3">{t("headerDirector")}</th>
              <th className="px-4 py-3">{t("headerPlan")}</th>
              <th className="px-4 py-3">{t("headerCreatedAt")}</th>
              <th className="px-4 py-3 text-center">{t("headerActions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {filteredTenants.map((tenant: Tenant) => (
              <tr key={tenant.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600 font-medium">
                  {tenant.schoolCode}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {tenant.name}
                </td>
                <td className="px-4 py-3">
                  {tenant.users.length > 0 ? (
                    <>
                      <div>
                        {tenant.users[0].firstName} {tenant.users[0].lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {tenant.users[0].email}
                      </div>
                    </>
                  ) : (
                    <em className="text-gray-400">{t("noDirector")}</em>
                  )}
                </td>
                <td className="px-4 py-3">
                  {getPlanBadge(tenant.billingPlan, tenant.subscriptionStatus)}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(tenant.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-center">
                  <a
                    href={`/admin/tenant/${tenant.id}`}
                    className="inline-flex items-center gap-1 rounded-md border border-black/10 px-2 py-1 text-xs text-gray-700 transition-colors hover:border-[#2563EB] hover:text-[#2563EB]"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col gap-3">
        {filteredTenants.map((tenant: Tenant) => (
          <a
            key={tenant.id}
            href={`/admin/tenant/${tenant.id}`}
            className="rounded-xl border border-black/10 bg-white p-4"
          >
            <div className="text-xs text-gray-500">
              {t("schoolNumberLabel")} <strong>{tenant.uniqueNumber}</strong>
            </div>
            <div className="mt-1 text-base font-semibold text-gray-900">
              {tenant.name}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {t("directorLabel")}{" "}
              {tenant.users.length > 0 ? (
                <>
                  {tenant.users[0].firstName} {tenant.users[0].lastName}
                </>
              ) : (
                <em className="text-gray-400">{t("noDirector")}</em>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between">
              {getPlanBadge(tenant.billingPlan, tenant.subscriptionStatus)}
              <span className="text-xs text-gray-500">
                {new Date(tenant.createdAt).toLocaleDateString()}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
