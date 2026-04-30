import { NextResponse } from "next/server";
import { requireSession } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// GET /api/director/invoices — List invoices with filters & pagination
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
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.trim() ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10))
  );

  try {
    const where: Prisma.InvoiceWhereInput = {
      tenantId,
      ...(status && { status: status as Prisma.EnumInvoiceStatusFilter }),
      ...(search && {
        student: {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
          ],
        },
      }),
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              parent: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          _count: { select: { payments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({ invoices, total, page, pageSize });
  } catch (error) {
    console.error("Erreur liste factures :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/director/invoices — Create a new invoice
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

  const { studentId, amount, dueDate, description } = body as {
    studentId?: string;
    amount?: number;
    dueDate?: string;
    description?: string;
  };

  // --- Validation --------------------------------------------------------

  if (!studentId || typeof studentId !== "string") {
    return NextResponse.json(
      { error: "studentId est requis" },
      { status: 400 }
    );
  }

  if (typeof amount !== "number" || amount <= 0 || !isFinite(amount)) {
    return NextResponse.json(
      { error: "amount doit etre un nombre positif" },
      { status: 400 }
    );
  }

  if (!dueDate || isNaN(Date.parse(dueDate))) {
    return NextResponse.json(
      { error: "dueDate est requis et doit etre une date valide" },
      { status: 400 }
    );
  }

  try {
    // Verify the student belongs to this tenant
    const student = await prisma.student.findFirst({
      where: { id: studentId, tenantId },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Eleve introuvable dans ce tenant" },
        { status: 404 }
      );
    }

    // Auto-generate invoice number: INV-{YYYY}-{NNN}
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;

    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        tenantId,
        number: { startsWith: prefix },
      },
      orderBy: { number: "desc" },
      select: { number: true },
    });

    let nextSeq = 1;
    if (lastInvoice) {
      const lastSeqStr = lastInvoice.number.replace(prefix, "");
      const parsed = parseInt(lastSeqStr, 10);
      if (!isNaN(parsed)) nextSeq = parsed + 1;
    }

    const invoiceNumber = `${prefix}${String(nextSeq).padStart(3, "0")}`;

    const invoice = await prisma.invoice.create({
      data: {
        tenantId,
        studentId,
        number: invoiceNumber,
        amount: Math.round(amount * 100) / 100, // Round to 2 decimals
        dueDate: new Date(dueDate),
        description: description?.trim() || null,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (error) {
    // Handle unique constraint violation on invoice number (race condition)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Conflit de numero de facture, veuillez reessayer" },
        { status: 409 }
      );
    }
    console.error("Erreur creation facture :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
