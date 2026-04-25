"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  healthIssues: string | null;
  canLeaveAlone: boolean;
  parent: {
    firstName: string;
    lastName: string;
  };
};

export default function StudentListTeacher() {
  const t = useTranslations("StudentListTeacher");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/teachers/students");
        const data = await res.json();
        setStudents(data || []);
      } catch (err) {
        console.error("Students fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (students.length === 0) {
    return <p className="text-muted-foreground">{t("emptyMessage")}</p>;
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border shadow-sm mt-6">
        <table className="min-w-full text-sm">
          <thead className="bg-muted text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">{t("headerStudent")}</th>
              <th className="px-4 py-3 text-left">{t("headerParent")}</th>
              <th className="px-4 py-3 text-left">
                {t("headerHealthIssues")}
              </th>
              <th className="px-4 py-3 text-left">
                {t("headerCanLeaveAlone")}
              </th>
              <th className="px-4 py-3 text-right">{t("headerActions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-4 py-2 font-medium">
                  {student.firstName} {student.lastName}
                </td>
                <td className="px-4 py-2">
                  {student.parent.firstName} {student.parent.lastName}
                </td>
                <td className="px-4 py-2">
                  {student.healthIssues || t("healthNone")}
                </td>
                <td className="px-4 py-2">
                  {student.canLeaveAlone ? t("yes") : t("no")}
                </td>
                <td className="px-4 py-2 text-right">
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
                <p>
                  <strong>{t("healthIssuesLabel")}</strong>{" "}
                  {selectedStudent.healthIssues || t("healthNone")}
                </p>
                <p>
                  <strong>{t("canLeaveAloneLabel")}</strong>{" "}
                  {selectedStudent.canLeaveAlone ? t("yes") : t("no")}
                </p>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
