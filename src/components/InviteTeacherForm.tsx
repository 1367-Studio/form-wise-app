"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

export default function InviteTeacherForm({
  onInvited,
}: {
  onInvited?: () => void;
}) {
  const t = useTranslations("InviteTeacherForm");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/invite-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          phone: "0000000000",
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch (err) {
        console.error("JSON parse error:", err);
        throw new Error("Invalid server response");
      }
      if (data.success) {
        setSuccess(t("successInvited", { email }));
        setEmail("");
        setFirstName("");
        setLastName("");
        if (onInvited) onInvited();
      } else {
        setError(data.error || t("errorGeneric"));
      }
    } catch (err) {
      console.error("Invite teacher error:", err);
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {success && (
        <p className="text-green-600 bg-green-100 border p-3 rounded">
          {success}
        </p>
      )}
      {error && (
        <p className="text-red-600 bg-red-100 border p-3 rounded">{error}</p>
      )}

      <div className="flex flex-col gap-2">
        <Label>{t("firstNameLabel")}</Label>
        <Input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("lastNameLabel")}</Label>
        <Input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("emailLabel")}</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="cursor-pointer">
        {loading ? t("sending") : t("submitButton")}
      </Button>
    </form>
  );
}
