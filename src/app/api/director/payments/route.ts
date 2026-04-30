import { NextResponse } from "next/server";
import { requireSession } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const VALID_METHODS = [
  "BANK_TRANSFER",
  "CHEQUE",
  "CASH",
  "DIRECT_DEBIT",
  "OTHER",
] as const;

// ---------------------------------------------------------------------------
// GET /api/director/payments — List payments with pagination
// ---------------------------------------------------------------------------

export async function GET(req: Request) {
  const auth = await requireSession({
    roles: ["DIRECTOR", "SUPER_ADMIN"],
    requireTenant: true,
  });
  if ("error" in auth) return auth.error;
  const { session } = auth;

  const tenantId = session.user.tenantId as string;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10))
  );

  try {
    const where: Prisma.PaymentWhereInput = {
      tenantId,
      ...(search && {
        invoice: {
          student: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      }),
    };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          invoice: {
            select: {
              id: true,
              number: true,
              amount: true,
              status: true,
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { paidAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json({ payments, total, page, pageSize });
  } catch (error) {
    console.error("Erreur liste paiements :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/director/payments — Record a payment
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  const auth = await requireSession({
    roles: ["DIRECTOR", "SUPER_ADMIN"],
    requireTenant: true,
  });
  if ("error" in auth) return auth.error;
  const { session } = auth;

  const tenantId = session.user.tenantId as string;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requete invalide" },
      { status: 400 }
    );
  }

  const { invoiceId, amount, method, reference, notes } = body as {
    invoiceId?: string;
    amount?: number;
    method?: string;
    reference?: string;
    notes?: string;
  };

  // --- Validation --------------------------------------------------------

  if (!invoiceId || typeof invoiceId !== "string") {
    return NextResponse.json(
      { error: "invoiceId est requis" },
      { status: 400 }
    );
  }

  if (typeof amount !== "number" || amount <= 0 || !isFinite(amount)) {
    return NextResponse.json(
      { error: "amount doit etre un nombre positif" },
      { status: 400 }
    );
  }

  if (!method || !VALID_METHODS.includes(method as (typeof VALID_METHODS)[number])) {
    return NextResponse.json(
      {
        error: `method doit etre l'une des valeurs suivantes : ${VALID_METHODS.join(", ")}`,
      },
      { status: 400 }
    );
  }

  try {
    // Verify the invoice belongs to this tenant
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      select: {
        id: true,
        amount: true,
        status: true,
        payments: { select: { amount: true } },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Facture introuvable dans ce tenant" },
        { status: 404 }
      );
    }

    if (invoice.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Impossible d'enregistrer un paiement sur une facture annulee" },
        { status: 400 }
      );
    }

    if (invoice.status === "PAID") {
      return NextResponse.json(
        { error: "Cette facture est deja payee" },
        { status: 400 }
      );
    }

    const roundedAmount = Math.round(amount * 100) / 100;
    const totalPaid =
      invoice.payments.reduce((sum, p) => sum + p.amount, 0) + roundedAmount;
    const invoiceFullyPaid = totalPaid >= invoice.amount;

    // Use a transaction to atomically create the payment and update the invoice
    const payment = await prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          tenantId,
          invoiceId,
          amount: roundedAmount,
          method: method as (typeof VALID_METHODS)[number],
          reference: reference?.trim() || null,
          notes: notes?.trim() || null,
        },
        include: {
          invoice: {
            select: {
              id: true,
              number: true,
              amount: true,
              status: true,
            },
          },
        },
      });

      // If total payments cover the invoice amount, mark as PAID
      if (invoiceFullyPaid) {
        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            status: "PAID",
            paidAt: new Date(),
          },
        });
        // Reflect the updated status in the returned payment
        created.invoice.status = "PAID";
      }

      return created;
    });

    return NextResponse.json({ success: true, payment }, { status: 201 });
  } catch (error) {
    console.error("Erreur enregistrement paiement :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
