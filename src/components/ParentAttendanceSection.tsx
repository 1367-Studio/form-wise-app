"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { fr, enGB, ptBR, es } from "date-fns/locale";
import {
  Check,
  X,
  Clock,
  ShieldCheck,
  CalendarRange,
  Inbox,
  Loader2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SectionSkeleton } from "./SectionSkeleton";
import { useOptionalSelectedChild } from "@/contexts/SelectedChildContext";

const dateLocales = { fr, en: enGB, pt: ptBR, es } as const;

type Status = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  className: string | null;
};
type Entry = {
  id: string;
  studentId: string;
  date: string;
  status: Status;
  notes: string | null;
  justificationNotes: string | null;
  justificationDocId: string | null;
  justifiedAt: string | null;
};
type Resp = {
  students: Student[];
  entries: Entry[];
};

const statusBadge: Record<Status, string> = {
  PRESENT: "bg-emerald-100 text-emerald-700",
  ABSENT: "bg-red-100 text-red-700",
  LATE: "bg-amber-100 text-amber-700",
  EXCUSED: "bg-blue-100 text-blue-700",
};

const statusIcon: Record<Status, React.ReactNode> = {
  PRESENT: <Check className="h-3 w-3" />,
  ABSENT: <X className="h-3 w-3" />,
  LATE: <Clock className="h-3 w-3" />,
  EXCUSED: <ShieldCheck className="h-3 w-3" />,
};

export default function ParentAttendanceSection() {
  const t = useTranslations("ParentAttendance");
  const locale = useLocale() as keyof typeof dateLocales;
  const dfLocale = dateLocales[locale] ?? fr;

  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentFilter, setStudentFilter] = useState<string>("all");
  const [justifyEntry, setJustifyEntry] = useState<Entry | null>(null);
  const [justifyText, setJustifyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const childCtx = useOptionalSelectedChild();
  useEffect(() => {
    if (!childCtx) return;
    setStudentFilter(childCtx.selectedChildId ?? "all");
  }, [childCtx, childCtx?.selectedChildId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/parent/attendance");
      if (!res.ok) {
        setData({ students: [], entries: [] });
        return;
      }
      const d: Resp = await res.json();
      setData({
        students: Array.isArray(d.students) ? d.students : [],
        entries: Array.isArray(d.entries) ? d.entries : [],
      });
    } catch {
      setData({ students: [], entries: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    return studentFilter === "all"
      ? data.entries
      : data.entries.filter((e) => e.studentId === studentFilter);
  }, [data, studentFilter]);

  const stats = useMemo(() => {
    const map = new Map<
      string,
      { present: number; absent: number; late: number; excused: number; total: number }
    >();
    if (!data) return map;
    for (const s of data.students)
      map.set(s.id, { present: 0, absent: 0, late: 0, excused: 0, total: 0 });
    for (const e of data.entries) {
      const cur = map.get(e.studentId);
      if (!cur) continue;
      cur.total++;
      if (e.status === "PRESENT") cur.present++;
      if (e.status === "ABSENT") cur.absent++;
      if (e.status === "LATE") cur.late++;
      if (e.status === "EXCUSED") cur.excused++;
    }
    return map;
  }, [data]);

  const submitJustification = async () => {
    if (!justifyEntry || !justifyText.trim()) {
      toast.error(t("notesRequired"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/parent/attendance/${justifyEntry.id}/justify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: justifyText }),
        }
      );
      const json = await res.json();
      if (res.ok) {
        toast.success(t("justified"));
        setJustifyEntry(null);
        setJustifyText("");
        fetchData();
      } else {
        toast.error(json?.error || t("submitFailed"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !data) return <SectionSkeleton variant="table" rows={6} />;

  if (data.students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <Inbox className="h-6 w-6" />
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
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
        <p className="text-sm text-gray-500">{t("subtitle")}</p>
      </div>

      {/* Per-child summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.students.map((s) => {
          const st = stats.get(s.id) ?? {
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            total: 0,
          };
          const presenceRate =
            st.total > 0
              ? Math.round(((st.present + st.excused) / st.total) * 100)
              : 100;
          return (
            <div
              key={s.id}
              className="rounded-2xl border border-black/10 bg-white p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                  {(s.firstName[0] ?? "") + (s.lastName[0] ?? "")}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {s.firstName} {s.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {s.className ?? t("noClass")}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-2xl font-semibold text-gray-900">
                    {presenceRate}%
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">
                    {t("presenceRate")}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                  <Check className="h-3 w-3" /> {st.present}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-red-700">
                  <X className="h-3 w-3" /> {st.absent}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
                  <Clock className="h-3 w-3" /> {st.late}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
                  <ShieldCheck className="h-3 w-3" /> {st.excused}
                </span>
              </div>
            </div>
          );
        })}
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

      {/* Recent history */}
      <div className="rounded-2xl border border-black/10 bg-white">
        <div className="flex items-center gap-2 border-b border-black/5 p-4">
          <CalendarRange className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900">
            {t("historyTitle")}
          </h2>
        </div>
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            {t("historyEmpty")}
          </div>
        ) : (
          <ul className="divide-y divide-black/5">
            {filtered.map((e) => {
              const student = data.students.find((s) => s.id === e.studentId);
              const dateLabel = format(new Date(e.date), "EEEE PPP", {
                locale: dfLocale,
              });
              const canJustify =
                (e.status === "ABSENT" || e.status === "LATE") &&
                !e.justificationNotes;
              return (
                <li
                  key={e.id}
                  className="flex flex-wrap items-center gap-3 p-4"
                >
                  <Badge
                    className={`${statusBadge[e.status]} hover:${
                      statusBadge[e.status]
                    } gap-1`}
                  >
                    {statusIcon[e.status]}
                    {t(`status${e.status.charAt(0) + e.status.slice(1).toLowerCase()}` as
                      | "statusPresent"
                      | "statusAbsent"
                      | "statusLate"
                      | "statusExcused")}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900">
                      {student
                        ? `${student.firstName} ${student.lastName}`
                        : "—"}
                    </p>
                    <p className="text-xs text-gray-500">{dateLabel}</p>
                    {e.justificationNotes && (
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-blue-700">
                        <FileText className="h-3 w-3" />
                        {e.justifiedAt
                          ? t("justifiedOn", {
                              date: format(new Date(e.justifiedAt), "PP", {
                                locale: dfLocale,
                              }),
                            })
                          : t("justifiedShort")}
                      </p>
                    )}
                  </div>
                  {canJustify && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => {
                        setJustifyEntry(e);
                        setJustifyText("");
                      }}
                    >
                      {t("submitJustification")}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Justification dialog */}
      <Dialog
        open={!!justifyEntry}
        onOpenChange={(o) => {
          if (!o) {
            setJustifyEntry(null);
            setJustifyText("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("dialogTitle")}</DialogTitle>
            <DialogDescription>{t("dialogSubtitle")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            <Label>{t("notesLabel")}</Label>
            <Textarea
              value={justifyText}
              onChange={(e) => setJustifyText(e.target.value)}
              rows={4}
              placeholder={t("notesPlaceholder")}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                setJustifyEntry(null);
                setJustifyText("");
              }}
              disabled={submitting}
            >
              {t("cancel")}
            </Button>
            <Button
              className="cursor-pointer"
              onClick={submitJustification}
              disabled={submitting}
            >
              {submitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
          ? "border-[#2563EB] bg-[#2563EB] text-white"
          : "border-black/10 bg-white text-gray-700 hover:border-[#2563EB]/30 hover:text-[#2563EB]"
      }`}
    >
      {children}
    </button>
  );
}
