"use client";

import useSWR from "swr";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ExternalLink, RefreshCw, X, AlertCircle } from "lucide-react";

type FailedInvoice = {
  id: string;
  number: string | null;
  status: string | null;
  amountDue: number;
  currency: string;
  customerEmail: string | null;
  customerName: string | null;
  attemptCount: number;
  nextPaymentAttempt: number | null;
  hostedInvoiceUrl: string | null;
  created: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export default function AdminFailedPayments() {
  const t = useTranslations("AdminFailedPayments");
  const { data, error, isLoading, mutate } = useSWR<{ failed: FailedInvoice[] }>(
    "/api/superadmin/stripe/failed-payments",
    fetcher
  );
  const [busyId, setBusyId] = useState<string | null>(null);

  const runAction = async (
    invoiceId: string,
    action: "retry" | "void" | "markUncollectible"
  ) => {
    setBusyId(invoiceId);
    try {
      const res = await fetch("/api/superadmin/stripe/failed-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, action }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        const successKey =
          action === "retry"
            ? "retrySuccess"
            : action === "void"
              ? "voidSuccess"
              : "uncollectibleSuccess";
        toast.success(t(successKey));
        mutate();
      } else {
        toast.error(t("actionFailed"));
      }
    } catch {
      toast.error(t("actionFailed"));
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-gray-500">{t("subtitle")}</p>
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {t("loadError")}
      </div>
    );
  }

  const failed = data?.failed ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-gray-500">{t("subtitle")}</p>
      </div>

      {failed.length === 0 ? (
        <div className="rounded-xl border border-black/10 bg-white p-8 text-center text-sm text-gray-600">
          {t("empty")}
        </div>
      ) : (
        <div className="rounded-xl border border-black/10 bg-white overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-black/10">
              <tr>
                <th className="px-4 py-3">{t("headerInvoice")}</th>
                <th className="px-4 py-3">{t("headerCustomer")}</th>
                <th className="px-4 py-3">{t("headerAmount")}</th>
                <th className="px-4 py-3">{t("headerAttempts")}</th>
                <th className="px-4 py-3">{t("headerNextRetry")}</th>
                <th className="px-4 py-3 text-right">{t("headerActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {failed.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {inv.number ?? inv.id.slice(0, 10)}
                  </td>
                  <td className="px-4 py-3">
                    <div>{inv.customerName ?? "—"}</div>
                    <div className="text-xs text-gray-500">
                      {inv.customerEmail ?? ""}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-red-600 font-medium">
                    {fmt(inv.amountDue, inv.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      {inv.attemptCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {inv.nextPaymentAttempt
                      ? new Date(inv.nextPaymentAttempt * 1000).toLocaleDateString()
                      : t("notReady")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => runAction(inv.id, "retry")}
                        disabled={busyId === inv.id}
                        className="inline-flex items-center gap-1 rounded-md bg-[#2563EB] px-2 py-1 text-xs font-medium text-white hover:bg-[#1D4ED8] disabled:opacity-60"
                      >
                        <RefreshCw className="h-3 w-3" />
                        {t("retry")}
                      </button>
                      <button
                        onClick={() => runAction(inv.id, "void")}
                        disabled={busyId === inv.id}
                        className="inline-flex items-center gap-1 rounded-md border border-black/10 px-2 py-1 text-xs font-medium text-gray-700 hover:border-red-500 hover:text-red-600 disabled:opacity-60"
                      >
                        <X className="h-3 w-3" />
                        {t("void")}
                      </button>
                      {inv.hostedInvoiceUrl && (
                        <a
                          href={inv.hostedInvoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-black/10 px-2 py-1 text-xs font-medium text-gray-700 hover:border-[#2563EB] hover:text-[#2563EB]"
                        >
                          {t("open")}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
