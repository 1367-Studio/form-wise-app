"use client";

import useSWR from "swr";
import { Dispatch, SetStateAction } from "react";
import { useTranslations } from "next-intl";
import {
  Wallet,
  CreditCard,
  CalendarRange,
  AlertCircle,
  CheckCircle2,
  Info,
  ArrowRight,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CenteredSpinner from "./CenteredSpinner";
import { DashboardSection } from "../types/types";
import { useMoneyFormatter } from "../app/hooks/useMoneyFormatter";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type BillingResponse = {
  monthlyTotal: number;
  annualEstimate: number;
  remainingEstimate: number | null;
  ribComplete: boolean;
  rib: { bankName: string; ibanLast4: string } | null;
  schoolYear: {
    name: string;
    startDate: string;
    endDate: string;
    totalMonths: number | null;
    elapsedMonths: number | null;
    remainingMonths: number | null;
  } | null;
  children: {
    id: string;
    firstName: string;
    lastName: string;
    status: string;
    className: string | null;
    monthlyFee: number;
  }[];
};

export default function ParentBillingSection({
  setActiveSectionAction,
}: {
  setActiveSectionAction: Dispatch<SetStateAction<DashboardSection>>;
}) {
  const t = useTranslations("ParentBilling");
  const fmtMoney = useMoneyFormatter();
  const tStatus = useTranslations("Dashboard");
  const { data, isLoading } = useSWR<BillingResponse>(
    "/api/parent/billing",
    fetcher,
    { refreshInterval: 60_000 }
  );

  if (isLoading || !data) return <CenteredSpinner label={t("loading")} />;

  const {
    monthlyTotal,
    annualEstimate,
    remainingEstimate,
    ribComplete,
    rib,
    schoolYear,
    children,
  } = data;

  const progressPct =
    schoolYear?.totalMonths && schoolYear.elapsedMonths !== null
      ? Math.min(
          100,
          Math.round(
            (schoolYear.elapsedMonths / schoolYear.totalMonths) * 100
          )
        )
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
        <p className="text-sm text-gray-500">{t("subtitle")}</p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
        <Info className="mt-0.5 h-4 w-4 flex-none" />
        <p>{t("disclaimer")}</p>
      </div>

      {/* Top summary */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-[#fef1ea] via-white to-white p-6 lg:col-span-2">
          <p className="text-xs uppercase tracking-wide text-[#f84a00]">
            {t("monthlyLabel")}
          </p>
          <p className="mt-1 text-4xl font-semibold text-gray-900">
            {fmtMoney(monthlyTotal)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {t("monthlyHint", { count: children.length })}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Stat
              icon={<Receipt className="h-4 w-4" />}
              label={t("annualLabel")}
              value={fmtMoney(annualEstimate)}
            />
            {remainingEstimate !== null && (
              <Stat
                icon={<CalendarRange className="h-4 w-4" />}
                label={t("remainingLabel")}
                value={fmtMoney(remainingEstimate)}
              />
            )}
          </div>
        </div>

        {/* Payment method */}
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              {t("paymentMethodTitle")}
            </h2>
            {ribComplete ? (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                {t("ribActive")}
              </Badge>
            ) : (
              <Badge className="bg-[#fef1ea] text-[#f84a00] hover:bg-[#fef1ea]">
                <AlertCircle className="mr-1 h-3 w-3" />
                {t("ribMissing")}
              </Badge>
            )}
          </div>

          {ribComplete && rib ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CreditCard className="h-4 w-4 text-gray-400" />
                {rib.bankName}
              </div>
              <p className="font-mono text-xs tracking-wider text-gray-500">
                IBAN •••• {rib.ibanLast4}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full cursor-pointer"
                onClick={() => setActiveSectionAction("rib")}
              >
                {t("manageRib")}
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">{t("ribMissingHint")}</p>
              <Button
                size="sm"
                className="mt-2 w-full cursor-pointer"
                onClick={() => setActiveSectionAction("rib")}
              >
                {t("setupRib")}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* School year progress */}
      {schoolYear && (
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                {t("schoolYearTitle")}
              </h2>
              <p className="text-xs text-gray-500">{schoolYear.name}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-gray-900">
                {progressPct}%
              </p>
              {schoolYear.remainingMonths !== null && (
                <p className="text-xs text-gray-500">
                  {t("monthsRemaining", { count: schoolYear.remainingMonths })}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-[#f84a00] transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-gray-500">
            <span>
              {new Date(schoolYear.startDate).toLocaleDateString()}
            </span>
            <span>{new Date(schoolYear.endDate).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* Per-child breakdown */}
      <div className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-900">
          {t("breakdownTitle")}
        </h2>
        <p className="mb-4 text-xs text-gray-500">{t("breakdownSubtitle")}</p>
        {children.length === 0 ? (
          <div className="rounded-lg border border-dashed border-black/10 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
            {t("noChildren")}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-black/10">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">{t("colChild")}</th>
                  <th className="px-4 py-3 text-left">{t("colClass")}</th>
                  <th className="px-4 py-3 text-left">{t("colStatus")}</th>
                  <th className="px-4 py-3 text-right">{t("colMonthly")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {children.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
                          {(c.firstName[0] ?? "") + (c.lastName[0] ?? "")}
                        </span>
                        <span className="text-gray-900">
                          {c.firstName} {c.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {c.className ?? (
                        <span className="italic text-gray-400">
                          {t("noClass")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} t={tStatus} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {fmtMoney(c.monthlyFee)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 text-sm font-semibold">
                <tr>
                  <td className="px-4 py-3" colSpan={3}>
                    {t("totalMonthly")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {fmtMoney(monthlyTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Help / next steps */}
      <div className="rounded-2xl border border-black/10 bg-white p-6">
        <div className="mb-3 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900">
            {t("helpTitle")}
          </h2>
        </div>
        <p className="text-sm text-gray-600">{t("helpBody")}</p>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function StatusBadge({
  status,
  t,
}: {
  status: string;
  t: ReturnType<typeof useTranslations>;
}) {
  if (status === "ACCEPTED")
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        {t("statusAccepted")}
      </Badge>
    );
  if (status === "PENDING")
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
        {t("statusPending")}
      </Badge>
    );
  if (status === "REJECTED")
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
        {t("statusRejected")}
      </Badge>
    );
  return <Badge variant="outline">{status}</Badge>;
}
