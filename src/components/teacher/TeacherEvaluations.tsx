"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { toast } from "sonner";
import {
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  BarChart3,
  ListChecks,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { SectionSkeleton } from "@/components/SectionSkeleton";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Evaluation {
  id: string;
  title: string;
  description: string | null;
  date: string;
  maxScore: number;
  coefficient: number;
  type: string;
  className: string;
  subjectName: string;
  gradedCount: number;
  average: number | null;
}

interface Grade {
  id: string;
  score: number | null;
  absent: boolean;
  comment: string | null;
  student: { id: string; firstName: string; lastName: string };
}

interface EvaluationDetail {
  id: string;
  title: string;
  date: string;
  maxScore: number;
  type: string;
  grades: Grade[];
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface GradeRow {
  studentId: string;
  firstName: string;
  lastName: string;
  score: string;
  absent: boolean;
  comment: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const TYPE_BADGE: Record<string, string> = {
  EXAM: "bg-blue-100 text-blue-700",
  QUIZ: "bg-purple-100 text-purple-700",
  HOMEWORK: "bg-amber-100 text-amber-700",
  ORAL: "bg-emerald-100 text-emerald-700",
  PROJECT: "bg-indigo-100 text-indigo-700",
};

const EVAL_TYPES = ["EXAM", "QUIZ", "HOMEWORK", "ORAL", "PROJECT"] as const;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TeacherEvaluations() {
  const t = useTranslations("TeacherEvaluations");

  /* ---- data ---- */
  const {
    data: listData,
    error: listError,
    isLoading: listLoading,
    mutate: mutateList,
  } = useSWR<{ evaluations: Evaluation[] }>(
    "/api/teacher/evaluations",
    fetcher,
  );
  const evaluations = listData?.evaluations ?? [];

  /* ---- grading sheet ---- */
  const [gradingId, setGradingId] = useState<string | null>(null);
  const {
    data: detailData,
    isLoading: detailLoading,
  } = useSWR<{ evaluation: EvaluationDetail; students: Student[] }>(
    gradingId ? `/api/teacher/evaluations/${gradingId}` : null,
    fetcher,
  );

  const [gradeRows, setGradeRows] = useState<GradeRow[]>([]);
  const [savingGrades, setSavingGrades] = useState(false);

  const openGrading = useCallback((id: string) => {
    setGradingId(id);
  }, []);

  // Sync grade rows when detail loads
  const buildGradeRows = useCallback(
    (detail: EvaluationDetail, students: Student[]): GradeRow[] => {
      const gradeMap = new Map(
        detail.grades.map((g) => [g.student.id, g]),
      );
      return students.map((s) => {
        const existing = gradeMap.get(s.id);
        return {
          studentId: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          score: existing?.score != null ? String(existing.score) : "",
          absent: existing?.absent ?? false,
          comment: existing?.comment ?? "",
        };
      });
    },
    [],
  );

  // When detail data arrives, populate rows
  const currentDetailKey = detailData?.evaluation?.id;
  const [loadedDetailKey, setLoadedDetailKey] = useState<string | null>(null);
  if (currentDetailKey && currentDetailKey !== loadedDetailKey && !detailLoading) {
    setLoadedDetailKey(currentDetailKey);
    setGradeRows(
      buildGradeRows(detailData!.evaluation, detailData!.students),
    );
  }

  const updateGradeRow = (idx: number, field: keyof GradeRow, value: string | boolean) => {
    setGradeRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSaveGrades = async () => {
    if (!gradingId) return;
    setSavingGrades(true);
    try {
      const grades = gradeRows.map((r) => ({
        studentId: r.studentId,
        score: r.score !== "" ? Number(r.score) : null,
        absent: r.absent,
        comment: r.comment || null,
      }));
      const res = await fetch(`/api/teacher/evaluations/${gradingId}/grades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grades }),
      });
      if (res.ok) {
        toast.success(t("saved"));
        await mutateList();
        setGradingId(null);
        setLoadedDetailKey(null);
      } else {
        toast.error(t("saveFailed"));
      }
    } catch {
      toast.error(t("saveFailed"));
    } finally {
      setSavingGrades(false);
    }
  };

  /* ---- create dialog ---- */
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newType, setNewType] = useState<string>("EXAM");
  const [newMaxScore, setNewMaxScore] = useState("20");
  const [newCoefficient, setNewCoefficient] = useState("1");

  const resetCreateForm = () => {
    setNewTitle("");
    setNewDate("");
    setNewType("EXAM");
    setNewMaxScore("20");
    setNewCoefficient("1");
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newDate) return;
    setCreating(true);
    try {
      const res = await fetch("/api/teacher/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          date: newDate,
          type: newType,
          maxScore: Number(newMaxScore) || 20,
          coefficient: Number(newCoefficient) || 1,
        }),
      });
      if (res.ok) {
        toast.success(t("saved"));
        await mutateList();
        setCreateOpen(false);
        resetCreateForm();
      } else {
        toast.error(t("saveFailed"));
      }
    } catch {
      toast.error(t("saveFailed"));
    } finally {
      setCreating(false);
    }
  };

  /* ---- delete ---- */
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/teacher/evaluations/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(t("saved"));
        await mutateList();
        setDeleteId(null);
      } else {
        toast.error(t("saveFailed"));
      }
    } catch {
      toast.error(t("saveFailed"));
    } finally {
      setDeleting(false);
    }
  };

  /* ---- KPI helpers ---- */
  const totalEvals = evaluations.length;
  const gradedEvals = evaluations.filter((e) => e.gradedCount > 0).length;
  const overallAvg =
    evaluations.length > 0
      ? evaluations.reduce((sum, e) => sum + (e.average ?? 0), 0) /
        evaluations.filter((e) => e.average != null).length
      : null;

  /* ---- type label ---- */
  const typeLabel = (type: string) => {
    const key = `type${type.charAt(0)}${type.slice(1).toLowerCase()}` as
      | "typeExam"
      | "typeQuiz"
      | "typeHomework"
      | "typeOral"
      | "typeProject";
    return t(key);
  };

  /* ---- render ---- */
  if (listLoading) {
    return (
      <div className="space-y-6">
        <SectionSkeleton variant="stats" />
        <SectionSkeleton variant="table" rows={6} />
      </div>
    );
  }

  if (listError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
        {t("loadError")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-gray-500">{t("description")}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          {t("newEvaluation")}
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <ListChecks className="h-4 w-4" />
            {t("evaluationsPlanned")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{totalEvals}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <CheckCircle className="h-4 w-4" />
            {t("completed")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{gradedEvals}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <BarChart3 className="h-4 w-4" />
            {t("averageScore")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {overallAvg != null && !isNaN(overallAvg)
              ? `${overallAvg.toFixed(1)}/20`
              : "--/20"}
          </p>
        </div>
      </div>

      {/* Evaluations table */}
      {evaluations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
            <ClipboardList className="h-6 w-6" />
          </div>
          <p className="text-sm text-gray-500">{t("noEvaluations")}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">{t("titleLabel")}</th>
                  <th className="px-4 py-3">{t("dateLabel")}</th>
                  <th className="px-4 py-3">{t("typeLabel")}</th>
                  <th className="px-4 py-3">{t("classLabel")}</th>
                  <th className="px-4 py-3">{t("subjectLabel")}</th>
                  <th className="px-4 py-3">{t("graded")}</th>
                  <th className="px-4 py-3">{t("average")}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {evaluations.map((ev) => (
                  <tr key={ev.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {ev.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(ev.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[ev.type] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {typeLabel(ev.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{ev.className}</td>
                    <td className="px-4 py-3 text-gray-600">{ev.subjectName}</td>
                    <td className="px-4 py-3 text-gray-600">{ev.gradedCount}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {ev.average != null ? `${ev.average.toFixed(1)}/20` : "--"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openGrading(ev.id)}
                        >
                          <Pencil className="mr-1 h-3.5 w-3.5" />
                          {t("grade")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteId(ev.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---- Grading Sheet ---- */}
      <Sheet
        open={gradingId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setGradingId(null);
            setLoadedDetailKey(null);
          }
        }}
      >
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {detailData?.evaluation?.title ?? "..."}
            </SheetTitle>
            <SheetDescription>
              {t("maxScoreLabel")}: {detailData?.evaluation?.maxScore ?? 20}
            </SheetDescription>
          </SheetHeader>

          {detailLoading ? (
            <div className="py-8">
              <SectionSkeleton variant="table" rows={5} />
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    <th className="px-2 py-2">{t("student")}</th>
                    <th className="px-2 py-2">{t("score")}</th>
                    <th className="px-2 py-2">{t("absent")}</th>
                    <th className="px-2 py-2">{t("comment")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {gradeRows.map((row, idx) => (
                    <tr key={row.studentId}>
                      <td className="px-2 py-2 text-gray-900 whitespace-nowrap">
                        {row.lastName} {row.firstName}
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          type="number"
                          min={0}
                          max={detailData?.evaluation?.maxScore ?? 20}
                          step="0.5"
                          className="w-20"
                          value={row.score}
                          disabled={row.absent}
                          onChange={(e) =>
                            updateGradeRow(idx, "score", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Checkbox
                          checked={row.absent}
                          onCheckedChange={(checked) =>
                            updateGradeRow(idx, "absent", Boolean(checked))
                          }
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          className="w-32"
                          value={row.comment}
                          onChange={(e) =>
                            updateGradeRow(idx, "comment", e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <SheetFooter className="mt-4">
            <Button
              onClick={handleSaveGrades}
              disabled={savingGrades}
            >
              {savingGrades ? t("saving") : t("saveGrades")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ---- Create Evaluation Dialog ---- */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetCreateForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("newEvaluation")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("titleLabel")}</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t("titleLabel")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("dateLabel")}</Label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("typeLabel")}</Label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVAL_TYPES.map((et) => (
                    <SelectItem key={et} value={et}>
                      {typeLabel(et)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("maxScoreLabel")}</Label>
                <Input
                  type="number"
                  min={1}
                  value={newMaxScore}
                  onChange={(e) => setNewMaxScore(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("coefficientLabel")}</Label>
                <Input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={newCoefficient}
                  onChange={(e) => setNewCoefficient(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newTitle.trim() || !newDate || creating}
            >
              {t("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Delete Confirmation Dialog ---- */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmDelete")}</DialogTitle>
            <DialogDescription>{t("deleteDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
