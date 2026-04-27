"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

type Class = {
  id: string;
  name: string;
};

export default function SubjectForm({
  onCreated,
}: {
  onCreated?: () => void;
}) {
  const t = useTranslations("SubjectForm");
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [subjectName, setSubjectName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isDirty =
    !submitting && (subjectName.trim() !== "" || selectedClassId !== "");
  useUnsavedChanges(isDirty);

  const loadClasses = async () => {
    const res = await fetch("/api/classes");
    const data = await res.json();
    setClasses(data.classes || []);
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim() || !selectedClassId) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: subjectName, classId: selectedClassId }),
      });

      if (res.ok) {
        setSubjectName("");
        setSelectedClassId("");
        onCreated?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className=" flex flex-col gap-2 max-w-md">
      <Label>{t("classLabel")}</Label>
      <Select value={selectedClassId} onValueChange={setSelectedClassId}>
        <SelectTrigger>
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
      <div className="flex flex-col gap-2">
        <Label>{t("nameLabel")}</Label>
        <Input
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          required
        />
      </div>
      <Button
        type="submit"
        className="cursor-pointer"
        disabled={submitting || !subjectName.trim() || !selectedClassId}
      >
        {t("submitButton")} <Plus />
      </Button>
    </form>
  );
}
