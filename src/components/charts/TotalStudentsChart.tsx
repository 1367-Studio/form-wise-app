"use client";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

type Datum = { year: string; [key: string]: string | number };

export default function TotalStudentsChart() {
  const t = useTranslations("Charts");
  const [data, setData] = useState<Datum[]>([]);

  useEffect(() => {
    fetch("/api/students/count-by-year")
      .then((res) => res.json())
      .then((raw) => {
        const remapped: Datum[] = (raw || []).map(
          (r: { year: string; élèves?: number; students?: number }) => ({
            year: r.year,
            [t("studentsKey")]: r.élèves ?? r.students ?? 0,
          })
        );
        setData(remapped);
      });
  }, [t]);

  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-lg font-semibold mb-4 text-center">
          {t("totalStudentsTitle")}
        </p>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={t("studentsKey")}
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
