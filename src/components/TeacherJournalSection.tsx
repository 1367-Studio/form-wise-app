"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { fr, enGB, ptBR, es } from "date-fns/locale";
import {
  Plus,
  BookOpen,
  CalendarIcon,
  Pencil,
  Trash2,
  Loader2,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar as CalendarUI,
} from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SectionSkeleton } from "./SectionSkeleton";

const dateLocales = { fr, en: enGB, pt: ptBR, es } as const;

type Journal = {
  id: string;
  date: string;
  classId: string;
  subjectId: string | null;
  classSummary: string;
  homework: string;
  createdAt: string;
};

type Subject = { id: string; name: string };

type Response = {
  teacher: {
    id: string;
    classId: string | null;
    className: string | null;
    subjectId: string | null;
    subjectName: string | null;
  } | null;
  subjects: Subject[];
  journals: Journal[];
};

export default function TeacherJournalSection() {
  const t = useTranslations("TeacherJournal");
  const locale = useLocale() as keyof typeof dateLocales;
  const dfLocale = dateLocales[locale] ?? fr;

  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Journal | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Journal | null>(null);

  const [date, setDate] = useState<Date>(new Date());
  const [subjectId, setSubjectId] = useState<string>("none");
  const [classSummary, setClassSummary] = useState("");
  const [homework, setHomework] = useState("");
  const [calOpen, setCalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/journal");
      if (!res.ok) {
        setData({ teacher: null, subjects: [], journals: [] });
        return;
      }
      const d = await res.json();
      setData({
        teacher: d?.teacher ?? null,
        subjects: Array.isArray(d?.subjects) ? d.subjects : [],
        journals: Array.isArray(d?.journals) ? d.journals : [],
      });
    } catch {
      setData({ teacher: null, subjects: [], journals: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const subjectMap = useMemo(() => {
    const m = new Map<string, string>();
    (data?.subjects ?? []).forEach((s) => m.set(s.id, s.name));
    return m;
  }, [data]);

  const resetForm = () => {
    setDate(new Date());
    setSubjectId("none");
    setClassSummary("");
    setHomework("");
    setEditing(null);
  };

  const openNew = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (j: Journal) => {
    setEditing(j);
    setDate(new Date(j.date));
    setSubjectId(j.subjectId ?? "none");
    setClassSummary(j.classSummary);
    setHomework(j.homework);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!classSummary.trim() || !homework.trim()) {
      toast.error(t("missingFields"));
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        date: date.toISOString(),
        subjectId: subjectId === "none" ? null : subjectId,
        classSummary,
        homework,
      };
      const res = editing
        ? await fetch(`/api/teacher/journal/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/teacher/journal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const json = await res.json();
      if (res.ok) {
        toast.success(editing ? t("updated") : t("created"));
        setOpen(false);
        resetForm();
        fetchData();
      } else {
        toast.error(json?.error || t("saveFailed"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/teacher/journal/${confirmDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(t("deleted"));
        setConfirmDelete(null);
        fetchData();
      } else {
        toast.error(t("deleteFailed"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !data) return <SectionSkeleton variant="list" rows={5} />;

  if (!data.teacher) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <GraduationCap className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          {t("noProfileTitle")}
        </h2>
        <p className="mt-1 max-w-sm text-sm text-gray-500">
          {t("noProfileHint")}
        </p>
      </div>
    );
  }

  if (!data.teacher.classId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <GraduationCap className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          {t("noClassTitle")}
        </h2>
        <p className="mt-1 max-w-sm text-sm text-gray-500">
          {t("noClassHint")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
          <p className="text-sm text-gray-500">
            {t("subtitle", { className: data.teacher.className ?? "" })}
          </p>
        </div>
        <Button className="cursor-pointer" onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" />
          {t("newEntry")}
        </Button>
      </div>

      {data.journals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fef1ea] text-[#f84a00]">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {t("emptyTitle")}
          </h2>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            {t("emptyHint")}
          </p>
          <Button className="mt-6 cursor-pointer" onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" />
            {t("newEntry")}
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {data.journals.map((j) => (
            <li
              key={j.id}
              className="rounded-2xl border border-black/10 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {format(new Date(j.date), "PPP", { locale: dfLocale })}
                    </p>
                    {j.subjectId && subjectMap.has(j.subjectId) && (
                      <Badge
                        variant="outline"
                        className="border-black/10 bg-gray-50 text-[10px] text-gray-700"
                      >
                        {subjectMap.get(j.subjectId)}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="cursor-pointer"
                    onClick={() => openEdit(j)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="cursor-pointer text-gray-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => setConfirmDelete(j)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {t("classSummary")}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">
                    {j.classSummary}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#f84a00]">
                    {t("homework")}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">
                    {j.homework}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add/Edit dialog */}
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) resetForm();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? t("editTitle") : t("newTitle")}
            </DialogTitle>
            <DialogDescription>{t("dialogSubtitle")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("date")}</Label>
                <Popover open={calOpen} onOpenChange={setCalOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal cursor-pointer"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(date, "PPP", { locale: dfLocale })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarUI
                      mode="single"
                      selected={date}
                      onSelect={(d) => {
                        if (d) setDate(d);
                        setCalOpen(false);
                      }}
                      locale={dfLocale}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>{t("subjectOptional")}</Label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("subjectNone")}</SelectItem>
                    {data.subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("classSummary")}</Label>
              <Textarea
                value={classSummary}
                onChange={(e) => setClassSummary(e.target.value)}
                rows={4}
                placeholder={t("classSummaryPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("homework")}</Label>
              <Textarea
                value={homework}
                onChange={(e) => setHomework(e.target.value)}
                rows={4}
                placeholder={t("homeworkPlaceholder")}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              {t("cancel")}
            </Button>
            <Button
              className="cursor-pointer"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editing ? t("save") : t("publish")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("deleteTitle")}</DialogTitle>
            <DialogDescription>{t("deleteConfirm")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setConfirmDelete(null)}
              disabled={submitting}
            >
              {t("cancel")}
            </Button>
            <Button
              className="cursor-pointer bg-red-600 text-white hover:bg-red-700"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? t("deleting") : t("confirmDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

