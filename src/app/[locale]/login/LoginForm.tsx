"use client";

import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    <div className="flex min-h-full flex-1">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Link href="/" aria-label="formwise">
            <Logo />
          </Link>

          <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">
            {t("formTitle")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("signupPrompt")}{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline"
            >
              {t("signupLink")}
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t("emailLabel")}</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
                  disabled={loading}
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
                <Label htmlFor="remember">{t("rememberMe")}</Label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-muted-foreground hover:underline"
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
              className="w-full cursor-pointer"
            >
              {loading ? t("signingIn") : t("signInButton")}
            </Button>
          </form>
        </div>
      </div>

      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 my-auto -m-2 flex items-center justify-center rounded-xl bg-white-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl lg:p-4">
          <Image
            alt="Formwise illustration"
            src="https://cdn.sanity.io/media-libraries/mllo1PEUbcwG/images/2fd0af2464672b561c6723175f359c3274473381-2868x1598.png"
            width={1500}
            height={1598}
            priority
            className="rounded-md shadow-2xl ring-1 ring-gray-900/10 object-contain max-h-[90vh]"
          />
        </div>
      </div>
    </div>
  );
}
