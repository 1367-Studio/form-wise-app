import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import {
  enforceRateLimit,
  enforceSameOrigin,
  requireSession,
} from "../../../../../lib/security";

export async function POST(req: Request) {
  const csrf = enforceSameOrigin(req);
  if (csrf) return csrf;

  const auth = await requireSession({ roles: ["PARENT"] });
  if ("error" in auth) return auth.error;
  const { session } = auth;

  const rl = enforceRateLimit(
    req,
    { name: "pickup-auth-create", limit: 30, windowMs: 60 * 60 * 1000 },
    session.user.id
  );
  if (rl) return rl;

  const body = (await req.json().catch(() => ({}))) as {
    studentId?: unknown;
    firstName?: unknown;
    lastName?: unknown;
    relationship?: unknown;
    phone?: unknown;
    notes?: unknown;
    photoUrl?: unknown;
    expiresAt?: unknown;
  };

  if (
    typeof body.studentId !== "string" ||
    typeof body.firstName !== "string" ||
    !body.firstName.trim() ||
    typeof body.lastName !== "string" ||
    !body.lastName.trim()
  ) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  const student = await prisma.student.findFirst({
    where: { id: body.studentId, parentId: session.user.id },
    select: { id: true, tenantId: true },
  });
  if (!student) {
    return NextResponse.json({ error: "Enfant introuvable" }, { status: 404 });
  }

  const expiresAt =
    typeof body.expiresAt === "string" && body.expiresAt
      ? new Date(body.expiresAt)
      : null;

  const created = await prisma.pickupAuthorization.create({
    data: {
      studentId: student.id,
      tenantId: student.tenantId,
      firstName: body.firstName.trim().slice(0, 100),
      lastName: body.lastName.trim().slice(0, 100),
      relationship:
        typeof body.relationship === "string"
          ? body.relationship.trim().slice(0, 60) || null
          : null,
      phone:
        typeof body.phone === "string"
          ? body.phone.trim().slice(0, 40) || null
          : null,
      notes:
        typeof body.notes === "string"
          ? body.notes.trim().slice(0, 500) || null
          : null,
      photoUrl: typeof body.photoUrl === "string" ? body.photoUrl : null,
      expiresAt,
      createdByUserId: session.user.id,
    },
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
  });

  return NextResponse.json({ authorization: created });
}
