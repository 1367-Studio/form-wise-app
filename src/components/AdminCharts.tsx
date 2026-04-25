"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslations } from "next-intl";

export default function AdminCharts() {
  const t = useTranslations("AdminCharts");
  const mockData = [
    { name: t("monthJan"), schools: 2 },
    { name: t("monthFeb"), schools: 4 },
    { name: t("monthMar"), schools: 7 },
    { name: t("monthApr"), schools: 5 },
    { name: t("monthMay"), schools: 9 },
    { name: t("monthJun"), schools: 6 },
  ];
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {t("schoolsByMonthTitle")}
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="schools" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {t("planDistributionTitle")}
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>{t("freeTrialDistribution", { count: 12 })}</li>
            <li>{t("monthlyDistribution", { count: 8 })}</li>
            <li>{t("annualDistribution", { count: 5 })}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
