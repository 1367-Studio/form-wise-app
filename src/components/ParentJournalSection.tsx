"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { fr, enGB, ptBR, es } from "date-fns/locale";
import {
  BookOpen,
  Inbox,
  ClipboardList,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionSkeleton } from "./SectionSkeleton";
import { useOptionalSelectedChild } from "@/contexts/SelectedChildContext";

const dateLocales = { fr, en: enGB, pt: ptBR, es } as const;

type Entry = {
  id: string;
  date: string;
  classId: string;
  subjectId: string | null;
  subjectName: string | null;
  teacherName: string | null;
  classSummary: string;
  homework: string;
  isRead: boolean;
  students: { id: string; name: string }[];
  createdAt: string;
};

type StudentLite = {
  id: string;
  firstName: string;
  lastName: string;
  className: string | null;
};

type Response = {
  students: StudentLite[];
  entries: Entry[];
};

function dayKey(iso: string) {
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}

export default function ParentJournalSection() {
  const t = useTranslations("ParentJournal");
  const locale = useLocale() as keyof typeof dateLocales;
  const dfLocale = dateLocales[locale] ?? fr;

  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentFilter, setStudentFilter] = useState<string>("all");

  // Sync local filter with the global child switcher (if available).
  const childCtx = useOptionalSelectedChild();
  useEffect(() => {
    if (!childCtx) return;
    setStudentFilter(childCtx.selectedChildId ?? "all");
  }, [childCtx, childCtx?.selectedChildId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/parent/journal");
      const d = await res.json();
      setData(d);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (studentFilter === "all") return data.entries;
    return data.entries.filter((e) =>
      e.students.some((s) => s.id === studentFilter)
    );
  }, [data, studentFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const e of filtered) {
      const k = dayKey(e.date);
      const list = map.get(k) ?? [];
      list.push(e);
      map.set(k, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => (a < b ? 1 : -1));
  }, [filtered]);

  const unreadCount = useMemo(
    () => filtered.filter((e) => !e.isRead).length,
    [filtered]
  );

  const markRead = async (id: string) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            entries: prev.entries.map((e) =>
              e.id === id ? { ...e, isRead: true } : e
            ),
          }
        : prev
    );
    await fetch("/api/parent/journal/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ journalId: id }),
    });
  };

  if (loading || !data) return <SectionSkeleton variant="list" rows={4} />;

  if (data.students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fef1ea] text-[#f84a00]">
          <GraduationCap className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          {t("noChildrenTitle")}
        </h2>
        <p className="mt-1 max-w-sm text-sm text-gray-500">
          {t("noChildrenHint")}
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
            {unreadCount > 0
              ? t("subtitleUnread", { count: unreadCount })
              : t("subtitleAllRead")}
          </p>
        </div>
      </div>

      {data.students.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <FilterPill
            active={studentFilter === "all"}
            onClick={() => setStudentFilter("all")}
          >
            {t("filterAll")}
          </FilterPill>
          {data.students.map((s) => (
            <FilterPill
              key={s.id}
              active={studentFilter === s.id}
              onClick={() => setStudentFilter(s.id)}
            >
              {s.firstName} {s.lastName}
            </FilterPill>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <Inbox className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {t("emptyTitle")}
          </h2>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            {t("emptyHint")}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([dayIso, entries]) => (
            <div key={dayIso}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {format(new Date(dayIso), "EEEE PPP", { locale: dfLocale })}
              </h3>
              <ul className="space-y-3">
                {entries.map((e) => (
                  <li
                    key={e.id}
                    onMouseEnter={() => !e.isRead && markRead(e.id)}
                    onClick={() => !e.isRead && markRead(e.id)}
                    className={`relative cursor-pointer rounded-2xl border p-5 transition-colors ${
                      e.isRead
                        ? "border-black/10 bg-white"
                        : "border-[#f84a00]/30 bg-[#fef1ea]/40"
                    }`}
                  >
                    {!e.isRead && (
                      <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-[#f84a00] px-2 py-0.5 text-[10px] font-semibold text-white">
                        <Sparkles className="h-3 w-3" />
                        {t("newTag")}
                      </span>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pr-16">
                      {e.subjectName ? (
                        <Badge className="bg-[#fef1ea] text-[#f84a00] hover:bg-[#fef1ea]">
                          {e.subjectName}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-black/10 bg-gray-50 text-gray-700"
                        >
                          {t("generalTag")}
                        </Badge>
                      )}
                      {e.students.length > 0 && (
                        <Badge
                          variant="outline"
                          className="border-black/10 text-[10px] text-gray-700"
                        >
                          {e.students.map((s) => s.name).join(", ")}
                        </Badge>
                      )}
                      {e.teacherName && (
                        <span className="text-xs text-gray-500">
                          {t("byTeacher", { name: e.teacherName })}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg bg-gray-50 p-4">
                        <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
                          <BookOpen className="h-3.5 w-3.5" />
                          {t("classSummary")}
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-gray-800">
                          {e.classSummary}
                        </p>
                      </div>
                      <div className="rounded-lg border border-[#f84a00]/20 bg-[#fef1ea]/60 p-4">
                        <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[#f84a00]">
                          <ClipboardList className="h-3.5 w-3.5" />
                          {t("homework")}
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-gray-800">
                          {e.homework}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium cursor-pointer transition-colors ${
        active
          ? "border-[#f84a00] bg-[#f84a00] text-white"
          : "border-black/10 bg-white text-gray-700 hover:border-[#f84a00]/30 hover:text-[#f84a00]"
      }`}
    >
      {children}
    </button>
  );
}
