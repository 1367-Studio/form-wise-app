import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email!;
  const tenantId = session.user.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "Missing tenant" }, { status: 400 });
  }

  const userId = session.user.id;

  const [parent, students] = await Promise.all([
    prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        iban: true,
        bic: true,
        bankName: true,
        tenant: {
          select: { name: true, schoolCode: true },
        },
      },
    }),
    prisma.student.findMany({
      where: { parent: { email }, tenantId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        status: true,
        createdAt: true,
        class: {
          select: { id: true, name: true, monthlyFee: true },
        },
        _count: { select: { documents: true } },
      },
    }),
  ]);

  const studentIds = students.map((s) => s.id);

  const notifications = await prisma.notification.findMany({
    where: {
      tenantId,
      OR: [{ isGlobal: true }, { studentId: { in: studentIds } }],
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      message: true,
      createdAt: true,
      isGlobal: true,
      studentId: true,
      student: { select: { firstName: true, lastName: true } },
      readBy: { select: { parentId: true } },
    },
  });

  const allUnreadCount = await prisma.notification.count({
    where: {
      tenantId,
      OR: [{ isGlobal: true }, { studentId: { in: studentIds } }],
      NOT: { readBy: { some: { parentId: userId } } },
    },
  });

  const documentsCount = students.reduce(
    (sum, s) => sum + s._count.documents,
    0
  );

  const pendingCount = students.filter((s) => s.status === "PENDING").length;
  const ribComplete = !!(parent?.iban && parent?.bic && parent?.bankName);

  const monthlyTotal = students.reduce(
    (sum, s) => sum + (s.class?.monthlyFee ?? 0),
    0
  );

  return NextResponse.json({
    parent: {
      firstName: parent?.firstName ?? "",
      lastName: parent?.lastName ?? "",
      tenantName: parent?.tenant?.name ?? null,
      schoolCode: parent?.tenant?.schoolCode ?? null,
    },
    stats: {
      childrenCount: students.length,
      pendingCount,
      unreadCount: allUnreadCount,
      documentsCount,
      ribComplete,
      monthlyTotal,
    },
    students: students.map((s) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      birthDate: s.birthDate.toISOString(),
      status: s.status,
      className: s.class?.name ?? null,
      monthlyFee: s.class?.monthlyFee ?? null,
      documentsCount: s._count.documents,
    })),
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      createdAt: n.createdAt.toISOString(),
      isGlobal: n.isGlobal,
      studentName: n.student
        ? `${n.student.firstName} ${n.student.lastName}`
        : null,
      isRead: n.readBy.some((r) => r.parentId === userId),
    })),
  });
}
