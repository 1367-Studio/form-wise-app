"use client";

import { useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { CalendarDays, BarChart3, AlertTriangle } from "lucide-react";
import { SectionSkeleton } from "../SectionSkeleton";
import DashboardPagination from "../DashboardPagination";

type HourLog = {
  id: string;
  date: string;
  hours: number;
  overtime: number;
  notes: string | null;
  staff: {
    firstName: string;
    lastName: string;
    roleLabel: string;
  };
};

type StaffHoursResponse = {
  logs: HourLog[];
  total: number;
  aggregates: {
    totalHours: number;
    totalOvertime: number;
    averageDaily: number;
  };
  page: number;
  pageSize: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const PAGE_SIZE = 10;

function getDefaultDateRange() {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  return { from, to };
}

export default function DirectorStaffHours() {
  const t = useTranslations("DirectorStaffHours");
  const [page, setPage] = useState(1);

  const { from, to } = getDefaultDateRange();

  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
    from,
    to,
  });

  const { data, error, isLoading } = useSWR<StaffHoursResponse>(
    `/api/director/staff-hours?${params.toString()}`,
    fetcher,
    { refreshInterval: 60_000 }
  );

  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const aggregates = data?.aggregates ?? {
    totalHours: 0,
    totalOvertime: 0,
    averageDaily: 0,
  };

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
            <CalendarDays className="h-4 w-4 text-[#2563EB]" />
            {t("totalHours")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {aggregates.totalHours}h
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            {t("overtime")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {aggregates.totalOvertime}h
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <BarChart3 className="h-4 w-4 text-[#1E3A5F]" />
            {t("averageDaily")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {aggregates.averageDaily}h
          </p>
        </div>
      </div>

      {/* Error state */}
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {t("loadError")}
        </div>
      ) : logs.length === 0 ? (
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
                  <th className="px-4 py-3">{t("headerDate")}</th>
                  <th className="px-4 py-3">{t("headerStaffName")}</th>
                  <th className="px-4 py-3">{t("headerRole")}</th>
                  <th className="px-4 py-3 text-right">{t("headerHours")}</th>
                  <th className="px-4 py-3 text-right">
                    {t("headerOvertime")}
                  </th>
                  <th className="px-4 py-3">{t("headerNotes")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(log.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {log.staff.firstName} {log.staff.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {log.staff.roleLabel}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 font-medium tabular-nums">
                      {log.hours}h
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {log.overtime > 0 ? (
                        <span className="text-amber-600 font-medium">
                          +{log.overtime}h
                        </span>
                      ) : (
                        <span className="text-gray-400">0h</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">
                      {log.notes ?? "—"}
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
