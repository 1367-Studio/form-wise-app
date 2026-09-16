import { getTranslations } from "next-intl/server";
import LegalDocumentBody from "@/components/LegalDocumentBody";
import type { LegalDocument } from "@/sanity/legalDocument";

// "YYYY-MM-DD" is parsed and formatted in UTC so the displayed day never shifts with the
// server's timezone.
function formatEffectiveDate(effectiveAt: string, locale: string) {
  const effectiveDate = new Date(`${effectiveAt}T00:00:00Z`);
  if (Number.isNaN(effectiveDate.getTime())) return effectiveAt;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(effectiveDate);
}

interface LegalDocumentPageProps {
  legalDocument: LegalDocument;
  locale: string;
  /** The page's own translated title, shown when the Sanity title is empty. */
  fallbackTitle: string;
}

export default async function LegalDocumentPage({
  legalDocument,
  locale,
  fallbackTitle,
}: LegalDocumentPageProps) {
  const translations = await getTranslations({
    locale,
    namespace: "LegalDocument",
  });

  const title = legalDocument.title?.trim() || fallbackTitle;
  const metadataParts: string[] = [];
  if (legalDocument.version) {
    metadataParts.push(
      translations("version", { version: legalDocument.version }),
    );
  }
  if (legalDocument.effectiveAt) {
    metadataParts.push(
      translations("effective", {
        date: formatEffectiveDate(legalDocument.effectiveAt, locale),
      }),
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6 pt-[150px] pb-[150px]">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        {metadataParts.length > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            {metadataParts.join(" · ")}
          </p>
        )}
      </header>
      <LegalDocumentBody value={legalDocument.body} />
    </main>
  );
}
