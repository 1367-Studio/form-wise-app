"use client";

import useSWR from "swr";
import { useTranslations } from "next-intl";
import { DollarSign, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { SectionSkeleton } from "@/components/SectionSkeleton";

type Transaction = {
  id: string;
  amount: number;
  paidAt: string;
  method: string;
  invoice: {
    number: string;
    student: { firstName: string; lastName: string };
  };
};

type FinanceOverview = {
  stats: {
    revenueThisMonth: number;
    outstandingAmount: number;
    overdueAmount: number;
    paymentRate: number;
  };
  recentTransactions: Transaction[];
  invoiceCounts: { total: number; paid: number; pending: number; overdue: number };
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

export default function DirectorFinanceOverview() {
  const t = useTranslations("DirectorFinance");
  const { data, error, isLoading } = useSWR<FinanceOverview>(
    "/api/director/finance-overview",
    fetcher,
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{t("title")}</h1>
          <p className="mt-1 text-sm text-ink/60">{t("description")}</p>
        </div>
        <SectionSkeleton variant="stats" rows={4} />
        <SectionSkeleton variant="table" rows={5} />
      </div>
    );
  }

  if (error || !data || "error" in data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {t("loadError")}
      </div>
    );
  }

  const { stats, recentTransactions } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink/60">{t("description")}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink/60">
            <DollarSign className="h-4 w-4" />
            {t("revenueMTD")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {eur.format(stats.revenueThisMonth / 100)}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink/60">
            <Clock className="h-4 w-4" />
            {t("outstanding")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {eur.format(stats.outstandingAmount / 100)}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink/60">
            <CheckCircle className="h-4 w-4" />
            {t("paymentRate")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {stats.paymentRate}%
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink/60">
            <AlertTriangle className="h-4 w-4" />
            {t("overdue")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {eur.format(stats.overdueAmount / 100)}
          </p>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-ink">{t("recentTransactions")}</h3>
        </div>
        {recentTransactions.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-ink/60">
            {t("noTransactions")}
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th className="px-4 py-3 text-left">{t("date")}</th>
                <th className="px-4 py-3 text-left">{t("invoice")}</th>
                <th className="px-4 py-3 text-left">{t("family")}</th>
                <th className="px-4 py-3 text-left">{t("amount")}</th>
                <th className="px-4 py-3 text-left">{t("method")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-ink/80">
                    {new Date(tx.paidAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 font-mono text-ink/80">
                    {tx.invoice.number}
                  </td>
                  <td className="px-4 py-3 font-medium text-ink">
                    {tx.invoice.student.firstName} {tx.invoice.student.lastName}
                  </td>
                  <td className="px-4 py-3 text-ink">
                    {eur.format(tx.amount / 100)}
                  </td>
                  <td className="px-4 py-3 text-ink/80">{tx.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
