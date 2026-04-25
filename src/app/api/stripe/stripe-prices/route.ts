import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "../../../../lib/stripe";

export async function GET() {
  try {
    const prices = await stripe.prices.list({
      lookup_keys: ["formwise-monthly", "formwise-yearly"],
      expand: ["data.product"],
    });

    console.log("Stripe prices:", prices.data);

    const data = prices.data.map((price) => {
      const product = price.product as Stripe.Product;

      return {
        id: price.id,
        name: price.nickname ?? product.name,
        amount: (price.unit_amount! / 100).toFixed(0) + "€",
        interval: price.recurring?.interval,
        description: product.description ?? "",
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Stripe price fetch error:", err);
    return NextResponse.json(
      { success: false, error: "Erreur Stripe" },
      { status: 500 }
    );
  }
}
