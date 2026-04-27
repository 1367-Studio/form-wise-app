"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";
import { useTranslations } from "next-intl";

type Class = {
  id: string;
  name: string;
  monthlyFee: number;
  schoolYear: {
    name: string;
  };
};

export default function ClassList() {
  const t = useTranslations("ClassList");
  const [classes, setClasses] = useState<Class[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchClasses = async () => {
    const res = await fetch("/api/classes", { credentials: "include" });
    const data = await res.json();
    setClasses(data.classes || []);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/classes/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await res.json();
    if (data.success) {
      setClasses((prev) => prev.filter((cls) => cls.id !== id));
    }
  };

  if (classes.length === 0) {
    return <p className="text-muted-foreground mt-6">{t("emptyState")}</p>;
  }

  return (
    <div className="mt-6">
      {isMobile ? (
        <div className="space-y-4">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="rounded border p-4 shadow-sm space-y-2"
            >
              <p className="font-semibold">{cls.name}</p>
              <p className="text-sm text-muted-foreground">
                {t("yearLabel")} {cls.schoolYear.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("feeLabel")} {t("feePerMonth", { fee: cls.monthlyFee })}
              </p>
              <Button
                className="cursor-pointer"
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(cls.id)}
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
                <th className="px-4 py-3 text-left">{t("headerClass")}</th>
                <th className="px-4 py-3 text-left">{t("headerYear")}</th>
                <th className="px-4 py-3 text-left">{t("headerFee")}</th>
                <th className="px-4 py-3 text-right">{t("headerActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2 font-medium">{cls.name}</td>
                  <td className="px-4 py-2">{cls.schoolYear.name}</td>
                  <td className="px-4 py-2">
                    {t("feeAmount", { fee: cls.monthlyFee })}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(cls.id)}
                      className="cursor-pointer"
                    >
                      <UserX className="h-4 w-4 mr-1 cursor-pointer" />
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
