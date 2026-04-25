"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface DocumentPreviewProps {
  url: string;
  fileName: string;
  fileType: string;
}

export default function DocumentPreview({
  url,
  fileName,
  fileType,
}: DocumentPreviewProps) {
  const t = useTranslations("Documents");
  if (fileType.startsWith("image/")) {
    return (
      <div className="mt-2">
        <Image
          src={url}
          alt={fileName}
          width={300}
          height={200}
          className="rounded border shadow"
        />
      </div>
    );
  }

  if (fileType === "application/pdf") {
    return (
      <div className="mt-2">
        <iframe
          src={url}
          className="w-full max-w-md h-64 rounded border"
          title={fileName}
        />
      </div>
    );
  }

  return (
    <div className="mt-2">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        {t("downloadNamed", { name: fileName })}
      </a>
    </div>
  );
}
