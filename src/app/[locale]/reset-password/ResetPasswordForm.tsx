"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ArrowLeft, Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthShell from "@/components/auth/AuthShell";

export const dynamic = "force-dynamic";

export default function ResetPasswordForm() {
  const t = useTranslations("ResetPassword");
  const tLogin = useTranslations("LoginPage");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordsMatch = password.length > 0 && password === confirm;
  const passwordsMismatch = confirm.length > 0 && password !== confirm;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error(t("passwordsDontMatch"));
      return;
    }

    setLoading(true);

    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      toast.success(t("successMessage"));
      router.push("/login");
    } else {
      toast.error(data.error || t("errorMessage"));
    }
  };

  return (
    <AuthShell
      title={t("formTitle")}
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
      <form onSubmit={handleReset} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="new-password">{t("newPasswordPlaceholder")}</Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="••••••••"
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">
            {t("confirmPasswordPlaceholder")}
          </Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirm ? "text" : "password"}
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
              placeholder="••••••••"
              className="pr-10"
              aria-invalid={passwordsMismatch}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
              onClick={() => setShowConfirm(!showConfirm)}
              disabled={loading}
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {passwordsMatch && (
            <p className="flex items-center gap-1.5 text-xs text-green-700">
              <Check className="h-3.5 w-3.5" />
              OK
            </p>
          )}
          {passwordsMismatch && (
            <p className="flex items-center gap-1.5 text-xs text-red-600">
              <X className="h-3.5 w-3.5" />
              {t("passwordsDontMatch")}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading || !passwordsMatch}
          className="w-full bg-[#2563EB] text-white hover:bg-[#1D4ED8] cursor-pointer h-11 text-base font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("submitting")}
            </>
          ) : (
            t("submitButton")
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
