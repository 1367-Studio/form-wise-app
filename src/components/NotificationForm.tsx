"use client";

import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
};

type Teacher = {
  id: string;
  user: {
    firstName: string;
    lastName: string;
  };
};

export default function NotificationForm({ onSent }: { onSent?: () => void }) {
  const t = useTranslations("NotificationForm");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  const [targetType, setTargetType] = useState<
    "global_parents" | "student" | "global_teachers" | "teacher"
  >("global_parents");

  useEffect(() => {
    if (targetType === "student") {
      fetch("/api/students/all")
        .then((res) => res.json())
        .then((data) => {
          setStudents(data.students || []);
        });
    } else if (targetType === "teacher") {
      fetch("/api/teachers")
        .then((res) => res.json())
        .then((data) => {
          setTeachers(data.teachers || []);
        });
    }
  }, [targetType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        message,
        targetType,
        studentId: targetType === "student" ? studentId : null,
        teacherId: targetType === "teacher" ? teacherId : null,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("API error:", errorText);
      toast.error(t("errorMessage"));
      return;
    }

    const data = await res.json();

    if (data.success) {
      toast.success(t("successMessage"));
      setTitle("");
      setMessage("");
      setStudentId(null);
      setTeacherId(null);
      setTargetType("global_parents");
      onSent?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="flex flex-col gap-2">
        <Label>{t("titleLabel")}</Label>
        <Input
          placeholder={t("titlePlaceholder")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("messageLabel")}</Label>
        <Input
          placeholder={t("messagePlaceholder")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("typeLabel")}</Label>
        <Select
          value={targetType}
          onValueChange={(value) => setTargetType(value as typeof targetType)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("typePlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="global_parents">{t("typeAllParents")}</SelectItem>
            <SelectItem value="student">{t("typeStudent")}</SelectItem>
            <SelectItem value="global_teachers">
              {t("typeAllTeachers")}
            </SelectItem>
            <SelectItem value="teacher">{t("typeTeacher")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {targetType === "student" && (
        <div className="flex flex-col gap-2">
          <Label>{t("chooseStudent")}</Label>
          <Select
            value={studentId || ""}
            onValueChange={(value) => setStudentId(value)}
          >
            <SelectTrigger>
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
      )}

      {targetType === "teacher" && (
        <div className="flex flex-col gap-2">
          <Label>{t("chooseTeacher")}</Label>
          <Select
            value={teacherId || ""}
            onValueChange={(value) => setTeacherId(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("teacherPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.user.firstName} {teacher.user.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button type="submit" className="cursor-pointer">
        {t("submitButton")} <Send />
      </Button>
    </form>
  );
}
