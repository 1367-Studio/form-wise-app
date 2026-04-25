"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function RIBForm() {
  const t = useTranslations("RIBForm");
  const [form, setForm] = useState({
    iban: "",
    bic: "",
    bankName: "",
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/rib")
      .then((res) => res.json())
      .then((data) => {
        setForm({
          iban: data.iban || "",
          bic: data.bic || "",
          bankName: data.bankName || "",
        });
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/rib", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="iban">{t("ibanLabel")}</Label>
        <Input name="iban" value={form.iban} onChange={handleChange} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="bic">{t("bicLabel")}</Label>
        <Input name="bic" value={form.bic} onChange={handleChange} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="bankName">{t("bankNameLabel")}</Label>
        <Input
          name="bankName"
          value={form.bankName}
          onChange={handleChange}
          required
        />
      </div>
      <Button type="submit" className="cursor-pointer">
        {t("submitButton")}
      </Button>
      {success && (
        <p className="text-green-600 text-sm">{t("successMessage")}</p>
      )}
    </form>
  );
}
