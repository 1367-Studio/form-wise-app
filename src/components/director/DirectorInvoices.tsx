"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { FileText, CheckCircle, Clock, AlertTriangle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { SectionSkeleton } from "@/components/SectionSkeleton";

type Invoice = {
  id: string;
  number: string;
  amount: number;
  status: string;
  dueDate: string;
  createdAt: string;
  student: {
    firstName: string;
    lastName: string;
    parent: { firstName: string; lastName: string };
  };
  _count: { payments: number };
};

type InvoicesResponse = {
  invoices: Invoice[];
  total: number;
  page: number;
  pageSize: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

const statusClasses: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  OVERDUE: "bg-red-100 text-red-700",
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function DirectorInvoices() {
  const t = useTranslations("DirectorInvoices");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", "10");
  if (statusFilter !== "all") params.set("status", statusFilter);
  if (debouncedSearch) params.set("search", debouncedSearch);

  const { data, error, isLoading } = useSWR<InvoicesResponse>(
    `/api/director/invoices?${params.toString()}`,
    fetcher,
  );

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-gray-500">{t("description")}</p>
        </div>
        <SectionSkeleton variant="stats" rows={4} />
        <SectionSkeleton variant="table" rows={5} />
      </div>
    );
  }

  if (error || (data && "error" in data)) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {t("loadError")}
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
      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
              <FileText className="h-4 w-4" />
              {t("totalInvoices")}
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{data.total}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
              <CheckCircle className="h-4 w-4" />
              {t("paid")}
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {data.invoices.filter((i) => i.status === "PAID").length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
              <Clock className="h-4 w-4" />
              {t("pending")}
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {data.invoices.filter((i) => i.status === "PENDING").length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
              <AlertTriangle className="h-4 w-4" />
              {t("overdue")}
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {data.invoices.filter((i) => i.status === "OVERDUE").length}
            </p>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatuses")}</SelectItem>
            <SelectItem value="PAID">{t("paid")}</SelectItem>
            <SelectItem value="PENDING">{t("pending")}</SelectItem>
            <SelectItem value="OVERDUE">{t("overdue")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        {!data || data.invoices.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            {t("noInvoices")}
          </div>
        ) : (
          <>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">{t("family")}</th>
                  <th className="px-4 py-3 text-left">{t("amount")}</th>
                  <th className="px-4 py-3 text-left">{t("status")}</th>
                  <th className="px-4 py-3 text-left">{t("date")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-600">{inv.number}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {inv.student.parent.firstName} {inv.student.parent.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {eur.format(inv.amount / 100)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses[inv.status] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {t(inv.status.toLowerCase())}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(inv.dueDate).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                <p className="text-sm text-gray-500">
                  {t("pageOf", { page: data.page, total: totalPages })}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t("prev")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("next")}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
