"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { supabase } from "../lib/supabase";

interface Props {
  studentId: string;
}

export default function DocumentUploader({ studentId }: Props) {
  const t = useTranslations("Documents");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return toast.error(t("noFile"));

    setUploading(true);

    try {
      const filePath = `${studentId}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Supabase upload failed:", uploadError);
        toast.error(t("uploadFailed"));
        return;
      }

      const { data } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      const publicUrl = data?.publicUrl;

      const payload = {
        studentId,
        url: publicUrl,
        fileName: file.name,
        fileType: file.type,
      };

      try {
        await fetch("/api/documents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        toast.error(t("networkError"));
      }

      toast.success(t("uploadSuccess"));
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Unexpected upload error:", error);
      toast.error(t("unexpectedError"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 border p-4 rounded-md shadow-sm">
      <Label>{t("fileLabel")}</Label>
      <Input
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <Button
        className="cursor-pointer"
        onClick={handleUpload}
        disabled={uploading || !file}
      >
        {uploading ? t("uploading") : t("uploadButton")}
      </Button>

      {file && (
        <p className="text-sm text-gray-600">
          {t("selectedFile", { name: file.name })}
        </p>
      )}
    </div>
  );
}
