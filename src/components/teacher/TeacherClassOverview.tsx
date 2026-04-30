"use client";

import { useTranslations } from "next-intl";
import useSWR from "swr";
import {
  Users,
  BookOpen,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionSkeleton } from "../SectionSkeleton";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type TeacherMeResponse = {
  teacher: {
    id: string;
    classId: string | null;
    className: string | null;
    subjectId: string | null;
    subjectName: string | null;
  } | null;
  subjects: { id: string; name: string }[];
  journals: unknown[];
};

type StudentRow = {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
};

type StudentsResponse = StudentRow[];

export default function TeacherClassOverview() {
  const t = useTranslations("TeacherClassOverview");

  const { data: meData, isLoading: meLoading } = useSWR<TeacherMeResponse>(
    "/api/teacher/journal",
    fetcher,
  );

  const classId = meData?.teacher?.classId ?? null;

  const { data: studentsData, isLoading: studentsLoading } =
    useSWR<StudentsResponse>(
      classId ? "/api/teachers/students" : null,
      fetcher,
    );

  if (meLoading || studentsLoading) {
    return <SectionSkeleton variant="list" rows={6} />;
  }

  const teacher = meData?.teacher;
  const students = studentsData ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("description")}</p>
      </div>

      {/* Class info cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <GraduationCap className="h-4 w-4" />
            {t("className")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {teacher?.className ?? t("noClass")}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <BookOpen className="h-4 w-4" />
            {t("subject")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {teacher?.subjectName ?? t("noSubject")}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <Users className="h-4 w-4" />
            {t("studentCount")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {students.length}
          </p>
        </div>
      </div>

      {/* Student list */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            {t("studentListTitle")}
          </h2>
        </div>
        {students.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-black/15 px-4 py-8 text-center">
            <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <Users className="h-5 w-5" />
            </span>
            <p className="text-sm text-gray-500">{t("noStudents")}</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {students.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-black/5 bg-gray-50 px-3 py-2.5"
              >
                <div className="flex items-center gap-2 text-sm text-gray-900">
                  <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
                  {s.firstName} {s.lastName}
                </div>
                <Badge
                  className={
                    s.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      : s.status === "PENDING"
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                  }
                >
                  {s.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
