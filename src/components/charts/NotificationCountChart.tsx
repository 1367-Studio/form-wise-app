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

const COLORS = ["#22c55e", "#f97316"];

export default function NotificationReadChart() {
  const t = useTranslations("Charts");
  const [data, setData] = useState([
    { name: t("read"), value: 0 },
    { name: t("unread"), value: 0 },
  ]);

  useEffect(() => {
    fetch("/api/notifications/read-stats")
      .then((res) => res.json())
      .then((stats) => {
        setData([
          { name: t("read"), value: stats.read },
          { name: t("unread"), value: stats.unread },
        ]);
      });
  }, [t]);

  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-lg font-semibold mb-4 text-center">
          {t("globalNotificationsTitle")}
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
