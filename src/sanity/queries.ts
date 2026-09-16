// Localised fields are stored as [{ _key, language, value }]. Always filter on `language`:
// `_key` is random, never the locale. No French fallback on purpose: a locale without its
// own translation must fall back to the site's hardcoded page, not show French text.
// Params: $kind, $locale.
export const LEGAL_DOCUMENT_QUERY = `*[_type == "legalDocument" && kind == $kind]
  | order(effectiveAt desc, _updatedAt desc) [0] {
    "title": title[language == $locale][0].value,
    "body": body[language == $locale][0].value,
    version,
    effectiveAt
  }`;
