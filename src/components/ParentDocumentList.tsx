"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import DocumentTable from "./DocumentTable";

type Document = {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  createdAt: string;
};

type StudentWithDocuments = {
  id: string;
  firstName: string;
  lastName: string;
  documents: Document[];
};

export default function ParentDocumentList() {
  const t = useTranslations("Documents");
  const [students, setStudents] = useState<StudentWithDocuments[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/parent/documents")
      .then((res) => res.json())
      .then((data) => {
        setStudents(data.students || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>{t("loading")}</p>;

  return (
    <div className="space-y-6">
      {students.map((student) => (
        <DocumentTable
          key={student.id}
          studentName={`${student.firstName} ${student.lastName}`}
          documents={student.documents}
        />
      ))}
    </div>
  );
}
