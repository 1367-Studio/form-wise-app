import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireSession } from "../../../../lib/security";

export async function GET() {
  const auth = await requireSession({ roles: ["PARENT"] });
  if ("error" in auth) return auth.error;
  const { session } = auth;

  const children = await prisma.student.findMany({
    where: { parentId: session.user.id },
    orderBy: { firstName: "asc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      class: { select: { name: true } },
      pickupAuthorizations: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          relationship: true,
          phone: true,
          notes: true,
          photoUrl: true,
          expiresAt: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      pickupEvents: {
        orderBy: { occurredAt: "desc" },
        take: 20,
        select: {
          id: true,
          type: true,
          occurredAt: true,
          pickupName: true,
          notes: true,
          authorization: {
            select: { firstName: true, lastName: true, relationship: true },
          },
          loggedBy: {
            select: { firstName: true, lastName: true },
          },
        },
      },
    },
  });

  return NextResponse.json({ children });
}
