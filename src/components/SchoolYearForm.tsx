"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { fr, enGB, ptBR, es } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";

const dateLocales = { fr, en: enGB, pt: ptBR, es } as const;

export default function SchoolYearForm({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const t = useTranslations("SchoolYearForm");
  const locale = useLocale() as keyof typeof dateLocales;
  const dfLocale = dateLocales[locale] ?? fr;

  const [formData, setFormData] = useState<{
    name: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({
    name: "",
    startDate: undefined,
    endDate: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/school-year", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        startDate: formData.startDate?.toISOString(),
        endDate: formData.endDate?.toISOString(),
      }),
      credentials: "include",
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      setSuccessMessage(t("successCreated", { name: data.schoolYear.name }));
      setFormData({ name: "", startDate: undefined, endDate: undefined });
      onCreated();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {successMessage && (
        <div className="text-green-600 bg-green-100 border border-green-300 rounded p-3">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label>{t("nameLabel")}</Label>
        <Input
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("startDateLabel")}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full cursor-pointer justify-start text-left font-normal"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              {formData.startDate
                ? format(formData.startDate, "dd/MM/yyyy", { locale: dfLocale })
                : t("selectDate")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.startDate}
              onSelect={(date) => setFormData({ ...formData, startDate: date })}
              locale={dfLocale}
              fromYear={2000}
              toYear={2030}
              captionLayout="dropdown"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("endDateLabel")}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal cursor-pointer"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              {formData.endDate
                ? format(formData.endDate, "dd/MM/yyyy", { locale: dfLocale })
                : t("selectDate")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.endDate}
              onSelect={(date) => setFormData({ ...formData, endDate: date })}
              locale={dfLocale}
              fromYear={2000}
              toYear={2030}
              captionLayout="dropdown"
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button type="submit" disabled={loading} className="cursor-pointer">
        {loading ? t("creating") : t("createButton")}
      </Button>
    </form>
  );
}
