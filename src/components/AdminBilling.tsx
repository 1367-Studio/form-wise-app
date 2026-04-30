"use client";

import useSWR from "swr";
import { useTranslations } from "next-intl";
import {
  Euro,
  CreditCard,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

type Invoice = {
  id: string;
  number: string | null;
  status: string | null;
  amountPaid: number;
  amountDue: number;
  currency: string;
  customerEmail: string | null;
  hostedInvoiceUrl: string | null;
  created: number;
};

type Overview = {
  mrr: number;
  activeSubscriptions: number;
  currency: string;
  failedCount: number;
  recentInvoices: Invoice[];
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const statusBadge = (
  status: string | null,
  t: (k: string) => string
): { label: string; className: string } => {
  switch (status) {
    case "paid":
      return {
        label: t("statusPaid"),
        className: "bg-green-100 text-green-800",
      };
    case "open":
      return {
        label: t("statusOpen"),
        className: "bg-amber-100 text-amber-800",
      };
    case "uncollectible":
      return {
        label: t("statusUncollectible"),
        className: "bg-red-100 text-red-800",
      };
    case "void":
      return {
        label: t("statusVoid"),
        className: "bg-gray-200 text-gray-700",
      };
    default:
      return {
        label: t("statusDraft"),
        className: "bg-gray-100 text-gray-600",
      };
  }
};

function formatCurrency(amountCents: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}

export default function AdminBilling() {
  const t = useTranslations("AdminBilling");
  const { data, error, isLoading } = useSWR<Overview>(
    "/api/superadmin/stripe/overview",
    fetcher
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-gray-500">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-black/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
              {t("mrrLive")}
            </span>
            <Euro className="h-5 w-5 text-[#2563EB]" />
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">
            {formatCurrency(data.mrr * 100, data.currency)}
          </div>
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
              {t("activeSubs")}
            </span>
            <CreditCard className="h-5 w-5 text-gray-700" />
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">
            {data.activeSubscriptions}
          </div>
        </div>
        <div className="rounded-xl border border-black/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
              {t("failedPayments")}
            </span>
            <AlertCircle
              className={`h-5 w-5 ${
                data.failedCount > 0 ? "text-red-600" : "text-gray-400"
              }`}
            />
          </div>
          <div
            className={`mt-3 text-3xl font-semibold tracking-tight ${
              data.failedCount > 0 ? "text-red-600" : "text-gray-900"
            }`}
          >
            {data.failedCount}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-black/10 bg-white">
        <div className="border-b border-black/10 px-6 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
            {t("recentInvoices")}
          </h3>
        </div>
        {data.recentInvoices.length === 0 ? (
          <div className="px-6 py-8 text-sm text-gray-500">{t("empty")}</div>
        ) : (
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-black/10">
              <tr>
                <th className="px-6 py-3">{t("headerInvoice")}</th>
                <th className="px-6 py-3">{t("headerCustomer")}</th>
                <th className="px-6 py-3">{t("headerAmount")}</th>
                <th className="px-6 py-3">{t("headerStatus")}</th>
                <th className="px-6 py-3">{t("headerDate")}</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {data.recentInvoices.map((inv) => {
                const badge = statusBadge(inv.status, t);
                return (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {inv.number ?? inv.id.slice(0, 10)}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {inv.customerEmail ?? "—"}
                    </td>
                    <td className="px-6 py-3 text-gray-900">
                      {formatCurrency(
                        inv.amountPaid || inv.amountDue,
                        inv.currency
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-xs">
                      {new Date(inv.created * 1000).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {inv.hostedInvoiceUrl && (
                        <a
                          href={inv.hostedInvoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-[#2563EB]"
                        >
                          {t("openInStripe")}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
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
