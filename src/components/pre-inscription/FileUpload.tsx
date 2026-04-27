"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface FileUploadProps {
  onUploadCompleteAction: (uploadedUrls: {
    motivationLetterUrl: string | null;
    schoolResultsUrl: string | null;
    familyBookUrl: string | null;
  }) => void;
}

export default function FileUpload({
  onUploadCompleteAction,
}: FileUploadProps) {
  const t = useTranslations("Preinscription");
  const [files, setFiles] = useState<{
    motivationLetter?: File;
    schoolResults?: File;
    familyBook?: File;
  }>({});

  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    setUploading(true);

    const uploadOne = async (file: File | undefined, folder: string) => {
      if (!file) return null;

      const cleanFileName = file.name
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9.\-_]/g, "");

      const path = `${folder}/${Date.now()}-${cleanFileName}`;

      const { data, error } = await supabase.storage
        .from("preinscriptions")
        .upload(path, file);

      if (error) {
        console.error(`Upload error ${folder}:`, error.message);
        toast.error(t("uploadError", { folder, error: error.message }));
        return null;
      }

      const url = supabase.storage
        .from("preinscriptions")
        .getPublicUrl(data.path);

      return url.data.publicUrl;
    };

    const [motivationLetterUrl, schoolResultsUrl, familyBookUrl] =
      await Promise.all([
        uploadOne(files.motivationLetter, "motivation"),
        uploadOne(files.schoolResults, "results"),
        uploadOne(files.familyBook, "livret"),
      ]);

    onUploadCompleteAction({
      motivationLetterUrl,
      schoolResultsUrl,
      familyBookUrl,
    });

    toast.success(t("filesUploaded"));
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t("filesSectionTitle")}</h3>

      <div className="space-y-2">
        <Label>{t("fileMotivationLetter")}</Label>
        <Input
          type="file"
          accept=".pdf,.jpg,.png"
          onChange={(e) =>
            setFiles((f) => ({ ...f, motivationLetter: e.target.files?.[0] }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label>{t("fileSchoolResults")}</Label>
        <Input
          type="file"
          accept=".pdf,.jpg,.png"
          onChange={(e) =>
            setFiles((f) => ({ ...f, schoolResults: e.target.files?.[0] }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label>{t("fileFamilyBook")}</Label>
        <Input
          type="file"
          accept=".pdf,.jpg,.png"
          onChange={(e) =>
            setFiles((f) => ({ ...f, familyBook: e.target.files?.[0] }))
          }
        />
      </div>

      <Button
        type="button"
        onClick={handleUpload}
        disabled={uploading}
        className="cursor-pointer"
      >
        {uploading ? t("uploading") : t("uploadButton")}
      </Button>
    </div>
  );
}
