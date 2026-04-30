"use client";

import { useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { CreditCard, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionSkeleton } from "@/components/SectionSkeleton";

type Payment = {
  id: string;
  amount: number;
  method: string;
  paidAt: string;
  reference: string | null;
  invoice: {
    number: string;
    student: { firstName: string; lastName: string };
  };
};

type PaymentsResponse = {
  payments: Payment[];
  total: number;
  page: number;
  pageSize: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

const METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: "bankTransfer",
  CHEQUE: "cheque",
  CASH: "cash",
  DIRECT_DEBIT: "directDebit",
  OTHER: "other",
};

export default function DirectorPayments() {
  const t = useTranslations("DirectorPayments");
  const [page, setPage] = useState(1);

  const { data, error, isLoading } = useSWR<PaymentsResponse>(
    `/api/director/payments?page=${page}&pageSize=10`,
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
        <SectionSkeleton variant="stats" rows={3} />
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

  // Compute summary stats from the current page data
  const totalPayments = data?.total ?? 0;
  const totalCollected = data?.payments.reduce((sum, p) => sum + p.amount, 0) ?? 0;
  const avgPayment = data && data.payments.length > 0 ? totalCollected / data.payments.length : 0;

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
            <CreditCard className="h-4 w-4" />
            {t("paymentsThisMonth")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{totalPayments}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <CreditCard className="h-4 w-4" />
            {t("amountCollected")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {eur.format(totalCollected / 100)}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <CreditCard className="h-4 w-4" />
            {t("averagePayment")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {eur.format(avgPayment / 100)}
          </p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">{t("recentPayments")}</h3>
        </div>
        {!data || data.payments.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            {t("noPayments")}
          </div>
        ) : (
          <>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">{t("date")}</th>
                  <th className="px-4 py-3 text-left">{t("family")}</th>
                  <th className="px-4 py-3 text-left">{t("amount")}</th>
                  <th className="px-4 py-3 text-left">{t("method")}</th>
                  <th className="px-4 py-3 text-left">{t("reference")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(payment.paidAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {payment.invoice.student.firstName} {payment.invoice.student.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {eur.format(payment.amount / 100)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {t(METHOD_LABELS[payment.method] ?? "other")}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {payment.reference ?? "—"}
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
