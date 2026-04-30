import { NextResponse } from "next/server";
import { requireSession } from "@/lib/security";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// GET /api/director/reminders — List reminders
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
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10))
  );

  try {
    const where = { tenantId };

    const [reminders, total] = await Promise.all([
      prisma.reminder.findMany({
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
        orderBy: { sentAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.reminder.count({ where }),
    ]);

    return NextResponse.json({ reminders, total, page, pageSize });
  } catch (error) {
    console.error("Erreur liste relances :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/director/reminders — Create a reminder
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

  const { invoiceId, channel, notes } = body as {
    invoiceId?: string;
    channel?: string;
    notes?: string;
  };

  // --- Validation --------------------------------------------------------

  if (!invoiceId || typeof invoiceId !== "string") {
    return NextResponse.json(
      { error: "invoiceId est requis" },
      { status: 400 }
    );
  }

  const validChannels = ["EMAIL", "SMS"];
  const resolvedChannel = channel?.toUpperCase() ?? "EMAIL";
  if (!validChannels.includes(resolvedChannel)) {
    return NextResponse.json(
      { error: `channel doit etre l'une des valeurs suivantes : ${validChannels.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    // Verify the invoice belongs to this tenant and is in a remindable state
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      select: { id: true, status: true },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Facture introuvable dans ce tenant" },
        { status: 404 }
      );
    }

    if (invoice.status !== "PENDING" && invoice.status !== "OVERDUE") {
      return NextResponse.json(
        {
          error:
            "Impossible d'envoyer une relance pour une facture qui n'est pas en attente ou en retard",
        },
        { status: 400 }
      );
    }

    const reminder = await prisma.reminder.create({
      data: {
        tenantId,
        invoiceId,
        channel: resolvedChannel,
        notes: notes?.trim() || null,
      },
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
    });

    return NextResponse.json({ success: true, reminder }, { status: 201 });
  } catch (error) {
    console.error("Erreur creation relance :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
