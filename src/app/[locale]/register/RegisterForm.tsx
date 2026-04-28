"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Check, X, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthShell from "@/components/auth/AuthShell";

export default function RegisterForm() {
  const t = useTranslations("RegisterPage");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [error, setError] = useState("");
  const [civility, setCivility] = useState<"M." | "Mme" | "">("");
  const [schoolCode, setSchoolCode] = useState("");
  const [schoolCheck, setSchoolCheck] = useState<null | {
    valid: boolean;
    name?: string;
    error?: string;
  }>(null);

  const verifySchoolCode = async () => {
    if (!schoolCode.trim()) return;
    setVerifyingCode(true);
    setSchoolCheck(null);
    try {
      const res = await fetch(`/api/check-code?code=${schoolCode}`);
      const result = await res.json();
      setSchoolCheck(result);
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = {
      firstName,
      lastName,
      phone,
      email,
      password,
      civility,
      schoolCode: schoolCode.trim(),
    };

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || tCommon("errorGeneric"));
        setError(result.error || tCommon("errorGeneric"));
        setLoading(false);
        return;
      }

      toast.success(t("signUpSuccess"));
      router.push("/login");
    } catch (err) {
      console.error("Erreur réseau", err);
      toast.error(tCommon("networkError"));
      setError(tCommon("networkError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t("formTitle")}
      subtitle={
        <>
          {t("signinPrompt")}{" "}
          <Link
            href="/login"
            className="font-semibold text-[#f84a00] hover:underline"
          >
            {t("signinLink")}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Civility + names row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-1">
            <Label>{t("civilityLabel")}</Label>
            <Select
              value={civility}
              onValueChange={(value) => setCivility(value as "M." | "Mme")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("civilityPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M.">{t("civilityM")}</SelectItem>
                <SelectItem value="Mme">{t("civilityMrs")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="firstName">{t("firstNameLabel")}</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={loading}
              autoComplete="given-name"
            />
          </div>

          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="lastName">{t("lastNameLabel")}</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={loading}
              autoComplete="family-name"
            />
          </div>
        </div>

        {/* Phone + Email */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">{t("phoneLabel")}</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              required
              disabled={loading}
              autoComplete="tel"
              placeholder="06 12 34 56 78"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("emailLabel")}</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              disabled={loading}
              autoComplete="email"
              placeholder="vous@exemple.com"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">{t("passwordLabel")}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              required
              disabled={loading}
              autoComplete="new-password"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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

        {/* School code */}
        <div className="space-y-2 rounded-xl border border-dashed border-[#f84a00]/30 bg-[#fef1ea]/50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
            <ShieldCheck className="h-4 w-4 text-[#f84a00]" />
            <Label htmlFor="schoolCode" className="text-sm font-medium">
              {t("schoolCodeLabel")}
            </Label>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="schoolCode"
              value={schoolCode}
              onChange={(e) => {
                setSchoolCode(e.target.value);
                setSchoolCheck(null);
              }}
              disabled={loading}
              placeholder="DEMO-2026"
              className="bg-white"
            />
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer shrink-0"
              onClick={verifySchoolCode}
              disabled={loading || verifyingCode || !schoolCode.trim()}
            >
              {verifyingCode ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("verifyCodeButton")
              )}
            </Button>
          </div>
          {schoolCheck?.valid && (
            <p className="flex items-center gap-1.5 text-sm text-green-700">
              <Check className="h-4 w-4" />
              {t("schoolFound", { name: schoolCheck.name ?? "" })}
            </p>
          )}
          {schoolCheck?.valid === false && (
            <p className="flex items-center gap-1.5 text-sm text-red-600">
              <X className="h-4 w-4" />
              {schoolCheck.error || t("invalidCode")}
            </p>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          disabled={loading || (Boolean(schoolCode) && !schoolCheck?.valid)}
          className="w-full bg-[#f84a00] text-white hover:bg-[#d43e00] cursor-pointer h-11 text-base font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("loading")}
            </>
          ) : (
            t("signUpButton")
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
