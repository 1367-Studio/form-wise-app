"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface SchoolYear {
  id: string;
  name: string;
}

export default function ClassForm({ onCreated }: { onCreated: () => void }) {
  const t = useTranslations("ClassForm");
  const [formData, setFormData] = useState({
    name: "",
    monthlyFee: "",
    schoolYearId: "",
  });

  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchSchoolYears = async () => {
      const res = await fetch("/api/school-year", { credentials: "include" });
      const data = await res.json();
      setSchoolYears(data.schoolYears || []);
    };
    fetchSchoolYears();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: formData.name,
        monthlyFee: parseFloat(formData.monthlyFee),
        schoolYearId: formData.schoolYearId,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      setSuccess(t("successCreated", { name: data.class.name }));
      setFormData({ name: "", monthlyFee: "", schoolYearId: "" });
      onCreated();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {success && (
        <div className="text-green-600 bg-green-100 border border-green-300 rounded p-3">
          {success}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label>{t("nameLabel")}</Label>
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("monthlyFeeLabel")}</Label>
        <Input
          type="number"
          name="monthlyFee"
          value={formData.monthlyFee}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("schoolYearLabel")}</Label>
        <Select
          onValueChange={(value) =>
            setFormData({ ...formData, schoolYearId: value })
          }
          value={formData.schoolYearId}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("schoolYearPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {schoolYears.map((year) => (
              <SelectItem key={year.id} value={year.id}>
                {year.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading} className="cursor-pointer">
        {loading ? t("creating") : t("createButton")}
        <Plus />
      </Button>
    </form>
  );
}
