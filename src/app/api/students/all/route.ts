// ✅ Multi-tenant filter added (tenantId)
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import { prisma } from "../../../../lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
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

  // Vérifier que les non-SUPER_ADMIN ont un tenantId
  if (session.user.role !== "SUPER_ADMIN" && !session.user.tenantId) {
    return NextResponse.json(
      { error: "Utilisateur sans tenant" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const classId = searchParams.get("classId");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  // Construction conditionnelle du filtre tenant
  const tenantFilter =
    session.user.role === "SUPER_ADMIN"
      ? {}
      : { tenantId: session.user.tenantId as string };

  const statusParam = searchParams.get("status"); // Optional override
  const statusFilter: Prisma.StudentWhereInput = statusParam
    ? { status: statusParam }
    : { status: "ACCEPTED" }; // Default: hide PENDING/REJECTED from the general list

  const where: Prisma.StudentWhereInput = {
    AND: [
      tenantFilter, // ✅ Filtrage multi-tenant conditionnel
      statusFilter,
      search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      classId ? { classId } : {},
    ],
  };

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        hasHealthIssues: true,
        canLeaveAlone: true,
        class: {
          select: { id: true, name: true },
        },
        parent: {
          select: {
            iban: true,
            bic: true,
            bankName: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        documents: {
          select: { id: true },
        },
        // Inclure tenantId pour SUPER_ADMIN pour le contexte
        ...(session.user.role === "SUPER_ADMIN" && {
          tenantId: true,
          tenant: {
            select: {
              name: true,
              schoolCode: true,
            },
          },
        }),
      },
    }),
    prisma.student.count({ where }),
  ]);

  return NextResponse.json({
    students,
    total,
    page,
    pageSize,
  });
}
