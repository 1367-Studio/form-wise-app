import { createClient } from "@sanity/client";

// Public identifiers: the env vars only let a staging dataset be targeted without a code
// change. The dataset is public, so no read token is needed.
export const SANITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "uxyclro2";
export const SANITY_DATASET =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const SANITY_API_VERSION = "2026-09-11";

// Live API (`useCdn: false`): reads are already cached by Next's data cache, so the API CDN
// would only add its own staleness window on top of the revalidate interval.
export const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  useCdn: false,
  perspective: "published",
});
