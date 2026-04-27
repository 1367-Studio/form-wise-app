"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { fr, enGB, ptBR, es } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Check,
  X,
  Clock,
  ShieldCheck,
  Save,
  CheckCheck,
  GraduationCap,
  Loader2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { SectionSkeleton } from "./SectionSkeleton";

const dateLocales = { fr, en: enGB, pt: ptBR, es } as const;

type Status = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

type Student = { id: string; firstName: string; lastName: string };
type Entry = {
  id: string;
  studentId: string;
  status: Status;
  notes: string | null;
  justificationNotes: string | null;
  justificationDocId: string | null;
  justifiedAt: string | null;
};

type Resp = {
  teacher: { id: string; className: string | null } | null;
  classId: string | null;
  date: string | null;
  students: Student[];
  entries: Entry[];
};

const STATUS_ORDER: Status[] = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];

const statusStyles: Record<
  Status,
  { bg: string; text: string; icon: React.ReactNode }
> = {
  PRESENT: {
    bg: "bg-emerald-100 hover:bg-emerald-200 text-emerald-800",
    text: "text-emerald-700",
    icon: <Check className="h-3.5 w-3.5" />,
  },
  ABSENT: {
    bg: "bg-red-100 hover:bg-red-200 text-red-800",
    text: "text-red-700",
    icon: <X className="h-3.5 w-3.5" />,
  },
  LATE: {
    bg: "bg-amber-100 hover:bg-amber-200 text-amber-800",
    text: "text-amber-700",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  EXCUSED: {
    bg: "bg-blue-100 hover:bg-blue-200 text-blue-800",
    text: "text-blue-700",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
  },
};

export default function TeacherAttendanceSection() {
  const t = useTranslations("TeacherAttendance");
  const locale = useLocale() as keyof typeof dateLocales;
  const dfLocale = dateLocales[locale] ?? fr;

  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [calOpen, setCalOpen] = useState(false);
  const [statusByStudent, setStatusByStudent] = useState<
    Record<string, Status>
  >({});
  const [saving, setSaving] = useState(false);

  const isoDay = useMemo(() => date.toISOString().slice(0, 10), [date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/teacher/attendance?date=${isoDay}`);
      if (!res.ok) {
        setData({ teacher: null, classId: null, date: null, students: [], entries: [] });
        return;
      }
      const d: Resp = await res.json();
      setData({
        teacher: d.teacher ?? null,
        classId: d.classId ?? null,
        date: d.date ?? null,
        students: Array.isArray(d.students) ? d.students : [],
        entries: Array.isArray(d.entries) ? d.entries : [],
      });
      const map: Record<string, Status> = {};
      for (const s of d.students ?? []) {
        const e = d.entries?.find((x) => x.studentId === s.id);
        map[s.id] = (e?.status as Status) ?? "PRESENT";
      }
      setStatusByStudent(map);
    } catch {
      setData({ teacher: null, classId: null, date: null, students: [], entries: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isoDay]);

  const setStatus = (studentId: string, status: Status) =>
    setStatusByStudent((prev) => ({ ...prev, [studentId]: status }));

  const markAllPresent = () => {
    if (!data) return;
    const next: Record<string, Status> = {};
    for (const s of data.students) next[s.id] = "PRESENT";
    setStatusByStudent(next);
  };

  const counts = useMemo(() => {
    const c = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 } as Record<
      Status,
      number
    >;
    for (const status of Object.values(statusByStudent)) c[status]++;
    return c;
  }, [statusByStudent]);

  const save = async () => {
    if (!data?.classId) return;
    setSaving(true);
    try {
      const entries = Object.entries(statusByStudent).map(([studentId, status]) => ({
        studentId,
        status,
      }));
      const res = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: isoDay, entries }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(t("saved", { count: json.count ?? entries.length }));
        fetchData();
      } else {
        toast.error(json?.error || t("saveFailed"));
      }
    } finally {
      setSaving(false);
    }
  };

  const markExcused = async (entryId: string) => {
    const res = await fetch(`/api/teacher/attendance/${entryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "EXCUSED" }),
    });
    if (res.ok) {
      toast.success(t("markedExcused"));
      fetchData();
    } else {
      toast.error(t("saveFailed"));
    }
  };

  if (loading || !data) return <SectionSkeleton variant="table" rows={8} />;

  if (!data.teacher) {
    return (
      <EmptyCard
        title={t("noProfileTitle")}
        hint={t("noProfileHint")}
      />
    );
  }
  if (!data.classId) {
    return <EmptyCard title={t("noClassTitle")} hint={t("noClassHint")} />;
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
        <div className="flex flex-wrap items-center gap-2">
          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="cursor-pointer">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "PPP", { locale: dfLocale })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarUI
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (d) {
                    const x = new Date(d);
                    x.setHours(0, 0, 0, 0);
                    setDate(x);
                  }
                  setCalOpen(false);
                }}
                locale={dfLocale}
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={markAllPresent}
            disabled={data.students.length === 0}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            {t("allPresent")}
          </Button>
          <Button
            className="cursor-pointer"
            onClick={save}
            disabled={saving || data.students.length === 0}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saving ? t("saving") : t("save")}
          </Button>
        </div>
      </div>

      {/* Summary chips */}
      <div className="grid gap-3 sm:grid-cols-4">
        <SummaryTile
          label={t("statusPresent")}
          count={counts.PRESENT}
          tone="emerald"
        />
        <SummaryTile
          label={t("statusAbsent")}
          count={counts.ABSENT}
          tone="red"
        />
        <SummaryTile
          label={t("statusLate")}
          count={counts.LATE}
          tone="amber"
        />
        <SummaryTile
          label={t("statusExcused")}
          count={counts.EXCUSED}
          tone="blue"
        />
      </div>

      {data.students.length === 0 ? (
        <EmptyCard title={t("noStudentsTitle")} hint={t("noStudentsHint")} />
      ) : (
        <ul className="rounded-2xl border border-black/10 bg-white">
          {data.students.map((s, idx) => {
            const current = statusByStudent[s.id] ?? "PRESENT";
            const entry = data.entries.find((e) => e.studentId === s.id);
            const hasJustification =
              !!entry?.justificationNotes && current !== "EXCUSED";
            return (
              <li
                key={s.id}
                className={`flex flex-wrap items-center justify-between gap-3 p-4 ${
                  idx === 0 ? "" : "border-t border-black/5"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                    {(s.firstName[0] ?? "") + (s.lastName[0] ?? "")}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {s.firstName} {s.lastName}
                    </p>
                    {hasJustification && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-blue-700">
                        <FileText className="h-3 w-3" />
                        {t("parentJustified")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {STATUS_ORDER.map((st) => {
                    const active = current === st;
                    const styles = statusStyles[st];
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatus(s.id, st)}
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium cursor-pointer transition-all ${
                          active
                            ? `${styles.bg} border-transparent`
                            : "border-black/10 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {styles.icon}
                        {t(`status${st.charAt(0) + st.slice(1).toLowerCase()}` as
                          | "statusPresent"
                          | "statusAbsent"
                          | "statusLate"
                          | "statusExcused")}
                      </button>
                    );
                  })}
                  {hasJustification && entry && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="cursor-pointer text-blue-700 hover:bg-blue-50"
                      onClick={() => markExcused(entry.id)}
                    >
                      <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                      {t("acceptJustification")}
                    </Button>
                  )}
                </div>

                {hasJustification && entry?.justificationNotes && (
                  <div className="mt-1 w-full rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">
                    <p className="mb-1 font-semibold">
                      {t("justificationFromParent")}
                    </p>
                    <p className="whitespace-pre-wrap">
                      {entry.justificationNotes}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SummaryTile({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "emerald" | "red" | "amber" | "blue";
}) {
  const map = {
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    red: "border-red-100 bg-red-50 text-red-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    blue: "border-blue-100 bg-blue-50 text-blue-700",
  } as const;
  return (
    <div className={`rounded-2xl border ${map[tone]} p-4`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold">{count}</p>
    </div>
  );
}

function EmptyCard({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <GraduationCap className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{hint}</p>
    </div>
  );
}

