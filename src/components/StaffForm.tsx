"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function StaffForm() {
  const t = useTranslations("StaffForm");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roleLabel, setRoleLabel] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/invite-staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone,
        roleLabel,
      }),
    });

    if (res.ok) {
      toast.success(t("successMessage"));
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setRoleLabel("");
    } else {
      toast.error(t("errorMessage"));
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mb-8">
      <div>
        <Label>{t("firstNameLabel")}</Label>
        <Input
          type="text"
          placeholder={t("firstNamePlaceholder")}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>

      <div>
        <Label>{t("lastNameLabel")}</Label>
        <Input
          type="text"
          placeholder={t("lastNamePlaceholder")}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      <div>
        <Label>{t("emailLabel")}</Label>
        <Input
          type="email"
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <Label>{t("phoneLabel")}</Label>
        <Input
          type="tel"
          placeholder={t("phonePlaceholder")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div>
        <Label>{t("roleLabel")}</Label>
        <Input
          type="text"
          placeholder={t("rolePlaceholder")}
          value={roleLabel}
          onChange={(e) => setRoleLabel(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={loading} className="cursor-pointer">
        {loading ? t("sending") : t("submitButton")}
      </Button>
    </form>
  );
}
