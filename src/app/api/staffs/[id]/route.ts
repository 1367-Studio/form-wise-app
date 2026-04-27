import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import { prisma } from "../../../../lib/prisma";

const ALLOWED_UPDATE_FIELDS = [
  "firstName",
  "lastName",
  "phone",
  "roleLabel",
] as const;

type UpdatableStaff = Partial<
  Pick<Record<(typeof ALLOWED_UPDATE_FIELDS)[number], string>, (typeof ALLOWED_UPDATE_FIELDS)[number]>
>;

function pickAllowed(input: Record<string, unknown>): UpdatableStaff {
  const out: UpdatableStaff = {};
  for (const key of ALLOWED_UPDATE_FIELDS) {
    const value = input[key];
    if (typeof value === "string") {
      out[key] = value;
    }
  }
  return out;
}

async function authorize() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) } as const;
  }
  const role = session.user.role;
  if (role !== "DIRECTOR" && role !== "SUPER_ADMIN") {
    return { error: NextResponse.json({ error: "Permissions insuffisantes" }, { status: 403 }) } as const;
  }
  if (role !== "SUPER_ADMIN" && !session.user.tenantId) {
    return { error: NextResponse.json({ error: "Utilisateur sans tenant" }, { status: 403 }) } as const;
  }
  return { session } as const;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize();
  if ("error" in auth) return auth.error;
  const { session } = auth;

  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;
  const data = pickAllowed(body);

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Aucun champ valide à mettre à jour" }, { status: 400 });
  }

  const where =
    session.user.role === "SUPER_ADMIN"
      ? { id }
      : { id, tenantId: session.user.tenantId as string };

  const result = await prisma.staff.updateMany({ where, data });
  if (result.count === 0) {
    return NextResponse.json({ error: "Staff non trouvé" }, { status: 404 });
  }

  const updated = await prisma.staff.findUnique({ where: { id } });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize();
  if ("error" in auth) return auth.error;
  const { session } = auth;

  const { id } = await params;

  const where =
    session.user.role === "SUPER_ADMIN"
      ? { id }
      : { id, tenantId: session.user.tenantId as string };

  const result = await prisma.staff.deleteMany({ where });
  if (result.count === 0) {
    return NextResponse.json({ error: "Staff non trouvé" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
