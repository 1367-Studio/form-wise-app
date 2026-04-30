import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, enforceSameOrigin } from "@/lib/security";
import type { Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns Monday 00:00 of the current week (ISO week starts on Monday). */
function getMondayOfCurrentWeek(): Date {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 1 = Mon, ...
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/** Returns next Sunday 23:59:59.999 from a given Monday. */
function getSundayEnd(monday: Date): Date {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

// ---------------------------------------------------------------------------
// GET /api/director/staff-hours — List hours logs with aggregation
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
  const staffId = searchParams.get("staffId");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10))
  );

  // Default date range: current week (Monday to Sunday)
  const monday = getMondayOfCurrentWeek();
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const from = fromParam && !isNaN(Date.parse(fromParam))
    ? new Date(fromParam)
    : monday;
  const to = toParam && !isNaN(Date.parse(toParam))
    ? new Date(toParam)
    : getSundayEnd(monday);

  try {
    const tenantFilter =
      session.user.role === "SUPER_ADMIN" ? {} : { tenantId };

    const where: Prisma.StaffHoursLogWhereInput = {
      ...tenantFilter,
      date: { gte: from, lte: to },
      ...(staffId ? { staffId } : {}),
    };

    const [logs, total, aggregateResult] = await Promise.all([
      prisma.staffHoursLog.findMany({
        where,
        include: {
          staff: {
            select: {
              firstName: true,
              lastName: true,
              roleLabel: true,
            },
          },
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.staffHoursLog.count({ where }),
      prisma.staffHoursLog.aggregate({
        where,
        _sum: { hours: true, overtime: true },
        _count: { id: true },
      }),
    ]);

    const totalHours = aggregateResult._sum.hours ?? 0;
    const totalOvertime = aggregateResult._sum.overtime ?? 0;
    const logCount = aggregateResult._count.id;
    const averageDaily = logCount > 0
      ? Math.round((totalHours / logCount) * 100) / 100
      : 0;

    return NextResponse.json({
      logs,
      total,
      aggregates: {
        totalHours,
        totalOvertime,
        averageDaily,
      },
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des heures :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/director/staff-hours — Log hours for a staff member (upsert)
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

  const { staffId, date, hours, overtime, notes } = body;

  // --- Validation -----------------------------------------------------------

  if (typeof staffId !== "string" || !staffId.trim()) {
    return NextResponse.json(
      { error: "staffId est requis" },
      { status: 400 }
    );
  }

  if (typeof date !== "string" || isNaN(Date.parse(date))) {
    return NextResponse.json({ error: "date invalide" }, { status: 400 });
  }

  if (typeof hours !== "number" || hours < 0 || hours > 24) {
    return NextResponse.json(
      { error: "hours doit être un nombre entre 0 et 24" },
      { status: 400 }
    );
  }

  if (
    overtime !== undefined &&
    overtime !== null &&
    (typeof overtime !== "number" || overtime < 0)
  ) {
    return NextResponse.json(
      { error: "overtime invalide" },
      { status: 400 }
    );
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

    // Normalise the date to midnight UTC to ensure the unique constraint
    // [staffId, date] is compared consistently.
    const logDate = new Date(date);
    logDate.setUTCHours(0, 0, 0, 0);

    const log = await prisma.staffHoursLog.upsert({
      where: {
        staffId_date: {
          staffId: staff.id,
          date: logDate,
        },
      },
      create: {
        tenantId: staff.tenantId,
        staffId: staff.id,
        date: logDate,
        hours,
        overtime: overtime != null ? (overtime as number) : 0,
        ...(typeof notes === "string"
          ? { notes: notes.trim().slice(0, 1000) }
          : {}),
      },
      update: {
        hours,
        overtime: overtime != null ? (overtime as number) : 0,
        ...(typeof notes === "string"
          ? { notes: notes.trim().slice(0, 1000) }
          : {}),
      },
      include: {
        staff: {
          select: {
            firstName: true,
            lastName: true,
            roleLabel: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, log }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des heures :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
