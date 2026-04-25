"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function RegisterStaffPage() {
  const t = useTranslations("RegisterStaff");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email || !schoolCode || !password) {
      toast.error(t("fieldsRequired"));
      return;
    }

    setSubmitted(true);

    const res = await fetch("/api/register-staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, schoolCode }),
    });

    if (res.ok) {
      toast.success(t("successMessage"));
      router.push("/dashboard/staffs");
    } else {
      const data = await res.json();
      toast.error(data?.error || t("activationError"));
    }

    setSubmitted(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h1 className="text-xl font-bold mb-4">{t("title")}</h1>

      <Input
        type="email"
        placeholder={t("emailPlaceholder")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-4"
      />

      <Input
        placeholder={t("schoolCodePlaceholder")}
        value={schoolCode}
        onChange={(e) => setSchoolCode(e.target.value)}
        className="mb-4"
      />

      <Input
        type="password"
        placeholder={t("passwordPlaceholder")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-4"
      />

      <Button
        onClick={handleSubmit}
        className="cursor-pointer"
        disabled={submitted || !email || !schoolCode || !password}
      >
        {t("submitButton")}
      </Button>
    </div>
  );
}
