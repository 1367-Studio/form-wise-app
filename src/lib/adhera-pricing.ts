import Stripe from "stripe";

// This site now markets the adhera product, so its pricing has to reflect
// adhera's actual Stripe prices — not a hand-typed copy. Adhera itself hit this
// exact problem (see its commit "Pull registration pricing live from Stripe
// instead of hardcoding it"): a hardcoded number silently drifted from what
// Stripe actually charged once already. Falls back to ADHERA_STRIPE_SECRET_KEY
// so this can point at a different Stripe account than the one used for
// form-wise's own billing (src/lib/stripe.ts), if adhera runs on its own.
let instance: Stripe | undefined;

function getInstance(): Stripe {
  if (!instance) {
    const key = process.env.ADHERA_STRIPE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("ADHERA_STRIPE_SECRET_KEY (or STRIPE_SECRET_KEY) is not set");
    }
    instance = new Stripe(key);
  }
  return instance;
}

// Trial length isn't a Stripe object field — it's a business decision, hardcoded
// here on purpose, mirroring adhera's own TRIAL_DAYS constant. Keep this in sync
// with adhera's src/lib/stripe.ts if that value ever changes.
export const ADHERA_TRIAL_DAYS = 15;

export type PlanTier = "essential" | "pro";

export type AdheraPlanPricing = {
  monthlyAmountCents: number;
  yearlyAmountCents: number;
  currency: string;
  // Read from the Price's own metadata.memberLimit (set by adhera's
  // scripts/stripe-setup-tiers.ts) rather than duplicated as a constant in this repo too.
  memberLimit: number;
};

export type AdheraPricingInfo = Record<PlanTier, AdheraPlanPricing>;

const PRICE_ENV_VARS: Record<PlanTier, { monthly: string; yearly: string }> = {
  essential: { monthly: "ADHERA_STRIPE_PRICE_ESSENTIAL_MONTHLY", yearly: "ADHERA_STRIPE_PRICE_ESSENTIAL_YEARLY" },
  pro:       { monthly: "ADHERA_STRIPE_PRICE_PRO_MONTHLY",       yearly: "ADHERA_STRIPE_PRICE_PRO_YEARLY" },
};

let cache: { data: AdheraPricingInfo; expiresAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function fetchPlanPricing(stripe: Stripe, tier: PlanTier): Promise<AdheraPlanPricing> {
  const { monthly: monthlyVar, yearly: yearlyVar } = PRICE_ENV_VARS[tier];
  const monthlyId = process.env[monthlyVar];
  const yearlyId = process.env[yearlyVar];
  if (!monthlyId || !yearlyId) {
    throw new Error(`${monthlyVar} / ${yearlyVar} are not set`);
  }

  const [monthly, yearly] = await Promise.all([
    stripe.prices.retrieve(monthlyId),
    stripe.prices.retrieve(yearlyId),
  ]);

  return {
    monthlyAmountCents: monthly.unit_amount ?? 0,
    yearlyAmountCents: yearly.unit_amount ?? 0,
    currency: monthly.currency,
    memberLimit: Number(monthly.metadata.memberLimit ?? yearly.metadata.memberLimit ?? 0),
  };
}

export async function getAdheraPricing(): Promise<AdheraPricingInfo> {
  if (cache && cache.expiresAt > Date.now()) return cache.data;

  const stripe = getInstance();
  const [essential, pro] = await Promise.all([
    fetchPlanPricing(stripe, "essential"),
    fetchPlanPricing(stripe, "pro"),
  ]);

  const data: AdheraPricingInfo = { essential, pro };
  cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
  return data;
}
