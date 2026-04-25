"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  LogOut,
  Crown,
  Ban,
  FileText,
  ShieldCheck,
  Gavel,
  Copy,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import SupportButton from "./SupportButton";
import { format } from "date-fns";
import { fr, enGB, ptBR, es } from "date-fns/locale";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";

const dateLocales = { fr, en: enGB, pt: ptBR, es } as const;

export default function AppHeader() {
  const t = useTranslations("AppHeader");
  const locale = useLocale() as keyof typeof dateLocales;
  const { data: session, status, update } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const schoolCode = session?.user?.schoolCode || null;

  useEffect(() => {
    const success = searchParams?.get("success") ?? null;

    if (success === "true" && !isRefreshing) {
      setIsRefreshing(true);

      (async () => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await update({ trigger: "update" });
          await new Promise((resolve) => setTimeout(resolve, 1000));
          toast.success(t("subscriptionActivated"));
        } catch (err) {
          console.error("Session update error:", err);
          toast.error(t("sessionUpdateError"));
        } finally {
          const newParams = new URLSearchParams(searchParams?.toString());
          newParams.delete("success");
          router.replace(`?${newParams.toString()}`, { scroll: false });
          setIsRefreshing(false);
        }
      })();
    }
  }, [searchParams, update, router, isRefreshing, t]);

  if (status === "loading") return null;

  const firstName = session?.user?.firstName || "";
  const lastName = session?.user?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || t("defaultUser");
  const initials = [firstName, lastName]
    .map((n) => n?.[0] || "")
    .join("")
    .toUpperCase();

  const billingPlan = session?.user?.billingPlan || "MONTHLY";
  const subscriptionStatus = session?.user?.subscriptionStatus || "FREE_TRIAL";
  const trialEndsAt = session?.user?.trialEndsAt
    ? new Date(session.user.trialEndsAt)
    : null;
  const formattedDate = trialEndsAt
    ? format(trialEndsAt, "dd MMMM yyyy", {
        locale: dateLocales[locale] ?? fr,
      })
    : null;

  const label =
    subscriptionStatus === "ACTIVE"
      ? billingPlan === "MONTHLY"
        ? formattedDate
          ? t("monthlyRenewsOn", { date: formattedDate })
          : t("monthlySubscription")
        : formattedDate
          ? t("annualRenewsOn", { date: formattedDate })
          : t("annualSubscription")
      : trialEndsAt
        ? t("trialUntil", { date: formattedDate ?? "" })
        : t("freePlan");

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-white">
      <div className="flex items-center gap-3">
        <div className="bg-black text-white rounded-md p-2 text-xs font-bold">
          {initials}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <div className="text-left">
              <div className="leading-none">{fullName}</div>
              {!["SUPER_ADMIN", "TEACHER", "PARENT", "STAFF"].includes(
                session?.user?.role || ""
              ) && (
                <div className="text-xs text-muted-foreground">
                  {label}
                  {isRefreshing && ` ${t("sessionUpdating")}`}
                </div>
              )}
            </div>
            <ChevronDown className="w-4 h-4 ml-1" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {session?.user?.role === "DIRECTOR" && (
              <>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push("/dashboard/billing")}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  <span className="text-sm">{t("upgradePlan")}</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push("/dashboard/resiliation")}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  <span className="text-sm">{t("cancelSubscription")}</span>
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => router.push("/politique-de-confidentialite")}
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              <span className="text-sm">{t("privacyPolicy")}</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => router.push("/cgu")}
            >
              <FileText className="w-4 h-4 mr-2" />
              <span className="text-sm">{t("termsOfUse")}</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => router.push("/cgs")}
            >
              <Gavel className="w-4 h-4 mr-2" />
              <span className="text-sm">{t("termsOfService")}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => signOut()}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t("signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {schoolCode && session?.user?.role === "DIRECTOR" && (
        <div className="hidden md:flex flex-col items-start ml-6 text-xs text-muted-foreground gap-1">
          <div className="flex items-center gap-1">
            <span>{t("schoolCodeLabel")}</span>
            <span className="font-medium">{schoolCode}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(schoolCode);
                toast.success(t("codeCopied"));
              }}
              className="hover:text-black transition cursor-pointer"
              title={t("copyCode")}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <span>{t("signupLinkLabel")}</span>
            <span className="font-medium">
              https://www.formwise.fr/preinscription?schoolCode={schoolCode}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `https://www.formwise.fr/preinscription?schoolCode=${schoolCode}`
                );
                toast.success(t("linkCopied"));
              }}
              className="hover:text-black transition cursor-pointer"
              title={t("copyLink")}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="hidden md:block">
        <SupportButton />
      </div>
    </header>
  );
}
