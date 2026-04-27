import Stripe from "stripe";

let instance: Stripe | undefined;

function getInstance(): Stripe {
  if (!instance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    instance = new Stripe(key);
  }
  return instance;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return Reflect.get(getInstance(), prop);
  },
});
