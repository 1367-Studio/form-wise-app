"use client";

import { useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { FileCheck, AlertTriangle, XCircle } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { SectionSkeleton } from "../SectionSkeleton";
import DashboardPagination from "../DashboardPagination";

type Contract = {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  hoursPerWeek: number;
  salary: number;
  status: string;
  notes: string | null;
  staff: {
    firstName: string;
    lastName: string;
    roleLabel: string;
    email: string;
  };
};

type ContractsResponse = {
  contracts: Contract[];
  total: number;
  page: number;
  pageSize: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const PAGE_SIZE = 10;

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  EXPIRING_SOON: "bg-amber-100 text-amber-700",
  EXPIRED: "bg-red-100 text-red-700",
  TERMINATED: "bg-gray-100 text-gray-700",
};

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  CDI: "CDI",
  CDD: "CDD",
  STAGE: "Stage",
  FREELANCE: "Freelance",
  OTHER: "Autre",
};

export default function DirectorContracts() {
  const t = useTranslations("DirectorContracts");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
  });
  if (statusFilter !== "all") {
    params.set("status", statusFilter);
  }

  const { data, error, isLoading } = useSWR<ContractsResponse>(
    `/api/director/contracts?${params.toString()}`,
    fetcher,
    { refreshInterval: 60_000 }
  );

  const contracts = data?.contracts ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Compute KPI counts from current page data when no filter is applied,
  // otherwise show the total matching the current filter.
  const activeCount = contracts.filter((c) => c.status === "ACTIVE").length;
  const expiringCount = contracts.filter(
    (c) => c.status === "EXPIRING_SOON"
  ).length;
  const expiredCount = contracts.filter((c) => c.status === "EXPIRED").length;

  function handleStatusChange(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{t("description")}</p>
        </div>
        <SectionSkeleton variant="stats" />
        <SectionSkeleton variant="table" rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("description")}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <FileCheck className="h-4 w-4 text-emerald-600" />
            {t("activeContracts")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {activeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            {t("expiringSoon")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {expiringCount}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <XCircle className="h-4 w-4 text-red-500" />
            {t("expired")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {expiredCount}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filterAll")}</SelectItem>
            <SelectItem value="ACTIVE">{t("filterActive")}</SelectItem>
            <SelectItem value="EXPIRING_SOON">
              {t("filterExpiringSoon")}
            </SelectItem>
            <SelectItem value="EXPIRED">{t("filterExpired")}</SelectItem>
            <SelectItem value="TERMINATED">{t("filterTerminated")}</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-gray-500">
          {t("totalContracts", { count: total })}
        </span>
      </div>

      {/* Error state */}
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {t("loadError")}
        </div>
      ) : contracts.length === 0 ? (
        /* Empty state */
        <div className="rounded-xl border border-black/10 bg-white p-8 text-center text-sm text-gray-500">
          {t("empty")}
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-black/10 bg-white">
            <table className="min-w-full text-sm text-left">
              <thead className="border-b border-black/10 bg-[#F8FAFC] text-[#1E3A5F] font-semibold">
                <tr>
                  <th className="px-4 py-3">{t("headerStaffName")}</th>
                  <th className="px-4 py-3">{t("headerRole")}</th>
                  <th className="px-4 py-3">{t("headerContractType")}</th>
                  <th className="px-4 py-3">{t("headerStartDate")}</th>
                  <th className="px-4 py-3">{t("headerEndDate")}</th>
                  <th className="px-4 py-3">{t("headerStatus")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {contract.staff.firstName} {contract.staff.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {contract.staff.roleLabel}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {CONTRACT_TYPE_LABELS[contract.type] ?? contract.type}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(contract.startDate).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {contract.endDate
                        ? new Date(contract.endDate).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_BADGE[contract.status] ??
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {t(`status${contract.status}`)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <DashboardPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
