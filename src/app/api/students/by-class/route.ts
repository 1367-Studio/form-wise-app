import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const role = session.user.role;
  const allowedRoles = ["DIRECTOR", "SUPER_ADMIN", "TEACHER", "STAFF"];
  if (!allowedRoles.includes(role)) {
    return NextResponse.json(
      { error: "Permissions insuffisantes" },
      { status: 403 }
    );
  }

  if (role !== "SUPER_ADMIN" && !session.user.tenantId) {
    return NextResponse.json(
      { error: "Utilisateur sans tenant" },
      { status: 403 }
    );
  }

  const tenantFilter =
    role === "SUPER_ADMIN"
      ? {}
      : { tenantId: session.user.tenantId as string };

  try {
    const classes = await prisma.class.findMany({
      where: tenantFilter,
      select: {
        name: true,
        Student: { select: { id: true } },
      },
    });

    const data = classes.map((cls) => ({
      class: cls.name,
      élèves: cls.Student.length,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur /api/students/by-class", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
