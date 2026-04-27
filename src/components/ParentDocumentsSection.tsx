"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  FileType,
  File as FileIcon,
  Upload,
  Download,
  Eye,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionSkeleton } from "./SectionSkeleton";
import DocumentUploader from "./DocumentUploader";

type Doc = {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  createdAt: string;
};

type StudentWithDocs = {
  id: string;
  firstName: string;
  lastName: string;
  documents: Doc[];
};

function fileIcon(type: string) {
  if (type.startsWith("image/")) return <FileImage className="h-5 w-5" />;
  if (type === "application/pdf") return <FileType className="h-5 w-5" />;
  if (type.includes("sheet") || type.includes("excel"))
    return <FileSpreadsheet className="h-5 w-5" />;
  if (type.includes("word") || type === "text/plain")
    return <FileText className="h-5 w-5" />;
  return <FileIcon className="h-5 w-5" />;
}

function shortType(type: string) {
  if (type.startsWith("image/")) return type.split("/")[1].toUpperCase();
  if (type === "application/pdf") return "PDF";
  if (type.includes("word")) return "DOC";
  if (type.includes("sheet") || type.includes("excel")) return "XLSX";
  if (type === "text/plain") return "TXT";
  return type.split("/")[1]?.toUpperCase() ?? "FILE";
}

export default function ParentDocumentsSection() {
  const t = useTranslations("ParentDocuments");
  const [students, setStudents] = useState<StudentWithDocs[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadStudentId, setUploadStudentId] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");
  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/parent/documents");
      const data = await res.json();
      setStudents(data.students || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const filteredStudents = useMemo(
    () =>
      filter === "all" ? students : students.filter((s) => s.id === filter),
    [students, filter]
  );

  const totalDocs = useMemo(
    () => students.reduce((sum, s) => sum + s.documents.length, 0),
    [students]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {t("title")}
          </h1>
          <p className="text-sm text-gray-500">
            {t("subtitle", { count: totalDocs })}
          </p>
        </div>
        <Dialog
          open={uploadOpen}
          onOpenChange={(o) => {
            setUploadOpen(o);
            if (!o) {
              setUploadStudentId("");
              fetchDocs();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              {t("uploadButton")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("uploadDialogTitle")}</DialogTitle>
              <DialogDescription>
                {t("uploadDialogSubtitle")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Select
                value={uploadStudentId}
                onValueChange={setUploadStudentId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("studentPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {uploadStudentId && (
                <DocumentUploader studentId={uploadStudentId} />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {students.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <FilterPill
            active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            {t("filterAll")}
          </FilterPill>
          {students.map((s) => (
            <FilterPill
              key={s.id}
              active={filter === s.id}
              onClick={() => setFilter(s.id)}
              count={s.documents.length}
            >
              {s.firstName} {s.lastName}
            </FilterPill>
          ))}
        </div>
      )}

      {loading ? (
        <SectionSkeleton variant="cards" rows={4} />
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <FileText className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {t("emptyNoChildrenTitle")}
          </h2>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            {t("emptyNoChildrenHint")}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredStudents.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-black/10 bg-white p-6"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                    {(s.firstName[0] ?? "") + (s.lastName[0] ?? "")}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {s.firstName} {s.lastName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {t("docsCount", { count: s.documents.length })}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => {
                    setUploadStudentId(s.id);
                    setUploadOpen(true);
                  }}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  {t("addDoc")}
                </Button>
              </div>

              {s.documents.length === 0 ? (
                <div className="rounded-lg border border-dashed border-black/10 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                  {t("noDocs")}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {s.documents.map((d) => (
                    <DocCard
                      key={d.id}
                      doc={d}
                      onPreview={() => setPreviewDoc(d)}
                      t={t}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Preview dialog */}
      <Dialog
        open={!!previewDoc}
        onOpenChange={(o) => !o && setPreviewDoc(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {previewDoc && (
            <>
              <DialogHeader>
                <DialogTitle className="truncate">
                  {previewDoc.fileName}
                </DialogTitle>
                <DialogDescription>
                  {shortType(previewDoc.fileType)} ·{" "}
                  {new Date(previewDoc.createdAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                {previewDoc.fileType.startsWith("image/") ? (
                  <Image
                    src={previewDoc.url}
                    alt={previewDoc.fileName}
                    className="mx-auto max-h-[600px] max-w-full rounded"
                    width={800}
                    height={600}
                  />
                ) : previewDoc.fileType === "application/pdf" ? (
                  <iframe
                    src={previewDoc.url}
                    className="h-[600px] w-full rounded border border-black/10"
                  />
                ) : (
                  <a
                    href={previewDoc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#f84a00] underline"
                  >
                    <Download className="h-4 w-4" />
                    {t("download")}
                  </a>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium cursor-pointer transition-colors ${
        active
          ? "border-[#f84a00] bg-[#f84a00] text-white"
          : "border-black/10 bg-white text-gray-700 hover:border-[#f84a00]/30 hover:text-[#f84a00]"
      }`}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
            active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function DocCard({
  doc,
  onPreview,
  t,
}: {
  doc: Doc;
  onPreview: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="group relative flex flex-col gap-2 rounded-xl border border-black/10 bg-white p-4 transition-all hover:border-[#f84a00]/30 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-[#fef1ea] text-[#f84a00]">
          {fileIcon(doc.fileType)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">
            {doc.fileName}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className="border-black/10 bg-gray-50 text-[10px] text-gray-700"
            >
              {shortType(doc.fileType)}
            </Badge>
            <span className="text-[10px] text-gray-500">
              {new Date(doc.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 cursor-pointer"
          onClick={onPreview}
        >
          <Eye className="mr-1.5 h-3.5 w-3.5" />
          {t("view")}
        </Button>
        <a
          href={doc.url}
          download={doc.fileName}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center justify-center rounded-md border border-black/10 px-3 text-xs text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer"
          aria-label={t("download")}
        >
          <Download className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
