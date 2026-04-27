"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { fr, enGB, ptBR, es } from "date-fns/locale";
import { Search, LogIn, LogOut, UserCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionSkeleton } from "./SectionSkeleton";
import { useDebounce } from "@/hooks/useDebounce";

const dateLocales = { fr, en: enGB, pt: ptBR, es } as const;
const FREE_TEXT = "__free_text__";

type AuthLite = {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string | null;
  phone: string | null;
  expiresAt: string | null;
};

type EventLite = {
  id: string;
  type: "ENTRY" | "EXIT";
  occurredAt: string;
  pickupName: string | null;
  authorization: { firstName: string; lastName: string; relationship: string | null } | null;
};

type StudentRow = {
  id: string;
  firstName: string;
  lastName: string;
  class: { name: string } | null;
  pickupAuthorizations: AuthLite[];
  pickupEvents: EventLite[];
};

export default function DirectorPickupSection() {
  const t = useTranslations("DirectorPickup");
  const locale = useLocale() as keyof typeof dateLocales;
  const dfLocale = dateLocales[locale] ?? fr;

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);

  const [logOpen, setLogOpen] = useState(false);
  const [logStudent, setLogStudent] = useState<StudentRow | null>(null);
  const [logType, setLogType] = useState<"ENTRY" | "EXIT">("EXIT");
  const [logAuthId, setLogAuthId] = useState<string>(FREE_TEXT);
  const [logName, setLogName] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/director/pickups${q ? `?q=${encodeURIComponent(q)}` : ""}`
      );
      if (!res.ok) {
        setStudents([]);
        return;
      }
      const data = await res.json();
      setStudents(data.students ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(debouncedSearch);
  }, [debouncedSearch]);

  const openLog = (student: StudentRow, type: "ENTRY" | "EXIT") => {
    setLogStudent(student);
    setLogType(type);
    setLogAuthId(FREE_TEXT);
    setLogName("");
    setLogNotes("");
    setLogOpen(true);
  };

  const submitLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logStudent) return;
    if (logAuthId === FREE_TEXT && !logName.trim()) {
      toast.error(t("nameOrAuthRequired"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/director/pickups/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: logStudent.id,
          type: logType,
          authorizationId: logAuthId === FREE_TEXT ? null : logAuthId,
          pickupName: logAuthId === FREE_TEXT ? logName.trim() : null,
          notes: logNotes.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error || t("logFailed"));
        return;
      }
      toast.success(logType === "ENTRY" ? t("entryLogged") : t("exitLogged"));
      setLogOpen(false);
      fetchData(debouncedSearch);
    } finally {
      setSubmitting(false);
    }
  };

  const todayFmt = useMemo(
    () => format(new Date(), "PPP", { locale: dfLocale }),
    [dfLocale]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
          <p className="text-sm text-gray-500">{todayFmt}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-8 w-64"
          />
        </div>
      </div>

      {loading ? (
        <SectionSkeleton variant="table" rows={6} />
      ) : students.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
          <p className="text-sm text-gray-500">{t("noStudents")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {students.map((s) => {
            const last = s.pickupEvents[0];
            const inSchool = last?.type === "ENTRY";
            return (
              <div
                key={s.id}
                className="rounded-2xl border border-black/10 bg-white p-4 flex flex-wrap items-center gap-4"
              >
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                  {(s.firstName[0] ?? "") + (s.lastName[0] ?? "")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">
                    {s.firstName} {s.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {s.class?.name ?? t("noClass")}
                    {" · "}
                    <span
                      className={
                        inSchool ? "text-emerald-700" : "text-gray-500"
                      }
                    >
                      {inSchool ? t("inSchool") : t("notInSchool")}
                    </span>
                    {last && (
                      <>
                        {" · "}
                        <Clock className="inline h-3 w-3" />{" "}
                        {format(new Date(last.occurredAt), "p", {
                          locale: dfLocale,
                        })}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    {t("authCount", { count: s.pickupAuthorizations.length })}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => openLog(s, "ENTRY")}
                  >
                    <LogIn className="mr-1.5 h-3.5 w-3.5" />
                    {t("logEntry")}
                  </Button>
                  <Button
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => openLog(s, "EXIT")}
                  >
                    <LogOut className="mr-1.5 h-3.5 w-3.5" />
                    {t("logExit")}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {logType === "ENTRY" ? t("logEntryTitle") : t("logExitTitle")}
              {logStudent && ` — ${logStudent.firstName} ${logStudent.lastName}`}
            </DialogTitle>
            <DialogDescription>{t("logDescription")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitLog} className="space-y-3">
            <div>
              <Label className="text-xs">{t("personLabel")}</Label>
              <Select value={logAuthId} onValueChange={setLogAuthId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FREE_TEXT}>{t("freeTextOption")}</SelectItem>
                  {logStudent?.pickupAuthorizations.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.firstName} {a.lastName}
                      {a.relationship ? ` · ${a.relationship}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {logAuthId === FREE_TEXT && (
              <div>
                <Label className="text-xs">{t("nameLabel")}</Label>
                <Input
                  value={logName}
                  onChange={(e) => setLogName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  required
                />
              </div>
            )}

            <div>
              <Label className="text-xs">{t("notesLabel")}</Label>
              <Textarea
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                rows={2}
                placeholder={t("notesPlaceholder")}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => setLogOpen(false)}
                disabled={submitting}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={submitting}>
                {submitting ? t("logging") : t("logButton")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
