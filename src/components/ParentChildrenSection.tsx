"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { fr, enGB, ptBR, es } from "date-fns/locale";
import {
  Plus,
  Trash2,
  Eye,
  GraduationCap,
  Cake,
  MapPin,
  Heart,
  ShieldCheck,
  Hash,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import StudentForm from "./StudentForm";
import { SectionSkeleton } from "./SectionSkeleton";
import { useMoneyFormatter } from "../app/hooks/useMoneyFormatter";
import { useOptionalSelectedChild } from "@/contexts/SelectedChildContext";

const dateLocales = { fr, en: enGB, pt: ptBR, es } as const;

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  address: string;
  hasHealthIssues: boolean;
  healthDetails: string | null;
  canLeaveAlone: boolean;
  status: string;
  code: string | null;
  class: { id: string; name: string; monthlyFee: number } | null;
  _count: { documents: number };
};

function age(birthDate: string) {
  const d = new Date(birthDate);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

export default function ParentChildrenSection() {
  const t = useTranslations("ParentChildren");
  const tStatus = useTranslations("Dashboard");
  const locale = useLocale() as keyof typeof dateLocales;
  const dfLocale = dateLocales[locale] ?? fr;

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);

  const childCtx = useOptionalSelectedChild();
  const filteredStudents = childCtx?.selectedChildId
    ? students.filter((s) => s.id === childCtx.selectedChildId)
    : students;

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/students");
      const data = await res.json();
      setStudents(data.students || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleStudentAdded = () => {
    setAddOpen(false);
    fetchStudents();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/students/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t("deletedToast"));
        setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        toast.error(data?.error || t("deleteFailed"));
      }
    } finally {
      setDeleting(false);
    }
  };

  const fmtMoney = useMoneyFormatter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {t("title")}
          </h1>
          <p className="text-sm text-gray-500">
            {t("subtitle", { count: filteredStudents.length })}
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              {t("addChild")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("addDialogTitle")}</DialogTitle>
              <DialogDescription>
                {t("addDialogSubtitle")}
              </DialogDescription>
            </DialogHeader>
            <StudentForm onStudentAdded={handleStudentAdded} />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <SectionSkeleton variant="cards" rows={3} />
      ) : filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {t("emptyTitle")}
          </h2>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            {t("emptySubtitle")}
          </p>
          <Button
            className="mt-6 cursor-pointer"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("addFirstChild")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredStudents.map((s) => (
            <ChildCard
              key={s.id}
              student={s}
              fmtMoney={fmtMoney}
              tStatus={tStatus}
              t={t}
              onView={() => setDetailStudent(s)}
              onDelete={() => setDeleteTarget(s)}
            />
          ))}
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet
        open={!!detailStudent}
        onOpenChange={(o) => !o && setDetailStudent(null)}
      >
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-6">
          {detailStudent && (
            <>
              <SheetHeader className="px-0 pt-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                    {(detailStudent.firstName[0] ?? "") +
                      (detailStudent.lastName[0] ?? "")}
                  </div>
                  <div>
                    <SheetTitle>
                      {detailStudent.firstName} {detailStudent.lastName}
                    </SheetTitle>
                    <SheetDescription>
                      {detailStudent.class?.name ?? t("noClass")} ·{" "}
                      {t("ageYears", { years: age(detailStudent.birthDate) })}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={detailStudent.status} t={tStatus} />
                  {detailStudent.class && (
                    <Badge
                      variant="outline"
                      className="border-black/10 bg-gray-50 text-gray-700"
                    >
                      {fmtMoney(detailStudent.class.monthlyFee)} /
                      {t("perMonth")}
                    </Badge>
                  )}
                </div>

                <DetailRow
                  icon={<Cake className="h-4 w-4" />}
                  label={t("birthDate")}
                  value={format(
                    new Date(detailStudent.birthDate),
                    "PPP",
                    { locale: dfLocale }
                  )}
                />
                <DetailRow
                  icon={<MapPin className="h-4 w-4" />}
                  label={t("address")}
                  value={detailStudent.address}
                />
                <DetailRow
                  icon={<GraduationCap className="h-4 w-4" />}
                  label={t("classLabel")}
                  value={detailStudent.class?.name ?? t("noClass")}
                />
                {detailStudent.code && (
                  <DetailRow
                    icon={<Hash className="h-4 w-4" />}
                    label={t("studentCode")}
                    value={detailStudent.code}
                    mono
                  />
                )}
                <DetailRow
                  icon={<Heart className="h-4 w-4" />}
                  label={t("healthIssues")}
                  value={
                    detailStudent.hasHealthIssues
                      ? detailStudent.healthDetails || t("yes")
                      : t("no")
                  }
                />
                <DetailRow
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label={t("canLeaveAlone")}
                  value={detailStudent.canLeaveAlone ? t("yes") : t("no")}
                />
                <DetailRow
                  icon={<FileText className="h-4 w-4" />}
                  label={t("documents")}
                  value={String(detailStudent._count.documents)}
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("deleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("deleteConfirm", {
                name: deleteTarget
                  ? `${deleteTarget.firstName} ${deleteTarget.lastName}`
                  : "",
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              {t("cancel")}
            </Button>
            <Button
              className="cursor-pointer bg-red-600 text-white hover:bg-red-700"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? t("deleting") : t("confirmDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChildCard({
  student,
  fmtMoney,
  tStatus,
  t,
  onView,
  onDelete,
}: {
  student: Student;
  fmtMoney: (v: number) => string;
  tStatus: ReturnType<typeof useTranslations>;
  t: ReturnType<typeof useTranslations>;
  onView: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
          {(student.firstName[0] ?? "") + (student.lastName[0] ?? "")}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-900">
            {student.firstName} {student.lastName}
          </h3>
          <p className="text-xs text-gray-500">
            {t("ageYears", { years: age(student.birthDate) })}
          </p>
        </div>
        <StatusBadge status={student.status} t={tStatus} />
      </div>

      <div className="mt-4 space-y-1.5 text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <GraduationCap className="h-4 w-4 text-gray-400" />
          {student.class?.name ?? (
            <span className="italic text-gray-400">{t("noClass")}</span>
          )}
        </div>
        {student.class && (
          <div className="flex items-center gap-2 text-gray-500">
            <span className="text-xs">
              {fmtMoney(student.class.monthlyFee)} / {t("perMonth")}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-500">
          <FileText className="h-4 w-4 text-gray-400" />
          <span className="text-xs">
            {t("docsCount", { count: student._count.documents })}
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 cursor-pointer"
          onClick={onView}
        >
          <Eye className="mr-2 h-3.5 w-3.5" />
          {t("viewDetails")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer text-gray-500 hover:bg-red-50 hover:text-red-600"
          onClick={onDelete}
          aria-label={t("delete")}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-gray-100 text-gray-500">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p
          className={`mt-0.5 break-words text-sm text-gray-900 ${
            mono ? "font-mono" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  t,
}: {
  status: string;
  t: ReturnType<typeof useTranslations>;
}) {
  if (status === "ACCEPTED")
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        {t("statusAccepted")}
      </Badge>
    );
  if (status === "PENDING")
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
        {t("statusPending")}
      </Badge>
    );
  if (status === "REJECTED")
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
        {t("statusRejected")}
      </Badge>
    );
  return <Badge variant="outline">{status}</Badge>;
}
