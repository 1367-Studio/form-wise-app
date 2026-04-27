"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Megaphone } from "lucide-react";
import { toast } from "sonner";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

type Audience = "directors" | "all";

export default function AdminBroadcast() {
  const t = useTranslations("AdminBroadcast");
  const [audience, setAudience] = useState<Audience>("directors");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const isDirty = !sending && (subject !== "" || body !== "");
  useUnsavedChanges(isDirty);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      toast.error(t("fieldsRequired"));
      return;
    }
    setConfirmOpen(true);
  };

  const send = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/superadmin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audience,
          subject,
          html: body.includes("<") ? body : body.replace(/\n/g, "<br/>"),
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        toast.success(
          t("successMessage", {
            sent: result.sent,
            failed: result.failed,
            total: result.totalRecipients,
          })
        );
        setSubject("");
        setBody("");
      } else {
        toast.error(result.error || t("errorMessage"));
      }
    } catch {
      toast.error(t("errorMessage"));
    } finally {
      setSending(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-gray-500">{t("subtitle")}</p>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-xl border border-black/10 bg-white p-6 space-y-5 max-w-3xl"
      >
        <div className="space-y-2">
          <Label>{t("audienceLabel")}</Label>
          <Select
            value={audience}
            onValueChange={(v) => setAudience(v as Audience)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="directors">{t("audienceDirectors")}</SelectItem>
              <SelectItem value="all">{t("audienceAll")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("subjectLabel")}</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t("subjectPlaceholder")}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>{t("bodyLabel")}</Label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("bodyPlaceholder")}
            rows={10}
            required
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={sending} className="cursor-pointer">
            <Megaphone className="mr-2 h-4 w-4" />
            {sending ? t("sending") : t("sendButton")}
          </Button>
        </div>
      </form>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            {t("confirmBody", {
              count: audience === "all" ? "all users" : "all directors",
            })}
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={sending}
              className="cursor-pointer"
            >
              {t("confirmCancel")}
            </Button>
            <Button onClick={send} disabled={sending} className="cursor-pointer">
              {sending ? t("sending") : t("confirmSend")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
