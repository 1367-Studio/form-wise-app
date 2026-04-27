"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  GraduationCap,
  Users,
  UserRound,
  BookOpen,
  CalendarRange,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CenteredSpinner from "./CenteredSpinner";
import { useMoneyFormatter } from "../app/hooks/useMoneyFormatter";

type ClassOverview = {
  id: string;
  name: string;
  monthlyFee: number;
  schoolYearName: string | null;
  subjectCount: number;
  teacherCount: number;
  studentCount: number;
};

type Subject = {
  id: string;
  name: string;
  createdAt: string;
  teachers: { id: string; name: string }[];
};

type ClassDetail = {
  id: string;
  name: string;
  monthlyFee: number;
  schoolYearName: string | null;
  studentCount: number;
  teacherCount: number;
  subjects: Subject[];
};

export default function ClassesSubjectsManager() {
  const t = useTranslations("ClassesManager");
  const fmtMoney = useMoneyFormatter();
  const [classes, setClasses] = useState<ClassOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [openClassId, setOpenClassId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ClassDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [newSubjectName, setNewSubjectName] = useState("");
  const [creatingSubject, setCreatingSubject] = useState(false);

  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingName, setEditingName] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/classes/overview");
      const data = await res.json();
      setClasses(Array.isArray(data?.classes) ? data.classes : []);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/classes/${id}`);
      if (!res.ok) {
        setDetail(null);
        return;
      }
      const data = await res.json();
      setDetail(data?.class ?? null);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (openClassId) fetchDetail(openClassId);
    else setDetail(null);
  }, [openClassId]);

  const closeDrawer = () => {
    setOpenClassId(null);
    setNewSubjectName("");
    setEditingSubject(null);
    setEditingName("");
    setDeletingSubject(null);
  };

  const refreshAll = async () => {
    if (openClassId) await fetchDetail(openClassId);
    await fetchClasses();
  };

  const createSubject = async () => {
    if (!openClassId || !newSubjectName.trim()) return;
    setCreatingSubject(true);
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: openClassId,
          name: newSubjectName.trim(),
        }),
      });
      if (res.ok) {
        toast.success(t("subjectCreated"));
        setNewSubjectName("");
        await refreshAll();
      } else {
        const json = await res.json().catch(() => ({}));
        toast.error(json?.error || t("saveFailed"));
      }
    } finally {
      setCreatingSubject(false);
    }
  };

  const saveEdit = async () => {
    if (!editingSubject || !editingName.trim()) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/subjects/${editingSubject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName.trim() }),
      });
      if (res.ok) {
        toast.success(t("subjectUpdated"));
        setEditingSubject(null);
        setEditingName("");
        await refreshAll();
      } else {
        toast.error(t("saveFailed"));
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingSubject) return;
    setConfirmingDelete(true);
    try {
      const res = await fetch(`/api/subjects/${deletingSubject.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(t("subjectDeleted"));
        setDeletingSubject(null);
        await refreshAll();
      } else {
        toast.error(t("deleteFailed"));
      }
    } finally {
      setConfirmingDelete(false);
    }
  };

  const sortedYears = useMemo(() => {
    const map = new Map<string, ClassOverview[]>();
    for (const c of classes) {
      const key = c.schoolYearName ?? "—";
      const arr = map.get(key) ?? [];
      arr.push(c);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [classes]);

  if (loading) return <CenteredSpinner label={t("loading")} />;

  if (classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <GraduationCap className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          {t("emptyTitle")}
        </h2>
        <p className="mt-1 max-w-sm text-sm text-gray-500">
          {t("emptyHint")}
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

      <div className="space-y-8">
        {sortedYears.map(([year, group]) => (
          <div key={year}>
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <CalendarRange className="h-3.5 w-3.5" />
              {year}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {group.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setOpenClassId(c.id)}
                  className="group rounded-2xl border border-black/10 bg-white p-5 text-left transition-all hover:border-[#f84a00]/30 hover:shadow-sm cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-gray-900">
                        {c.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {c.schoolYearName ?? t("noYear")}
                      </p>
                    </div>
                    <Badge className="bg-[#fef1ea] text-[#f84a00] hover:bg-[#fef1ea]">
                      {fmtMoney(c.monthlyFee)} / {t("perMonth")}
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <Stat
                      icon={<BookOpen className="h-3.5 w-3.5" />}
                      label={t("statSubjects")}
                      value={c.subjectCount}
                    />
                    <Stat
                      icon={<UserRound className="h-3.5 w-3.5" />}
                      label={t("statTeachers")}
                      value={c.teacherCount}
                    />
                    <Stat
                      icon={<Users className="h-3.5 w-3.5" />}
                      label={t("statStudents")}
                      value={c.studentCount}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Drawer */}
      <Sheet
        open={!!openClassId}
        onOpenChange={(o) => !o && closeDrawer()}
      >
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-6">
          {detailLoading && !detail ? (
            <CenteredSpinner label={t("loading")} />
          ) : !detail ? (
            <p className="text-sm text-gray-500">{t("noDetail")}</p>
          ) : (
            <>
              <SheetHeader className="px-0 pt-0">
                <SheetTitle>{detail.name}</SheetTitle>
                <SheetDescription>
                  {detail.schoolYearName ?? t("noYear")} · {fmtMoney(detail.monthlyFee)} / {t("perMonth")}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <Stat
                  icon={<BookOpen className="h-3.5 w-3.5" />}
                  label={t("statSubjects")}
                  value={detail.subjects.length}
                />
                <Stat
                  icon={<UserRound className="h-3.5 w-3.5" />}
                  label={t("statTeachers")}
                  value={detail.teacherCount}
                />
                <Stat
                  icon={<Users className="h-3.5 w-3.5" />}
                  label={t("statStudents")}
                  value={detail.studentCount}
                />
              </div>

              {/* Add subject */}
              <div className="mt-6 rounded-xl border border-black/10 bg-gray-50 p-4">
                <Label className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {t("addSubjectLabel")}
                </Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder={t("addSubjectPlaceholder")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        createSubject();
                      }
                    }}
                  />
                  <Button
                    className="cursor-pointer"
                    onClick={createSubject}
                    disabled={creatingSubject || !newSubjectName.trim()}
                  >
                    {creatingSubject ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Subjects list */}
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-semibold text-gray-900">
                  {t("subjectsTitle")}
                </h3>
                {detail.subjects.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-black/10 bg-white px-4 py-6 text-center text-sm text-gray-500">
                    {t("noSubjects")}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {detail.subjects.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center gap-2 rounded-lg border border-black/10 bg-white p-3"
                      >
                        {editingSubject?.id === s.id ? (
                          <>
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  saveEdit();
                                }
                                if (e.key === "Escape") {
                                  setEditingSubject(null);
                                  setEditingName("");
                                }
                              }}
                              autoFocus
                              className="h-8 flex-1"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="cursor-pointer text-emerald-600"
                              onClick={saveEdit}
                              disabled={savingEdit || !editingName.trim()}
                            >
                              {savingEdit ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="cursor-pointer text-gray-500"
                              onClick={() => {
                                setEditingSubject(null);
                                setEditingName("");
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {s.name}
                              </p>
                              {s.teachers.length > 0 && (
                                <p className="truncate text-xs text-gray-500">
                                  {s.teachers
                                    .map((tch) => tch.name)
                                    .filter(Boolean)
                                    .join(", ") || t("noTeacher")}
                                </p>
                              )}
                              {s.teachers.length === 0 && (
                                <p className="text-xs italic text-gray-400">
                                  {t("noTeacher")}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="cursor-pointer text-gray-500"
                              onClick={() => {
                                setEditingSubject(s);
                                setEditingName(s.name);
                              }}
                              aria-label={t("edit")}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="cursor-pointer text-gray-500 hover:bg-red-50 hover:text-red-600"
                              onClick={() => setDeletingSubject(s)}
                              aria-label={t("delete")}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <Dialog
        open={!!deletingSubject}
        onOpenChange={(o) => !o && setDeletingSubject(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("deleteTitle")}</DialogTitle>
            <DialogDescription>
              {deletingSubject
                ? t("deleteConfirm", { name: deletingSubject.name })
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setDeletingSubject(null)}
              disabled={confirmingDelete}
            >
              {t("cancel")}
            </Button>
            <Button
              className="cursor-pointer bg-red-600 text-white hover:bg-red-700"
              onClick={confirmDelete}
              disabled={confirmingDelete}
            >
              {confirmingDelete ? t("deleting") : t("confirmDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-black/5 bg-gray-50 p-2 text-center">
      <div className="flex items-center justify-center gap-1 text-gray-500">
        {icon}
        <span className="text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-0.5 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
