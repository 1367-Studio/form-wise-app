"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Document {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  createdAt: string;
}

interface StudentWithDocuments {
  id: string;
  firstName: string;
  lastName: string;
  documents: Document[];
}

interface ClassItem {
  id: string;
  name: string;
}

export default function DirectorDocumentList() {
  const t = useTranslations("Documents");
  const [students, setStudents] = useState<StudentWithDocuments[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [code, setCode] = useState("");
  const pageSize = 5;

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");

  useEffect(() => {
    const fetchClasses = async () => {
      const res = await fetch("/api/classes");
      const data = await res.json();
      setClasses(data.classes || []);
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          ...(search ? { search } : {}),
          ...(selectedClass ? { classId: selectedClass } : {}),
          ...(code ? { code } : {}),
        });

        const res = await fetch(`/api/director/documents?${params}`);
        const data = await res.json();
        setStudents(data.students || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error("Documents fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [page, search, selectedClass, code]);

  const handlePreview = (doc: Document) => {
    setSelectedDoc(doc);
    setModalOpen(true);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
        <Input
          placeholder={t("codeFilterPlaceholder")}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
        <select
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setPage(1);
          }}
          className="border rounded px-3 py-2"
        >
          <option value="">{t("allClasses")}</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>{t("loading")}</p>
      ) : (
        <>
          {students.map((student) => (
            <div key={student.id} className="border p-4 rounded shadow-sm">
              <h3 className="font-semibold mb-2">
                {t("studentDocsTitle", {
                  name: `${student.firstName} ${student.lastName}`,
                })}
              </h3>

              {student.documents.length === 0 ? (
                <p className="text-sm text-gray-500">{t("noDocuments")}</p>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm table-fixed">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left p-2 w-1/3">
                            {t("headerFileName")}
                          </th>
                          <th className="text-left p-2 w-1/4">
                            {t("headerDate")}
                          </th>
                          <th className="text-left p-2 w-1/4">
                            {t("headerType")}
                          </th>
                          <th className="text-left p-2 w-1/6">
                            {t("headerPreview")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {student.documents.map((doc) => (
                          <tr key={doc.id} className="border-t">
                            <td className="p-2 truncate">{doc.fileName}</td>
                            <td className="p-2">
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-2">{doc.fileType}</td>
                            <td className="p-2">
                              <button onClick={() => handlePreview(doc)}>
                                <Eye className="w-4 h-4 hover:scale-110 cursor-pointer transition" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="block md:hidden space-y-4">
                    {student.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="border p-3 rounded shadow-sm bg-white space-y-1"
                      >
                        <p className="text-sm font-semibold">{doc.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs">{doc.fileType}</p>
                        <button
                          onClick={() => handlePreview(doc)}
                          className="text-blue-500 text-sm mt-1 flex items-center cursor-pointer gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          {t("previewMobile")}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <Button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="cursor-pointer"
              >
                {t("previousPage")}
              </Button>
              <span>
                {t("pageStatus", { current: page, total: totalPages })}
              </span>
              <Button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="cursor-pointer"
                disabled={page === totalPages}
              >
                {t("nextPage")}
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {t("previewTitle", { name: selectedDoc?.fileName ?? "" })}
            </DialogTitle>
          </DialogHeader>
          {selectedDoc?.fileType.includes("pdf") ? (
            <iframe
              src={selectedDoc.url}
              className="w-full h-[70vh]"
              title={t("pdfAlt")}
            />
          ) : (
            selectedDoc?.url && (
              <Image
                src={selectedDoc.url}
                alt={selectedDoc.fileName}
                className="w-full max-h-[70vh] object-contain"
                width={800}
                height={600}
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
