"use client";

import useSWR from "swr";
import { useTranslations } from "next-intl";

type Stats = {
  tenants: { total: number; active: number; trial: number; expired: number };
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminConversionFunnel() {
  const t = useTranslations("Funnel");
  const { data } = useSWR<Stats>("/api/superadmin/stats", fetcher);

  const total = data?.tenants.total ?? 0;
  const trial = data?.tenants.trial ?? 0;
  const active = data?.tenants.active ?? 0;
  const expired = data?.tenants.expired ?? 0;

  const trialToPaid =
    trial + active === 0 ? 0 : Math.round((active / (trial + active)) * 100);
  const churn = total === 0 ? 0 : Math.round((expired / total) * 100);

  const stages = [
    { label: t("stageSignup"), value: total, percent: 100 },
    {
      label: t("stageTrial"),
      value: trial,
      percent: total === 0 ? 0 : Math.round((trial / total) * 100),
    },
    {
      label: t("stagePaid"),
      value: active,
      percent: total === 0 ? 0 : Math.round((active / total) * 100),
    },
    {
      label: t("stageChurn"),
      value: expired,
      percent: total === 0 ? 0 : Math.round((expired / total) * 100),
    },
  ];

  const colors = ["bg-gray-900", "bg-amber-500", "bg-[#f84a00]", "bg-red-500"];

  return (
    <div className="rounded-xl border border-black/10 bg-white p-6">
      <div className="mb-1 text-base font-semibold text-gray-900">
        {t("title")}
      </div>
      <p className="mb-6 text-sm text-gray-500">{t("subtitle")}</p>

      <ul className="space-y-3">
        {stages.map((stage, i) => (
          <li key={stage.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-gray-700">{stage.label}</span>
              <span className="font-semibold text-gray-900">
                {stage.value} <span className="text-xs text-gray-400">({stage.percent}%)</span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full ${colors[i]} transition-all`}
                style={{ width: `${stage.percent}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-black/10 pt-4">
        <div>
          <div className="text-xs uppercase tracking-[0.12em] text-gray-500">
            {t("rateTrialToPaid")}
          </div>
          <div className="mt-1 text-2xl font-semibold text-[#f84a00]">
            {trialToPaid}%
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.12em] text-gray-500">
            {t("rateChurn")}
          </div>
          <div className="mt-1 text-2xl font-semibold text-red-600">
            {churn}%
          </div>
        </div>
      </div>
    </div>
  );
}
