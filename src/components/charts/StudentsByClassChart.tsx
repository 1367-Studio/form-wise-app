"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

function getRandomColor(index: number) {
  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#6366f1",
    "#e11d48",
    "#14b8a6",
    "#a855f7",
    "#f97316",
    "#22d3ee",
    "#84cc16",
    "#f43f5e",
    "#0ea5e9",
    "#8b5cf6",
    "#d946ef",
  ];
  return colors[index % colors.length];
}

type Datum = { class: string; [key: string]: string | number };

export default function StudentsByClassChart() {
  const t = useTranslations("Charts");
  const [data, setData] = useState<Datum[]>([]);

  useEffect(() => {
    fetch("/api/students/by-class")
      .then((res) => res.json())
      .then((json) => {
        const remapped: Datum[] = (json || []).map(
          (r: { class: string; élèves?: number; students?: number }) => ({
            class: r.class,
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
          {t("studentsByClassTitle")}
        </p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart width={350} height={250} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="class" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey={t("studentsKey")}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={getRandomColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
