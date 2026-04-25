"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, UserX } from "lucide-react";
import { useTranslations } from "next-intl";
import CenteredSpinner from "./CenteredSpinner";

type SchoolYear = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

export default function SchoolYearList() {
  const t = useTranslations("SchoolYearList");
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchSchoolYears = async () => {
    setLoading(true);
    const res = await fetch("/api/school-year", {
      credentials: "include",
    });
    const data = await res.json();
    setSchoolYears(data.schoolYears || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm(t("confirmDelete"));
    if (!confirm) return;

    const res = await fetch(`/api/school-year/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      setSchoolYears((prev) => prev.filter((y) => y.id !== id));
    }
  };

  useEffect(() => {
    fetchSchoolYears();
  }, []);

  if (loading) {
    return <CenteredSpinner label={t("loading")} />;
  }

  if (schoolYears.length === 0) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 mt-6">
        <AlertTriangle className="w-4 h-4" />
        {t("emptyState")}
      </div>
    );
  }

  return (
    <div className="mt-6">
      {isMobile ? (
        <div className="space-y-4">
          {schoolYears.map((year) => (
            <div
              key={year.id}
              className="rounded border p-4 shadow-sm space-y-2"
            >
              <p className="font-semibold">{year.name}</p>
              <p className="text-sm text-muted-foreground">
                {t("fromTo", {
                  start: new Date(year.startDate).toLocaleDateString(),
                  end: new Date(year.endDate).toLocaleDateString(),
                })}
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(year.id)}
                className="cursor-pointer"
              >
                <UserX className="h-4 w-4 mr-1" />
                {t("delete")}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">{t("headerYear")}</th>
                <th className="px-4 py-3 text-left">{t("headerStart")}</th>
                <th className="px-4 py-3 text-left">{t("headerEnd")}</th>
                <th className="px-4 py-3 text-right">{t("headerActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {schoolYears.map((year) => (
                <tr key={year.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2 font-medium">{year.name}</td>
                  <td className="px-4 py-2">
                    {new Date(year.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(year.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() => handleDelete(year.id)}
                      size="sm"
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      {t("delete")}
                    </Button>
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
