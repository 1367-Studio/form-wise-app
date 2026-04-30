import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, enforceSameOrigin } from "@/lib/security";
import type { Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// GET /api/director/contracts — List contracts with staff info
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
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10))
  );

  try {
    const tenantFilter =
      session.user.role === "SUPER_ADMIN" ? {} : { tenantId };

    const where: Prisma.StaffContractWhereInput = {
      ...tenantFilter,
      ...(status ? { status: status as Prisma.EnumContractStatusFilter } : {}),
    };

    const [contracts, total] = await Promise.all([
      prisma.staffContract.findMany({
        where,
        include: {
          staff: {
            select: {
              firstName: true,
              lastName: true,
              roleLabel: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.staffContract.count({ where }),
    ]);

    // Auto-detect expiring contracts: if endDate is within 30 days and
    // status is still ACTIVE, flag them as EXPIRING_SOON for the client.
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    const enriched = contracts.map((c) => {
      if (
        c.status === "ACTIVE" &&
        c.endDate &&
        c.endDate <= thirtyDaysFromNow
      ) {
        return { ...c, status: "EXPIRING_SOON" as const };
      }
      return c;
    });

    return NextResponse.json({
      contracts: enriched,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des contrats :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/director/contracts — Create a new contract
// ---------------------------------------------------------------------------

const VALID_CONTRACT_TYPES = new Set([
  "CDI",
  "CDD",
  "STAGE",
  "FREELANCE",
  "OTHER",
]);

export async function POST(req: Request) {
  const csrf = enforceSameOrigin(req);
  if (csrf) return csrf;

  const auth = await requireSession({
    roles: ["DIRECTOR", "SUPER_ADMIN"],
    requireTenant: true,
  });
  if ("error" in auth) return auth.error;
  const { session } = auth;

  const tenantId = session.user.tenantId as string;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide" },
      { status: 400 }
    );
  }

  const { staffId, type, startDate, endDate, hoursPerWeek, salary, notes } =
    body;

  // --- Validation -----------------------------------------------------------

  if (typeof staffId !== "string" || !staffId.trim()) {
    return NextResponse.json(
      { error: "staffId est requis" },
      { status: 400 }
    );
  }

  if (typeof type !== "string" || !VALID_CONTRACT_TYPES.has(type)) {
    return NextResponse.json(
      { error: "Type de contrat invalide" },
      { status: 400 }
    );
  }

  if (typeof startDate !== "string" || isNaN(Date.parse(startDate))) {
    return NextResponse.json(
      { error: "startDate invalide" },
      { status: 400 }
    );
  }

  if (
    endDate !== undefined &&
    endDate !== null &&
    (typeof endDate !== "string" || isNaN(Date.parse(endDate)))
  ) {
    return NextResponse.json({ error: "endDate invalide" }, { status: 400 });
  }

  if (
    hoursPerWeek !== undefined &&
    hoursPerWeek !== null &&
    (typeof hoursPerWeek !== "number" || hoursPerWeek < 0)
  ) {
    return NextResponse.json(
      { error: "hoursPerWeek invalide" },
      { status: 400 }
    );
  }

  if (
    salary !== undefined &&
    salary !== null &&
    (typeof salary !== "number" || salary < 0)
  ) {
    return NextResponse.json({ error: "salary invalide" }, { status: 400 });
  }

  // --- Verify staff belongs to tenant ----------------------------------------

  try {
    const tenantWhere =
      session.user.role === "SUPER_ADMIN" ? {} : { tenantId };

    const staff = await prisma.staff.findFirst({
      where: { id: staffId, ...tenantWhere },
      select: { id: true, tenantId: true },
    });

    if (!staff) {
      return NextResponse.json(
        { error: "Membre du personnel introuvable" },
        { status: 404 }
      );
    }

    const contract = await prisma.staffContract.create({
      data: {
        tenantId: staff.tenantId,
        staffId: staff.id,
        type: type as "CDI" | "CDD" | "STAGE" | "FREELANCE" | "OTHER",
        startDate: new Date(startDate),
        ...(endDate ? { endDate: new Date(endDate) } : {}),
        ...(hoursPerWeek != null ? { hoursPerWeek } : {}),
        ...(salary != null ? { salary } : {}),
        ...(typeof notes === "string" ? { notes: notes.trim().slice(0, 2000) } : {}),
      },
      include: {
        staff: {
          select: {
            firstName: true,
            lastName: true,
            roleLabel: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, contract }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du contrat :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
