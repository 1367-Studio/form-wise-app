import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireSession } from "../../../../lib/security";

export async function GET(req: Request) {
  const auth = await requireSession({
    roles: ["DIRECTOR", "STAFF", "SUPER_ADMIN"],
    requireTenant: true,
  });
  if ("error" in auth) return auth.error;
  const { session } = auth;

  const tenantFilter =
    session.user.role === "SUPER_ADMIN"
      ? {}
      : { tenantId: session.user.tenantId as string };

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q")?.trim() ?? "";

  // Today's window in the server's local time. School day is loose enough
  // that a server-local boundary is fine; tighten with the tenant's TZ later.
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const students = await prisma.student.findMany({
    where: {
      ...tenantFilter,
      status: "ACCEPTED",
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    take: 100,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      class: { select: { name: true } },
      pickupAuthorizations: {
        where: {
          OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          relationship: true,
          phone: true,
          expiresAt: true,
        },
      },
      pickupEvents: {
        where: { occurredAt: { gte: dayStart, lt: dayEnd } },
        orderBy: { occurredAt: "desc" },
        select: {
          id: true,
          type: true,
          occurredAt: true,
          pickupName: true,
          authorization: {
            select: { firstName: true, lastName: true, relationship: true },
          },
        },
      },
    },
  });

  return NextResponse.json({ students });
}
