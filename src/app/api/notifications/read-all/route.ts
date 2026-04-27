import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import { prisma } from "../../../../lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = session.user.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "Missing tenant" }, { status: 400 });
  }

  const parent = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { students: { select: { id: true } } },
  });

  const studentIds = parent?.students.map((s) => s.id) ?? [];

  const unread = await prisma.notification.findMany({
    where: {
      tenantId,
      OR: [{ isGlobal: true }, { studentId: { in: studentIds } }],
      NOT: { readBy: { some: { parentId: session.user.id } } },
    },
    select: { id: true },
  });

  if (unread.length === 0) {
    return NextResponse.json({ success: true, marked: 0 });
  }

  await prisma.notificationRead.createMany({
    data: unread.map((n) => ({
      notificationId: n.id,
      parentId: session.user.id,
      readAt: new Date(),
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({ success: true, marked: unread.length });
}
