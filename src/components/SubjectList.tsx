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
import { useTranslations } from "next-intl";

interface SchoolClass {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  class: {
    id: string;
    name: string;
  };
  teachers: {
    user: {
      firstName: string;
      lastName: string;
    };
  }[];
}

export default function SubjectList() {
  const t = useTranslations("SubjectList");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  useEffect(() => {
    const fetchClasses = async () => {
      const res = await fetch("/api/classes", { credentials: "include" });
      const data = await res.json();
      setClasses(data.classes || []);
    };

    const fetchSubjects = async () => {
      const res = await fetch("/api/subjects", { credentials: "include" });
      const data = await res.json();
      setSubjects(data.subjects || []);
    };

    fetchClasses();
    fetchSubjects();
  }, []);

  const filteredSubjects = subjects.filter(
    (s) => s.class?.id === selectedClassId
  );

  return (
    <div className="space-y-6 mt-6">
      <div className="space-y-2">
        <Label
          htmlFor="class-select"
          className="text-sm font-medium text-muted-foreground"
        >
          {t("chooseClass")}
        </Label>
        <Select value={selectedClassId} onValueChange={setSelectedClassId}>
          <SelectTrigger id="class-select" className="w-48">
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

      {selectedClassId && (
        <div key={selectedClassId} className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground">
            {t("subjectsForClass", {
              name: classes.find((c) => c.id === selectedClassId)?.name ?? "",
            })}
          </h2>

          {filteredSubjects.length === 0 ? (
            <p className="text-muted-foreground">{t("emptyState")}</p>
          ) : (
            <div className="overflow-x-auto rounded-md border shadow-sm">
              <table className="min-w-full text-sm">
                <thead className="bg-muted text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      {t("headerSubject")}
                    </th>
                    <th className="px-4 py-3 text-left">
                      {t("headerTeacher")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredSubjects.map((subject) => (
                    <tr key={subject.id} className="hover:bg-muted/20">
                      <td className="px-4 py-2 font-medium">{subject.name}</td>
                      <td className="px-4 py-2">
                        {subject.teachers.length > 0 &&
                        subject.teachers[0].user ? (
                          `${subject.teachers[0].user.firstName} ${subject.teachers[0].user.lastName}`
                        ) : (
                          <span className="text-muted-foreground italic">
                            {t("noTeacher")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
