"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { BarChart3, BookOpen } from "lucide-react";
import { SectionSkeleton } from "@/components/SectionSkeleton";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface EvaluationInfo {
  id: string;
  title: string;
  date: string;
  maxScore: number;
  coefficient: number;
  type: string;
  subjectName: string;
  className: string;
}

interface GradeItem {
  id: string;
  score: number | null;
  absent: boolean;
  comment: string | null;
  evaluation: EvaluationInfo;
}

interface StudentWithGrades {
  id: string;
  firstName: string;
  lastName: string;
  className: string;
  average: number | null;
  grades: GradeItem[];
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

function scoreColor(score: number, max: number): string {
  const normalized = (score / max) * 20;
  if (normalized >= 14) return "text-emerald-600";
  if (normalized >= 10) return "text-amber-600";
  return "text-red-600";
}

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

export default function ParentGrades() {
  const t = useTranslations("ParentGrades");

  const { data, error, isLoading } = useSWR<{ students: StudentWithGrades[] }>(
    "/api/parent/grades",
    fetcher,
  );

  const students = data?.students ?? [];
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // Auto-select first child when data loads
  const activeId = selectedChildId ?? students[0]?.id ?? null;
  const activeChild = students.find((s) => s.id === activeId) ?? null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SectionSkeleton variant="stats" />
        <SectionSkeleton variant="cards" rows={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
        {t("loadError")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("description")}</p>
      </div>

      {/* Child filter pills */}
      {students.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedChildId(null)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              selectedChildId === null
                ? "bg-[#2563EB] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t("allChildren")}
          </button>
          {students.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedChildId(s.id)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                selectedChildId === s.id
                  ? "bg-[#2563EB] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {s.firstName} {s.lastName}
            </button>
          ))}
        </div>
      )}

      {/* Show single child or all children */}
      {selectedChildId === null && students.length > 1 ? (
        students.map((child) => (
          <ChildGradesSection key={child.id} child={child} t={t} />
        ))
      ) : activeChild ? (
        <ChildGradesSection child={activeChild} t={t} />
      ) : (
        <EmptyState t={t} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function ChildGradesSection({
  child,
  t,
}: {
  child: StudentWithGrades;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="space-y-4">
      {/* Child header */}
      <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF6FF] text-sm font-semibold text-[#2563EB]">
            {child.firstName.charAt(0)}
            {child.lastName.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {child.firstName} {child.lastName}
            </p>
            <p className="text-xs text-gray-500">{child.className}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-500">
            <BarChart3 className="h-3.5 w-3.5" />
            {t("average")}
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {child.average != null ? `${child.average.toFixed(1)}/20` : "--/20"}
          </p>
        </div>
      </div>

      {/* Grades list */}
      {child.grades.length === 0 ? (
        <EmptyState t={t} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {child.grades.map((grade) => (
            <GradeCard key={grade.id} grade={grade} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function GradeCard({
  grade,
  t,
}: {
  grade: GradeItem;
  t: ReturnType<typeof useTranslations>;
}) {
  const ev = grade.evaluation;
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900 truncate">{ev.title}</p>
          <p className="text-xs text-gray-500">{ev.subjectName}</p>
        </div>
        <span
          className={`ml-2 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[ev.type] ?? "bg-gray-100 text-gray-700"}`}
        >
          {ev.type}
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div className="text-xs text-gray-500 space-y-0.5">
          <p>{formatDate(ev.date)}</p>
          <p>
            {t("coefficient")}: {ev.coefficient}
          </p>
        </div>
        {grade.absent ? (
          <span className="text-sm font-medium text-gray-400">
            {t("absent")}
          </span>
        ) : grade.score != null ? (
          <span
            className={`text-2xl font-bold ${scoreColor(grade.score, ev.maxScore)}`}
          >
            {grade.score}
            <span className="text-sm font-normal text-gray-400">
              /{ev.maxScore}
            </span>
          </span>
        ) : (
          <span className="text-sm text-gray-400">{t("noScore")}</span>
        )}
      </div>

      {grade.comment && (
        <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
          {grade.comment}
        </p>
      )}
    </div>
  );
}

function EmptyState({
  t,
}: {
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
        <BookOpen className="h-6 w-6" />
      </div>
      <p className="text-sm text-gray-500">{t("noGrades")}</p>
    </div>
  );
}
