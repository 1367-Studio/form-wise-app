"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

function formatIban(value: string) {
  const cleaned = value.replace(/\s/g, "").toUpperCase();
  return cleaned.match(/.{1,4}/g)?.join(" ") ?? cleaned;
}

function isLikelyValidIban(value: string) {
  const cleaned = value.replace(/\s/g, "");
  // Coarse check: 15-34 chars, starts with two letters, then digits/letters.
  return /^[A-Z]{2}[0-9A-Z]{13,32}$/.test(cleaned);
}

function isLikelyValidBic(value: string) {
  const cleaned = value.replace(/\s/g, "").toUpperCase();
  // 8 or 11 chars: 4 letters bank, 2 letters country, 2 alphanum location, optional 3 alphanum branch.
  return /^[A-Z]{4}[A-Z]{2}[0-9A-Z]{2}([0-9A-Z]{3})?$/.test(cleaned);
}

export default function RIBForm() {
  const t = useTranslations("RIBForm");
  const [iban, setIban] = useState("");
  const [bic, setBic] = useState("");
  const [bankName, setBankName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedIban, setSavedIban] = useState<string | null>(null);
  const [initial, setInitial] = useState({ iban: "", bic: "", bankName: "" });

  useEffect(() => {
    fetch("/api/rib")
      .then((r) => r.json())
      .then((data) => {
        const loadedIban = data?.iban ? formatIban(data.iban) : "";
        const loadedBic = data?.bic ? String(data.bic).toUpperCase() : "";
        const loadedBank = data?.bankName ?? "";
        setIban(loadedIban);
        if (data?.iban) setSavedIban(data.iban);
        setBic(loadedBic);
        setBankName(loadedBank);
        setInitial({ iban: loadedIban, bic: loadedBic, bankName: loadedBank });
      })
      .finally(() => setLoading(false));
  }, []);

  const isDirty =
    !submitting &&
    !loading &&
    (iban !== initial.iban ||
      bic !== initial.bic ||
      bankName !== initial.bankName);
  useUnsavedChanges(isDirty);

  const ibanValid = !iban || isLikelyValidIban(iban);
  const bicValid = !bic || isLikelyValidBic(bic);
  const isComplete = !!(iban && bic && bankName);
  const ibanLast4 = savedIban
    ? savedIban.replace(/\s/g, "").slice(-4)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!iban || !bic || !bankName) {
      toast.error(t("missingFields"));
      return;
    }
    if (!isLikelyValidIban(iban)) {
      toast.error(t("invalidIban"));
      return;
    }
    if (!isLikelyValidBic(bic)) {
      toast.error(t("invalidBic"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/rib", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          iban: iban.replace(/\s/g, "").toUpperCase(),
          bic: bic.replace(/\s/g, "").toUpperCase(),
          bankName,
        }),
      });
      if (res.ok) {
        toast.success(t("successMessage"));
        setSavedIban(iban.replace(/\s/g, "").toUpperCase());
        setInitial({ iban, bic, bankName });
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error || t("saveFailed"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
        <p className="text-sm text-gray-500">{t("subtitle")}</p>
      </div>

      {/* Status banner */}
      <div
        className={`flex items-start gap-3 rounded-2xl border p-4 ${
          isComplete && savedIban
            ? "border-emerald-100 bg-emerald-50"
            : "border-[#2563EB]/20 bg-[#EFF6FF]"
        }`}
      >
        <span
          className={`flex h-9 w-9 flex-none items-center justify-center rounded-full ${
            isComplete && savedIban
              ? "bg-emerald-100 text-emerald-700"
              : "bg-[#EFF6FF] text-[#2563EB]"
          }`}
        >
          {isComplete && savedIban ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={`text-sm font-semibold ${
                isComplete && savedIban
                  ? "text-emerald-800"
                  : "text-[#1E3A8A]"
              }`}
            >
              {isComplete && savedIban
                ? t("statusActive")
                : t("statusIncomplete")}
            </p>
            {isComplete && savedIban && (
              <Badge className="bg-white text-emerald-700 hover:bg-white">
                IBAN •••• {ibanLast4}
              </Badge>
            )}
          </div>
          <p
            className={`mt-0.5 text-xs ${
              isComplete && savedIban
                ? "text-emerald-700"
                : "text-[#1E3A8A]/80"
            }`}
          >
            {isComplete && savedIban
              ? t("statusActiveHint")
              : t("statusIncompleteHint")}
          </p>
        </div>
      </div>

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-black/10 bg-white p-6"
      >
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">
            {t("formTitle")}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("loading")}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("ibanLabel")}</Label>
              <Input
                value={iban}
                onChange={(e) => setIban(formatIban(e.target.value))}
                placeholder="FR76 3000 4000 0312 3456 7890 143"
                className={`font-mono ${
                  !ibanValid ? "border-red-300 focus-visible:ring-red-300" : ""
                }`}
                autoComplete="off"
                spellCheck={false}
              />
              {!ibanValid ? (
                <p className="text-xs text-red-600">{t("invalidIban")}</p>
              ) : (
                <p className="text-xs text-gray-500">{t("ibanHint")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t("bicLabel")}</Label>
              <Input
                value={bic}
                onChange={(e) => setBic(e.target.value.toUpperCase())}
                placeholder="BNPAFRPPXXX"
                className={`font-mono ${
                  !bicValid ? "border-red-300 focus-visible:ring-red-300" : ""
                }`}
                autoComplete="off"
                spellCheck={false}
              />
              {!bicValid ? (
                <p className="text-xs text-red-600">{t("invalidBic")}</p>
              ) : (
                <p className="text-xs text-gray-500">{t("bicHint")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t("bankNameLabel")}</Label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder={t("bankNamePlaceholder")}
                autoComplete="off"
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            className="cursor-pointer"
            disabled={submitting || loading}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitting ? t("saving") : t("submitButton")}
          </Button>
        </div>
      </form>

      {/* Trust note */}
      <div className="flex items-start gap-3 rounded-2xl border border-black/10 bg-white p-4 text-sm text-gray-600">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-emerald-600" />
        <p>{t("trustNote")}</p>
      </div>
    </div>
  );
}
