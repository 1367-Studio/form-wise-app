"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import DashboardPagination from "./DashboardPagination";
import { Eye, Copy } from "lucide-react";
import { useIsMobile } from "../app/hooks/useIsMobile";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  healthIssues: string | null;
  canLeaveAlone: boolean;
  class: {
    id: string;
    name: string;
  };
  parent: {
    firstName: string;
    lastName: string;
    iban?: string | null;
    bic?: string | null;
    bankName?: string | null;
    email: string;
    phone: string;
  };
};

export default function StudentListWithFilter() {
  const t = useTranslations("StudentListFilter");
  const [students, setStudents] = useState<Student[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;
  const isMobile = useIsMobile();

  const classes = [
    { id: "all", name: t("allClasses") },
    { id: "class-1", name: t("classCp") },
    { id: "class-2", name: t("classCe1") },
  ];

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
        });

        if (search) params.set("search", search);
        if (selectedClass !== "all") params.set("classId", selectedClass);

        const res = await fetch(`/api/students/all?${params.toString()}`);
        const data = await res.json();
        setStudents(data.students || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error("Students fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [search, selectedClass, page]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6 mt-8">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-1/3"
        />
        <Select
          value={selectedClass}
          onValueChange={(val) => {
            setSelectedClass(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full md:w-1/3">
            <SelectValue placeholder={t("classPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-center py-8 text-muted-foreground">{t("loading")}</p>
      ) : students.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">
          {t("emptyState")}
        </p>
      ) : isMobile ? (
        <div className="space-y-4">
          {students.map((student) => (
            <Card key={student.id}>
              <CardContent className="p-4 space-y-2">
                <p className="font-semibold">
                  {student.firstName} {student.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("headerClass")} : {student.class.name}
                </p>
                <p className="text-sm">
                  {t("headerHealthIssues")} :{" "}
                  {student.healthIssues || t("healthNone")}
                </p>
                <p className="text-sm">
                  {t("headerCanLeaveAlone")} :{" "}
                  {student.canLeaveAlone ? t("yes") : t("no")}
                </p>
                <p
                  className={`text-xs font-medium inline-block px-2 py-1 rounded-full ${
                    student.parent.iban
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {student.parent.iban ? t("ribUpdated") : t("ribMissing")}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleView(student)}
                  className="cursor-pointer"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {t("viewMore")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-muted text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">{t("headerStudent")}</th>
                  <th className="px-4 py-3 text-left">{t("headerClass")}</th>
                  <th className="px-4 py-3 text-left">
                    {t("headerHealthIssues")}
                  </th>
                  <th className="px-4 py-3 text-left">
                    {t("headerCanLeaveAlone")}
                  </th>
                  <th className="px-4 py-3 text-left">
                    {t("headerRibStatus")}
                  </th>
                  <th className="px-4 py-3 text-right">
                    {t("headerActions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="px-4 py-2 font-medium">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-4 py-2">{student.class.name}</td>
                    <td className="px-4 py-2">
                      {student.healthIssues || t("healthNone")}
                    </td>
                    <td className="px-4 py-2">
                      {student.canLeaveAlone ? t("yes") : t("no")}
                    </td>
                    <td className="px-4 py-2">
                      {student.parent.iban ? (
                        <span className="inline-flex items-center rounded-full bg-[#e8f7ee] px-2 py-0.5 text-xs font-medium text-[#2fbf6c] ring-1 ring-inset ring-green-600/20">
                          {t("ribUpdated")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-[#fdecec] px-2 py-0.5 text-xs font-medium text-[#e3342f] ring-1 ring-inset ring-red-600/20">
                          {t("ribMissing")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleView(student)}
                        className="cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-sm text-muted-foreground text-right mt-2">
            {t("totalLabel")}{" "}
            <span className="font-semibold">{total}</span>{" "}
            {t("studentsLabel", { count: total })}
          </div>
        </>
      )}

      {totalPages > 1 && (
        <DashboardPagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogDescription>{t("studentSheet")}</DialogDescription>
            <DialogTitle>
              {selectedStudent?.firstName} {selectedStudent?.lastName}
            </DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <Card className="mt-4">
              <CardContent className="space-y-3 pt-4 text-sm">
                <p>
                  <strong>{t("parentLabel")}</strong>{" "}
                  {selectedStudent.parent.firstName}{" "}
                  {selectedStudent.parent.lastName}
                </p>
                <p className="flex items-center gap-2">
                  <strong>{t("emailLabel")}</strong>{" "}
                  {selectedStudent.parent.email}
                  <Button
                    className="cursor-pointer"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        selectedStudent.parent.email
                      );
                      toast.success(t("emailCopied"));
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </p>
                <p className="flex items-center gap-2">
                  <strong>{t("phoneLabel")}</strong>{" "}
                  {selectedStudent.parent.phone}
                  <Button
                    className="cursor-pointer"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        selectedStudent.parent.phone
                      );
                      toast.success(t("phoneCopied"));
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </p>
                <p>
                  <strong>{t("bankLabel")}</strong>{" "}
                  {selectedStudent.parent.bankName || t("notProvidedFem")}
                </p>
                <p>
                  <strong>{t("ibanLabel")}</strong>{" "}
                  {selectedStudent.parent.iban || t("notProvided")}
                </p>
                <p>
                  <strong>{t("bicLabel")}</strong>{" "}
                  {selectedStudent.parent.bic || t("notProvided")}
                </p>
                <div>
                  {selectedStudent.parent.iban ? (
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      {t("ribUpdated")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                      {t("ribMissing")}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
