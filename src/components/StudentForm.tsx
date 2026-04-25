"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { fr, enGB, ptBR, es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";

const dateLocales = { fr, en: enGB, pt: ptBR, es } as const;

interface ClassOption {
  id: string;
  name: string;
  monthlyFee: number;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  address: string;
  hasHealthIssues: boolean;
  healthDetails: string;
  canLeaveAlone: boolean;
  classId: string;
}

export default function StudentForm({
  onStudentAdded,
}: {
  onStudentAdded: (student: Student) => void;
}) {
  const t = useTranslations("StudentForm");
  const locale = useLocale() as keyof typeof dateLocales;
  const dfLocale = dateLocales[locale] ?? fr;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: undefined as Date | undefined,
    address: "",
    hasHealthIssues: "no",
    healthDetails: "",
    canLeaveAlone: "no",
    classId: "",
  });

  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetch("/api/classes/public")
      .then((res) => res.json())
      .then((data) => setClasses(data.classes || []));
  }, []);

  const selectedClass = classes.find((cls) => cls.id === formData.classId);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.classId) {
      setFormError(t("errorClassRequired"));
      return;
    }

    setLoading(true);

    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        hasHealthIssues: formData.hasHealthIssues === "yes",
        canLeaveAlone: formData.canLeaveAlone === "yes",
        birthDate: formData.birthDate?.toISOString(),
      }),
      credentials: "include",
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      onStudentAdded(data.student);
      toast.success(t("successMessage"));

      setFormData({
        firstName: "",
        lastName: "",
        birthDate: undefined,
        address: "",
        hasHealthIssues: "no",
        healthDetails: "",
        canLeaveAlone: "no",
        classId: "",
      });
    }
  };

  const requiredHint = (
    <span className="text-gray-400 text-xs italic">{t("requiredHint")}</span>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label>
              {t("firstNameLabel")} {requiredHint}
            </Label>
            <Input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              {t("lastNameLabel")} {requiredHint}
            </Label>
            <Input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              {t("birthDateLabel")} {requiredHint}
            </Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal w-full cursor-pointer"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.birthDate ? (
                    format(formData.birthDate, "PPP", { locale: dfLocale })
                  ) : (
                    <span>{t("selectDate")}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.birthDate}
                  onSelect={(date) => {
                    setFormData({ ...formData, birthDate: date });
                    setCalendarOpen(false);
                  }}
                  locale={dfLocale}
                  captionLayout="dropdown"
                  startMonth={new Date(1980, 0)}
                  endMonth={new Date(2025, 0)}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              {t("addressLabel")} {requiredHint}
            </Label>
            <Input
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="md:col-span-2 flex flex-col gap-2">
            <Label>
              {t("classLabel")} {requiredHint}
            </Label>
            <Select
              value={formData.classId}
              onValueChange={(value) =>
                setFormData({ ...formData, classId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("classPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formError && (
              <p className="text-sm text-red-500 mt-1">{formError}</p>
            )}
            {selectedClass && (
              <p className="text-sm text-muted-foreground mt-1">
                {t("monthlyFee", {
                  fee: selectedClass.monthlyFee.toFixed(2),
                })}
              </p>
            )}
          </div>

          <div className="md:col-span-2 flex flex-col gap-2">
            <Label>
              {t("healthIssuesLabel")} {requiredHint}
            </Label>
            <RadioGroup
              name="hasHealthIssues"
              defaultValue="no"
              onValueChange={(value) =>
                setFormData({ ...formData, hasHealthIssues: value })
              }
            >
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="no-health" />
                  <Label htmlFor="no-health">{t("no")}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="yes-health" />
                  <Label htmlFor="yes-health">{t("yes")}</Label>
                </div>
              </div>
            </RadioGroup>
            {formData.hasHealthIssues === "yes" && (
              <div className="mt-2 flex flex-col gap-2">
                <Label>
                  {t("healthDetailsLabel")} {requiredHint}
                </Label>
                <Textarea
                  name="healthDetails"
                  value={formData.healthDetails}
                  onChange={handleChange}
                  placeholder={t("healthDetailsPlaceholder")}
                  required
                />
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex flex-col gap-2">
            <Label>
              {t("canLeaveAloneLabel")} {requiredHint}
            </Label>
            <RadioGroup
              name="canLeaveAlone"
              defaultValue="no"
              onValueChange={(value) =>
                setFormData({ ...formData, canLeaveAlone: value })
              }
            >
              <div className="flex gap-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="no-alone" />
                  <Label htmlFor="no-alone">{t("no")}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="yes-alone" />
                  <Label htmlFor="yes-alone">{t("yes")}</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="md:col-span-2">
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={loading || !formData.classId}
            >
              {loading && <Loader2Icon className="animate-spin mr-2 h-4 w-4" />}
              {loading ? t("submitting") : t("submitButton")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
