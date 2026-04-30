"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NewsletterSection() {
  const t = useTranslations("Newsletter");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(t("successMessage"));
        setEmail("");
      } else {
        toast.error(data.error || t("errorMessage"));
      }
    } catch (error) {
      console.error(error);
      toast.error(t("networkError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="paper-bg py-16 sm:py-24">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative isolate flex flex-col gap-10 overflow-hidden bg-black px-6 py-20 shadow-xl sm:rounded-3xl sm:px-16 lg:px-20 xl:flex-row xl:items-center xl:py-24">
          <h2 className="relative max-w-xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl xl:flex-auto">
            {t("title")}
          </h2>

          <form onSubmit={handleSubmit} className="relative w-full max-w-md">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="email-address" className="sr-only">
                {t("emailLabel")}
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                placeholder={t("emailPlaceholder")}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-w-0 flex-auto rounded-md bg-white/5 px-4 py-2.5 text-base text-white outline outline-1 -outline-offset-1 outline-white/15 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-[#2563EB] sm:text-sm/6"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex-none rounded-md bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] cursor-pointer disabled:opacity-60"
              >
                {loading ? t("submitting") : t("submitButton")}
              </button>
            </div>

            <p className="mt-4 text-sm text-gray-400">
              {t("privacyNote")}{" "}
              <Link
                href="/politique-de-confidentialite"
                className="underline underline-offset-2 hover:text-[#2563EB]"
              >
                {t("privacyLink")}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
