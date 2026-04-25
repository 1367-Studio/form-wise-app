"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import DocumentUploader from "./DocumentUploader";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
};

export default function DocumentManager() {
  const t = useTranslations("Documents");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  useEffect(() => {
    const fetchStudents = async () => {
      const res = await fetch("/api/students/me");
      if (!res.ok) return toast.error(t("loadStudentsError"));

      const data = await res.json();
      setStudents(data.students || []);
    };

    fetchStudents();
  }, [t]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{t("managerTitle")}</h2>

      <div className="space-y-2">
        <Label>{t("chooseStudent")}</Label>
        <Select onValueChange={setSelectedStudentId}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder={t("studentPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem key={student.id} value={student.id}>
                {student.firstName} {student.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedStudentId && <DocumentUploader studentId={selectedStudentId} />}
    </div>
  );
}
