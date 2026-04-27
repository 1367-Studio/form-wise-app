"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function InviteParentsPage() {
  const t = useTranslations("InviteParents");
  const [emails, setEmails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    setLoading(true);
    const emailList = emails
      .split(/[\n,;]+/)
      .map((email) => email.trim())
      .filter((email) => email);

    if (emailList.length === 0) {
      toast.error(t("errorEmpty"));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/invite-parent", {
        method: "POST",
        body: JSON.stringify({ emails: emailList }),
        headers: { "Content-Type": "application/json" },
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || t("errorSend"));
      } else {
        toast.success(t("successMessage"));
        setEmails("");
      }
    } catch (err) {
      console.log("Network error", err);
      toast.error(t("errorNetwork"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-md shadow-md mt-10">
      <h1 className="text-xl font-bold mb-4">{t("title")}</h1>
      <Textarea
        placeholder={t("placeholder")}
        value={emails}
        onChange={(e) => setEmails(e.target.value)}
        rows={6}
      />
      <Button
        onClick={handleInvite}
        className="mt-4 cursor-pointer"
        disabled={loading}
      >
        {loading ? t("sending") : t("submitButton")}
      </Button>
    </div>
  );
}
