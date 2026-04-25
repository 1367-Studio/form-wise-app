"use client";

import Image from "next/image";
import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Document {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  createdAt: string;
}

interface Props {
  studentName: string;
  documents: Document[];
}

export default function DocumentTable({ studentName, documents }: Props) {
  const t = useTranslations("Documents");
  return (
    <div className="mb-8 mt-8 border rounded-md p-4">
      <h3 className="font-semibold mb-4">
        {t("studentDocsTitle", { name: studentName })}
      </h3>
      {documents.length === 0 ? (
        <p className="text-sm text-gray-500">{t("noDocuments")}</p>
      ) : (
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="w-1/2">{t("headerName")}</th>
              <th className="w-1/4 hidden sm:table-cell">{t("headerDate")}</th>
              <th className="w-1/4">{t("headerPreview")}</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-t">
                <td className="py-2 truncate">{doc.fileName}</td>
                <td className="py-2 whitespace-nowrap hidden sm:table-cell">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </td>
                <td className="py-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="cursor-pointer flex items-center gap-1">
                        <Eye className="w-4 h-4" /> {t("view")}
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>{doc.fileName}</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        {doc.fileType.startsWith("image/") ? (
                          <Image
                            src={doc.url}
                            alt={doc.fileName}
                            className="max-w-full max-h-[500px] mx-auto"
                            width={500}
                            height={500}
                          />
                        ) : doc.fileType === "application/pdf" ? (
                          <iframe
                            src={doc.url}
                            className="w-full h-[500px] rounded"
                          />
                        ) : (
                          <p>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              {t("downloadFile")}
                            </a>
                          </p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
