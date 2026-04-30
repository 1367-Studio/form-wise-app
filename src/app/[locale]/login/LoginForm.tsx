"use client";

import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthShell from "@/components/auth/AuthShell";

export default function LoginForm() {
  const t = useTranslations("LoginPage");
  const tCommon = useTranslations("Common");
  const searchParams = useSearchParams();
  const prefilledEmail = searchParams?.get("email") ?? "";

  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const waitForSession = async (maxAttempts = 15) => {
    for (let i = 0; i < maxAttempts; i++) {
      const session = await getSession();
      if (session?.user?.role) return session;
      await new Promise((r) => setTimeout(r, 300));
    }
    return null;
  };

  const redirectByRole = (role: string | undefined) => {
    switch (role) {
      case "SUPER_ADMIN":
        router.push("/admin/dashboard");
        break;
      case "DIRECTOR":
        router.push("/dashboard/director");
        break;
      case "TEACHER":
        router.push("/dashboard/teacher");
        break;
      case "PARENT":
        router.push("/dashboard/parent");
        break;
      case "STAFF":
        router.push("/dashboard/staffs");
        break;
      default:
        router.push("/");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        rememberMe: rememberMe.toString(),
        callbackUrl: "/",
      });

      if (res?.error) {
        setError(t("errorInvalidCredentials"));
        setLoading(false);
        return;
      }

      if (email === "admin@formwise.app") {
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 1000);
        setLoading(false);
        return;
      }

      const session = await waitForSession();

      if (session?.user?.role) {
        redirectByRole(session.user.role);
      } else {
        setError(t("errorRetry"));
      }
    } catch (err) {
      console.log(tCommon("errorGeneric"), err);
      setError(tCommon("errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t("formTitle")}
      subtitle={
        <>
          {t("signupPrompt")}{" "}
          <Link
            href="/register"
            className="font-semibold text-[#2563EB] hover:underline"
          >
            {t("signupLink")}
          </Link>
        </>
      }
    >
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

        <div className="space-y-2">
          <Label htmlFor="password">{t("passwordLabel")}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              disabled={loading}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
              disabled={loading}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
              disabled={loading}
            />
            <Label htmlFor="remember" className="cursor-pointer text-sm font-normal text-gray-700">
              {t("rememberMe")}
            </Label>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-gray-600 hover:text-[#2563EB] hover:underline"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2563EB] text-white hover:bg-[#1D4ED8] cursor-pointer h-11 text-base font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("signingIn")}
            </>
          ) : (
            t("signInButton")
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
