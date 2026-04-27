import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import {
  enforceRateLimit,
  enforceSameOrigin,
  requireSession,
} from "../../../../../lib/security";
import { sendPushToUser } from "../../../../../lib/webpush";

export async function POST(req: Request) {
  const csrf = enforceSameOrigin(req);
  if (csrf) return csrf;

  const auth = await requireSession({
    roles: ["DIRECTOR", "STAFF", "SUPER_ADMIN"],
    requireTenant: true,
  });
  if ("error" in auth) return auth.error;
  const { session } = auth;

  const rl = enforceRateLimit(
    req,
    { name: "pickup-event", limit: 300, windowMs: 60 * 60 * 1000 },
    session.user.id
  );
  if (rl) return rl;

  const body = (await req.json().catch(() => ({}))) as {
    studentId?: unknown;
    type?: unknown;
    authorizationId?: unknown;
    pickupName?: unknown;
    notes?: unknown;
  };

  if (
    typeof body.studentId !== "string" ||
    (body.type !== "ENTRY" && body.type !== "EXIT")
  ) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const tenantWhere =
    session.user.role === "SUPER_ADMIN"
      ? {}
      : { tenantId: session.user.tenantId as string };

  const student = await prisma.student.findFirst({
    where: { id: body.studentId, ...tenantWhere },
    select: { id: true, tenantId: true, firstName: true, parentId: true },
  });
  if (!student) {
    return NextResponse.json({ error: "Élève introuvable" }, { status: 404 });
  }

  let authorizationId: string | null = null;
  if (typeof body.authorizationId === "string" && body.authorizationId) {
    const authz = await prisma.pickupAuthorization.findFirst({
      where: { id: body.authorizationId, studentId: student.id },
      select: { id: true, expiresAt: true },
    });
    if (!authz) {
      return NextResponse.json(
        { error: "Autorisation introuvable" },
        { status: 400 }
      );
    }
    if (authz.expiresAt && authz.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Autorisation expirée" },
        { status: 400 }
      );
    }
    authorizationId = authz.id;
  }

  const event = await prisma.pickupEvent.create({
    data: {
      studentId: student.id,
      tenantId: student.tenantId,
      type: body.type,
      authorizationId,
      pickupName:
        typeof body.pickupName === "string"
          ? body.pickupName.trim().slice(0, 200) || null
          : null,
      notes:
        typeof body.notes === "string"
          ? body.notes.trim().slice(0, 500) || null
          : null,
      loggedByUserId: session.user.id,
    },
    select: {
      id: true,
      type: true,
      occurredAt: true,
      pickupName: true,
      notes: true,
      authorization: {
        select: { firstName: true, lastName: true, relationship: true },
      },
    },
  });

  // Fire-and-forget push to the parent. Failures are logged inside
  // sendPushToUser; we don't want a push hiccup to fail the API call.
  const pickupName =
    event.authorization
      ? `${event.authorization.firstName} ${event.authorization.lastName}`
      : event.pickupName ?? null;
  void sendPushToUser(student.parentId, {
    title:
      event.type === "ENTRY"
        ? `${student.firstName} est arrivé(e) à l'école`
        : `${student.firstName} a quitté l'école`,
    body: pickupName
      ? `Avec ${pickupName} · ${new Date(event.occurredAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
      : new Date(event.occurredAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    tag: `pickup-${student.id}`,
    url: "/dashboard/parent",
  });

  return NextResponse.json({ event });
}
