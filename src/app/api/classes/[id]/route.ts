// ✅ Multi-tenant filter added (tenantId) with SUPER_ADMIN support
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import { prisma } from "../../../../lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "DIRECTOR" || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const cls = await prisma.class.findFirst({
    where: { id, tenantId: session.user.tenantId },
    select: {
      id: true,
      name: true,
      monthlyFee: true,
      schoolYear: { select: { id: true, name: true } },
      subjects: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          createdAt: true,
          teachers: {
            select: {
              id: true,
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
      _count: { select: { Student: true, teachers: true } },
    },
  });
  if (!cls) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    class: {
      id: cls.id,
      name: cls.name,
      monthlyFee: cls.monthlyFee,
      schoolYearName: cls.schoolYear?.name ?? null,
      studentCount: cls._count.Student,
      teacherCount: cls._count.teachers,
      subjects: cls.subjects.map((s) => ({
        id: s.id,
        name: s.name,
        createdAt: s.createdAt.toISOString(),
        teachers: s.teachers.map((t) => ({
          id: t.id,
          name: `${t.user?.firstName ?? ""} ${t.user?.lastName ?? ""}`.trim(),
        })),
      })),
    },
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Vérifier les permissions
  const allowedRoles = ["SUPER_ADMIN", "DIRECTOR"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      { error: "Permissions insuffisantes" },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    // ✅ Construction conditionnelle de la clause where selon le rôle
    const whereClause =
      session.user.role === "SUPER_ADMIN"
        ? { id } // SUPER_ADMIN peut supprimer n'importe quelle classe
        : {
            id,
            tenantId: session.user.tenantId as string, // Safe car non-null pour DIRECTOR
          };

    const deleted = await prisma.class.deleteMany({
      where: whereClause,
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "Classe non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression classe :", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
