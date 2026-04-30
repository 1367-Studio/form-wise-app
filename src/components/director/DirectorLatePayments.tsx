"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { AlertCircle, DollarSign, Users, Clock } from "lucide-react";
import { SectionSkeleton } from "@/components/SectionSkeleton";

type OverdueInvoice = {
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
  invoices: OverdueInvoice[];
  total: number;
  page: number;
  pageSize: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

function daysBetween(dateStr: string): number {
  const due = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - due.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export default function DirectorLatePayments() {
  const t = useTranslations("DirectorLatePayments");
  const { data, error, isLoading } = useSWR<InvoicesResponse>(
    "/api/director/invoices?status=OVERDUE&pageSize=50",
    fetcher,
  );

  const stats = useMemo(() => {
    if (!data || !data.invoices.length) {
      return { totalOverdue: 0, familiesCount: 0, avgDays: 0 };
    }

    const totalOverdue = data.invoices.reduce((sum, inv) => sum + inv.amount, 0);

    // Count unique families by parent name
    const families = new Set(
      data.invoices.map(
        (inv) => `${inv.student.parent.firstName}-${inv.student.parent.lastName}`,
      ),
    );

    const daysArr = data.invoices.map((inv) => daysBetween(inv.dueDate));
    const avgDays = Math.round(daysArr.reduce((a, b) => a + b, 0) / daysArr.length);

    return { totalOverdue, familiesCount: families.size, avgDays };
  }, [data]);

  if (isLoading) {
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

      {/* KPI Cards -- warning-toned */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-red-600">
            <DollarSign className="h-4 w-4" />
            {t("totalOverdue")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-red-700">
            <span className="inline-flex items-center gap-2">
              {eur.format(stats.totalOverdue / 100)}
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                {t("alert")}
              </span>
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-amber-600">
            <Users className="h-4 w-4" />
            {t("familiesConcerned")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-amber-700">
            <span className="inline-flex items-center gap-2">
              {stats.familiesCount}
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                {t("warning")}
              </span>
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-amber-600">
            <Clock className="h-4 w-4" />
            {t("avgDaysOverdue")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-amber-700">
            <span className="inline-flex items-center gap-2">
              {stats.avgDays}
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                {t("days")}
              </span>
            </span>
          </p>
        </div>
      </div>

      {/* Overdue Invoices Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">{t("overdueDetails")}</h3>
        </div>
        {!data || data.invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <p className="text-sm text-gray-500">{t("noOverdue")}</p>
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">{t("family")}</th>
                <th className="px-4 py-3 text-left">{t("amount")}</th>
                <th className="px-4 py-3 text-left">{t("daysOverdue")}</th>
                <th className="px-4 py-3 text-left">{t("dueDate")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.invoices.map((inv) => {
                const days = daysBetween(inv.dueDate);
                return (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {inv.student.parent.firstName} {inv.student.parent.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {eur.format(inv.amount / 100)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          days >= 20 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {days} {t("days")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(inv.dueDate).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
