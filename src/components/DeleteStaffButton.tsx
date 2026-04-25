"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

type DeleteStaffButtonProps = {
  staffId: string;
  staffName: string;
  onDeletedAction: (id: string) => void;
};

export default function DeleteStaffButton({
  staffId,
  staffName,
  onDeletedAction,
}: DeleteStaffButtonProps) {
  const t = useTranslations("DeleteStaffButton");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/staffs/${staffId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onDeletedAction(staffId);
        setOpen(false);
      } else {
        console.error("Delete error");
      }
    } catch (err) {
      console.error("Network error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="icon"
          className="bg-red-100 text-red-600 transition-colors hover:bg-red-200 hover:text-red-700 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title", { name: staffName })}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{t("warning")}</p>
        <div className="flex justify-end gap-2 pt-4">
          <Button
            className="cursor-pointer"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="cursor-pointer"
          >
            {loading ? t("deleting") : t("delete")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
