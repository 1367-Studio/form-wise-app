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
    const [open, uncollectible] = await Promise.all([
      stripe.invoices.list({ status: "open", limit: 50 }),
      stripe.invoices.list({ status: "uncollectible", limit: 50 }),
    ]);

    const failed = [...open.data, ...uncollectible.data]
      .filter((inv) => inv.amount_due > 0)
      .sort((a, b) => b.created - a.created)
      .slice(0, 50)
      .map((inv) => ({
        id: inv.id,
        number: inv.number,
        status: inv.status,
        amountDue: inv.amount_due,
        currency: inv.currency,
        customerEmail: inv.customer_email,
        customerName: inv.customer_name,
        attemptCount: inv.attempt_count,
        nextPaymentAttempt: inv.next_payment_attempt,
        hostedInvoiceUrl: inv.hosted_invoice_url,
        created: inv.created,
      }));

    return NextResponse.json({ failed });
  } catch (error) {
    console.error("Failed payments fetch error:", error);
    return NextResponse.json(
      { error: "Stripe API error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { invoiceId, action } = await req.json();
  if (!invoiceId || !action) {
    return NextResponse.json(
      { error: "invoiceId and action required" },
      { status: 400 }
    );
  }

  try {
    if (action === "retry") {
      const inv = await stripe.invoices.pay(invoiceId);
      return NextResponse.json({ success: true, invoice: { status: inv.status } });
    }
    if (action === "void") {
      const inv = await stripe.invoices.voidInvoice(invoiceId);
      return NextResponse.json({ success: true, invoice: { status: inv.status } });
    }
    if (action === "markUncollectible") {
      const inv = await stripe.invoices.markUncollectible(invoiceId);
      return NextResponse.json({ success: true, invoice: { status: inv.status } });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Invoice action error:", error);
    return NextResponse.json(
      {
        error: "Stripe API error",
        message: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}
