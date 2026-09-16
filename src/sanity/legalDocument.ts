import type { PortableTextBlock } from "@portabletext/react";
import { sanityClient } from "./client";
import { LEGAL_DOCUMENT_QUERY } from "./queries";

export type LegalDocumentKind =
  | "cgu"
  | "cgs"
  | "mentions-legales"
  | "politique-confidentialite";

export interface LegalDocument {
  /** Title in the requested locale only, null when not translated. */
  title: string | null;
  /** `helpBody` Portable Text in the requested locale, never empty. */
  body: PortableTextBlock[];
  version: string | null;
  /** Date string "YYYY-MM-DD". */
  effectiveAt: string | null;
}

type LegalDocumentQueryResult = Omit<LegalDocument, "body"> & {
  body: PortableTextBlock[] | null;
};

/**
 * Returns null when there is nothing to render for this locale (no document, no body in
 * this locale, or Sanity unreachable), so callers fall back to their hardcoded content.
 */
export async function getLegalDocument(
  kind: LegalDocumentKind,
  locale: string,
): Promise<LegalDocument | null> {
  let queryResult: LegalDocumentQueryResult | null;
  try {
    queryResult = await sanityClient.fetch<LegalDocumentQueryResult | null>(
      LEGAL_DOCUMENT_QUERY,
      { kind, locale },
      // Time-based revalidation so a Studio publish reaches the site within a minute
      // without a webhook.
      { next: { revalidate: 60, tags: ["legalDocument"] } },
    );
  } catch (error) {
    console.error(
      `Failed to fetch legal document "${kind}" (${locale})`,
      error,
    );
    return null;
  }

  if (
    !queryResult ||
    !Array.isArray(queryResult.body) ||
    queryResult.body.length === 0
  ) {
    return null;
  }
  return { ...queryResult, body: queryResult.body };
}
