import { authOptions } from "../../../../../lib/authOptions";
import { stripe } from "../../../../../lib/stripe";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Real MRR: sum the monthly-equivalent of every active subscription
    let activeMrr = 0;
    let activeCount = 0;
    let lastSubId: string | undefined;
    while (true) {
      const page = await stripe.subscriptions.list({
        status: "active",
        limit: 100,
        ...(lastSubId ? { starting_after: lastSubId } : {}),
      });
      for (const sub of page.data) {
        for (const item of sub.items.data) {
          const price = item.price;
          if (!price.unit_amount || !price.recurring) continue;
          const cents = price.unit_amount * (item.quantity ?? 1);
          // Normalize to monthly run-rate
          const interval = price.recurring.interval;
          const intervalCount = price.recurring.interval_count || 1;
          let monthlyCents = 0;
          if (interval === "month") {
            monthlyCents = cents / intervalCount;
          } else if (interval === "year") {
            monthlyCents = cents / (12 * intervalCount);
          } else if (interval === "week") {
            monthlyCents = (cents * 4.345) / intervalCount;
          } else if (interval === "day") {
            monthlyCents = (cents * 30) / intervalCount;
          }
          activeMrr += monthlyCents;
        }
        activeCount += 1;
      }
      if (!page.has_more) break;
      lastSubId = page.data[page.data.length - 1]?.id;
      if (!lastSubId) break;
    }

    const invoices = await stripe.invoices.list({ limit: 12 });
    const recentInvoices = invoices.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      status: inv.status,
      amountPaid: inv.amount_paid,
      amountDue: inv.amount_due,
      currency: inv.currency,
      customerEmail: inv.customer_email,
      hostedInvoiceUrl: inv.hosted_invoice_url,
      created: inv.created,
    }));

    const failedCount = invoices.data.filter(
      (inv) => inv.status === "uncollectible" || inv.status === "void"
    ).length;

    return NextResponse.json({
      mrr: Math.round(activeMrr / 100),
      activeSubscriptions: activeCount,
      currency: invoices.data[0]?.currency ?? "eur",
      failedCount,
      recentInvoices,
    });
  } catch (error) {
    console.error("Stripe overview error:", error);
    return NextResponse.json(
      {
        error: "Stripe API error",
        message: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}
