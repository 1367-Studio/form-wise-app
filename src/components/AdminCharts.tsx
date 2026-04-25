"use client";

import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { useTranslations } from "next-intl";

type Bucket = {
  key: string;
  label: string;
  signups: number;
  trial: number;
  monthly: number;
  annual: number;
};

type Timeseries = { buckets: Bucket[] };

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminCharts() {
  const t = useTranslations("AdminCharts");
  const tKpi = useTranslations("AdminKpi");
  const { data, isLoading, error } = useSWR<Timeseries>(
    "/api/superadmin/stats/timeseries",
    fetcher
  );

  const buckets = data?.buckets ?? [];
  const totalTrial = buckets.reduce((a, b) => a + b.trial, 0);
  const totalMonthly = buckets.reduce((a, b) => a + b.monthly, 0);
  const totalAnnual = buckets.reduce((a, b) => a + b.annual, 0);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {t("schoolsByMonthTitle")}
          </h2>
          {isLoading ? (
            <div className="h-[250px] animate-pulse rounded bg-gray-100" />
          ) : error ? (
            <p className="text-sm text-red-600">{tKpi("loadError")}</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={buckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00000010" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="trial" stackId="a" fill="#f59e0b" name="Trial" />
                <Bar
                  dataKey="monthly"
                  stackId="a"
                  fill="#f84a00"
                  name="Monthly"
                />
                <Bar
                  dataKey="annual"
                  stackId="a"
                  fill="#000000"
                  name="Annual"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {t("planDistributionTitle")}
          </h2>
          {isLoading ? (
            <div className="h-[250px] animate-pulse rounded bg-gray-100" />
          ) : (
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-center justify-between rounded-lg border border-black/10 bg-amber-50 px-4 py-3">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  {t("freeTrialDistribution", { count: totalTrial })}
                </span>
                <span className="font-semibold text-gray-900">{totalTrial}</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-black/10 bg-[#fef1ea] px-4 py-3">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f84a00]" />
                  {t("monthlyDistribution", { count: totalMonthly })}
                </span>
                <span className="font-semibold text-gray-900">
                  {totalMonthly}
                </span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-black/10 bg-gray-50 px-4 py-3">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-black" />
                  {t("annualDistribution", { count: totalAnnual })}
                </span>
                <span className="font-semibold text-gray-900">
                  {totalAnnual}
                </span>
              </li>
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
