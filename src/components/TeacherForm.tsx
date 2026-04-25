"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { Teacher } from "./TeacherList";

type Subject = {
  id: string;
  name: string;
};

type Class = {
  id: string;
  name: string;
};

export default function TeacherForm({
  teacher,
  onCreated,
}: {
  teacher: Teacher | null;
  onCreated: (t: Teacher) => void;
}) {
  const t = useTranslations("TeacherForm");
  const [subjectId, setSubjectId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (teacher) {
      setSubjectId(teacher.subject?.id || "");
      setClassId(teacher.class?.id || "");
    } else {
      setSubjectId("");
      setClassId("");
    }
  }, [teacher]);

  useEffect(() => {
    const fetchData = async () => {
      const [subjectsRes, classesRes] = await Promise.all([
        fetch("/api/subjects"),
        fetch("/api/classes"),
      ]);

      const subjectsData = await subjectsRes.json();
      const classesData = await classesRes.json();

      setSubjects(subjectsData.subjects || []);
      setClasses(classesData.classes || []);
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/teachers/${teacher.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          classId,
        }),
      });

      const data = await res.json();
      if (data.success && data.teacher) {
        onCreated(data.teacher);
      }
    } catch (err) {
      console.error("Teacher update error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!teacher) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md border p-4 rounded-md"
    >
      <h3 className="text-lg font-semibold">
        {t("title", { name: `${teacher.firstName} ${teacher.lastName}` })}
      </h3>

      <div className="flex flex-col gap-2">
        <Label>{t("subjectLabel")}</Label>
        <Select value={subjectId} onValueChange={setSubjectId}>
          <SelectTrigger>
            <SelectValue placeholder={t("subjectPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("classLabel")}</Label>
        <Select value={classId} onValueChange={setClassId}>
          <SelectTrigger>
            <SelectValue placeholder={t("classPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button className="cursor-pointer" type="submit" disabled={loading}>
        {loading ? t("saving") : t("saveButton")}
      </Button>
    </form>
  );
}
