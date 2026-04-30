"use client";

import { useState } from "react";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthShell from "@/components/auth/AuthShell";

export default function ForgotPasswordForm() {
  const t = useTranslations("ForgotPassword");
  const tLogin = useTranslations("LoginPage");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      toast.success(t("successMessage"));
      setSubmitted(true);
    } else {
      toast.error(data.error || t("errorMessage"));
    }
  };

  return (
    <AuthShell
      title={t("formTitle")}
      subtitle={t("emailLabel")}
      footer={
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-medium text-gray-700 hover:text-[#2563EB] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {tLogin("signInButton")}
        </Link>
      }
    >
      {submitted ? (
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
            <Mail className="h-7 w-7" />
          </div>
          <p className="text-sm text-gray-700">{t("successMessage")}</p>
          <p className="mt-1 text-xs text-gray-500 break-all">{email}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">{t("emailLabel")}</Label>
            <div className="relative">
              <Mail
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              />
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="vous@exemple.com"
                className="pl-9"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2563EB] text-white hover:bg-[#1D4ED8] cursor-pointer h-11 text-base font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("sending")}
              </>
            ) : (
              t("sendButton")
            )}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
