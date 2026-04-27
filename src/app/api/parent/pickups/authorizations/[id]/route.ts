import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import {
  enforceRateLimit,
  enforceSameOrigin,
  requireSession,
} from "../../../../../../lib/security";

async function ensureOwnership(authId: string, parentUserId: string) {
  const found = await prisma.pickupAuthorization.findFirst({
    where: { id: authId, student: { parentId: parentUserId } },
    select: { id: true },
  });
  return !!found;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const csrf = enforceSameOrigin(req);
  if (csrf) return csrf;

  const auth = await requireSession({ roles: ["PARENT"] });
  if ("error" in auth) return auth.error;
  const { session } = auth;

  const rl = enforceRateLimit(
    req,
    { name: "pickup-auth-update", limit: 60, windowMs: 60 * 60 * 1000 },
    session.user.id
  );
  if (rl) return rl;

  const { id } = await params;
  if (!(await ensureOwnership(id, session.user.id))) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  for (const key of ["firstName", "lastName", "relationship", "phone", "notes", "photoUrl"] as const) {
    if (typeof body[key] === "string") {
      const v = (body[key] as string).trim();
      data[key] = v === "" && key !== "firstName" && key !== "lastName" ? null : v;
    }
  }
  if ("expiresAt" in body) {
    if (typeof body.expiresAt === "string" && body.expiresAt) {
      data.expiresAt = new Date(body.expiresAt);
    } else if (body.expiresAt === null || body.expiresAt === "") {
      data.expiresAt = null;
    }
  }

  const updated = await prisma.pickupAuthorization.update({
    where: { id },
    data,
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

  return NextResponse.json({ authorization: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const csrf = enforceSameOrigin(req);
  if (csrf) return csrf;

  const auth = await requireSession({ roles: ["PARENT"] });
  if ("error" in auth) return auth.error;
  const { session } = auth;

  const { id } = await params;
  if (!(await ensureOwnership(id, session.user.id))) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  await prisma.pickupAuthorization.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
