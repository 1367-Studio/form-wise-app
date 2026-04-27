import { buffer } from "micro";
import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../../lib/stripe";
import { prisma } from "../../../lib/prisma";
import { Prisma } from "@prisma/client";
import Stripe from "stripe";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"] as string | undefined;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return res.status(400).send("Missing signature or webhook secret");
  }

  let event: Stripe.Event;
  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("❌ Invalid Stripe signature:", msg);
    return res.status(400).send(`Webhook Error: ${msg}`);
  }

  // Idempotency: claim the event id before doing any work.
  // Stripe retries on non-2xx for up to 3 days; constraint violation = already processed.
  try {
    await prisma.processedStripeEvent.create({
      data: { id: event.id, type: event.type },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      console.log("↩️  Stripe event already processed:", event.id);
      return res.status(200).json({ received: true, duplicate: true });
    }
    console.error("❌ Failed to record Stripe event:", err);
    return res.status(500).send("Internal error");
  }

  try {
    await handleEvent(event);
    return res.status(200).json({ received: true });
  } catch (err) {
    // Roll back the idempotency claim so Stripe will retry.
    await prisma.processedStripeEvent
      .delete({ where: { id: event.id } })
      .catch(() => {});
    console.error("❌ Stripe handler failed:", event.type, err);
    return res.status(500).send("Handler error");
  }
}

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const tenantId = session.metadata?.tenantId;
      const subscriptionId = session.subscription as string | null;
      const customerId = session.customer as string | null;

      if (!tenantId || !customerId || !subscriptionId) {
        console.warn("checkout.session.completed missing data", { tenantId, customerId, subscriptionId });
        return;
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const billingInterval =
        subscription.items.data[0]?.price?.recurring?.interval;
      const billingPlan = billingInterval === "year" ? "YEARLY" : "MONTHLY";

      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          subscriptionStatus: "ACTIVE",
          billingPlan,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          trialEndsAt: null,
        },
      });
      return;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const status = sub.status; // active, past_due, canceled, unpaid, trialing, incomplete, incomplete_expired
      const billingInterval = sub.items.data[0]?.price?.recurring?.interval;
      const billingPlan = billingInterval === "year" ? "YEARLY" : "MONTHLY";

      const subscriptionStatus =
        status === "active" || status === "trialing"
          ? "ACTIVE"
          : status === "past_due" || status === "unpaid"
            ? "EXPIRED"
            : status === "canceled" || status === "incomplete_expired"
              ? "EXPIRED"
              : "ACTIVE";

      const result = await prisma.tenant.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { subscriptionStatus, billingPlan },
      });
      if (result.count === 0) {
        console.warn("subscription.updated: no tenant found for", sub.id);
      }
      return;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.tenant.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { subscriptionStatus: "EXPIRED" },
      });
      return;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const sub = invoice.parent?.subscription_details?.subscription;
      const subscriptionId = typeof sub === "string" ? sub : sub?.id;
      if (!subscriptionId) return;
      await prisma.tenant.updateMany({
        where: { stripeSubscriptionId: subscriptionId },
        data: { subscriptionStatus: "EXPIRED" },
      });
      return;
    }

    default:
      // Unhandled event types are still recorded as processed via the idempotency row.
      return;
  }
}
