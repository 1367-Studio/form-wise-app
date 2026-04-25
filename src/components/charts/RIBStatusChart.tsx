"use client";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

const COLORS = ["#22c55e", "#ef4444"];

export default function RIBStatusChart() {
  const t = useTranslations("Charts");
  const [data, setData] = useState([
    { name: t("ribUpdated"), value: 0 },
    { name: t("ribMissing"), value: 0 },
  ]);

  useEffect(() => {
    fetch("/api/rib/status")
      .then((res) => res.json())
      .then((stats) => {
        setData([
          { name: t("ribUpdated"), value: stats.ribOk },
          { name: t("ribMissing"), value: stats.ribMissing },
        ]);
      });
  }, [t]);

  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-lg font-semibold mb-4 text-center">
          {t("ribStatusTitle")}
        </p>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart width={300} height={200}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={60}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
