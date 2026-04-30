import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, enforceSameOrigin } from "@/lib/security";

// ---------------------------------------------------------------------------
// GET /api/director/events — List school events
// ---------------------------------------------------------------------------

const VALID_EVENT_TYPES = new Set([
  "GENERAL",
  "MEETING",
  "HOLIDAY",
  "EXAM",
  "TRIP",
]);

export async function GET(req: Request) {
  const auth = await requireSession({
    roles: ["DIRECTOR", "SUPER_ADMIN"],
    requireTenant: true,
  });
  if ("error" in auth) return auth.error;
  const { session } = auth;

  const tenantId = session.user.tenantId as string;

  const { searchParams } = new URL(req.url);
  const typeFilter = searchParams.get("type");
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  // Defaults: today to +30 days
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const from = fromParam && !isNaN(Date.parse(fromParam))
    ? new Date(fromParam)
    : now;

  const defaultTo = new Date(now);
  defaultTo.setDate(defaultTo.getDate() + 30);
  defaultTo.setHours(23, 59, 59, 999);

  const to = toParam && !isNaN(Date.parse(toParam))
    ? new Date(toParam)
    : defaultTo;

  try {
    const tenantFilter =
      session.user.role === "SUPER_ADMIN" ? {} : { tenantId };

    const where = {
      ...tenantFilter,
      startDate: { lte: to },
      endDate: { gte: from },
      ...(typeFilter && VALID_EVENT_TYPES.has(typeFilter)
        ? { type: typeFilter }
        : {}),
    };

    const [events, total] = await Promise.all([
      prisma.schoolEvent.findMany({
        where,
        orderBy: { startDate: "asc" },
      }),
      prisma.schoolEvent.count({ where }),
    ]);

    return NextResponse.json({ events, total });
  } catch (error) {
    console.error("Erreur lors de la récupération des événements :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/director/events — Create a school event
// ---------------------------------------------------------------------------

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

  const { title, description, startDate, endDate, location, type } = body;

  // --- Validation -----------------------------------------------------------

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json(
      { error: "Le titre est requis" },
      { status: 400 }
    );
  }

  if (title.trim().length > 200) {
    return NextResponse.json(
      { error: "Le titre ne doit pas dépasser 200 caractères" },
      { status: 400 }
    );
  }

  if (typeof startDate !== "string" || isNaN(Date.parse(startDate))) {
    return NextResponse.json(
      { error: "startDate invalide" },
      { status: 400 }
    );
  }

  if (typeof endDate !== "string" || isNaN(Date.parse(endDate))) {
    return NextResponse.json(
      { error: "endDate invalide" },
      { status: 400 }
    );
  }

  const parsedStart = new Date(startDate);
  const parsedEnd = new Date(endDate);

  if (parsedEnd < parsedStart) {
    return NextResponse.json(
      { error: "endDate ne peut pas être avant startDate" },
      { status: 400 }
    );
  }

  if (
    type !== undefined &&
    type !== null &&
    (typeof type !== "string" || !VALID_EVENT_TYPES.has(type))
  ) {
    return NextResponse.json(
      { error: "Type d'événement invalide" },
      { status: 400 }
    );
  }

  // --- Create ---------------------------------------------------------------

  try {
    const effectiveTenantId =
      session.user.role === "SUPER_ADMIN"
        ? (body.tenantId as string | undefined) ?? tenantId
        : tenantId;

    const event = await prisma.schoolEvent.create({
      data: {
        tenantId: effectiveTenantId,
        title: title.trim().slice(0, 200),
        ...(typeof description === "string"
          ? { description: description.trim().slice(0, 2000) }
          : {}),
        startDate: parsedStart,
        endDate: parsedEnd,
        ...(typeof location === "string"
          ? { location: location.trim().slice(0, 500) }
          : {}),
        type: typeof type === "string" && VALID_EVENT_TYPES.has(type)
          ? type
          : "GENERAL",
      },
    });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'événement :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
