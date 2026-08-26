"use client";

import { useTranslations } from "next-intl";
import { Link } from "../../i18n/navigation";

/**
 * Segment-level boundary. A crash in any page below the locale layout is caught
 * here, so the layout — and with it the page's real <title> — survives, and the
 * visitor gets a way out instead of a blank screen.
 *
 * Anything that escapes this lands in app/global-error.tsx.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("ErrorPage");

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <h1 className="mb-3 text-2xl font-semibold text-ink">
        {t("title")}
      </h1>
      <p className="mb-8 text-ink/80">{t("body")}</p>
      {error.digest && (
        <p className="mb-6 text-xs text-ink/45">Ref: {error.digest}</p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-brand px-5 py-2.5 text-white transition-opacity hover:opacity-90"
        >
          {t("retry")}
        </button>
        <Link
          href="/"
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-ink/85 transition-colors hover:bg-slate-50"
        >
          {t("home")}
        </Link>
      </div>
    </main>
  );
}
