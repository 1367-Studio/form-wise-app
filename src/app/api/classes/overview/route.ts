import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "DIRECTOR" || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const classes = await prisma.class.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: [{ schoolYear: { startDate: "desc" } }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      monthlyFee: true,
      schoolYear: { select: { id: true, name: true } },
      _count: {
        select: { subjects: true, teachers: true, Student: true },
      },
    },
  });

  return NextResponse.json({
    classes: classes.map((c) => ({
      id: c.id,
      name: c.name,
      monthlyFee: c.monthlyFee,
      schoolYearName: c.schoolYear?.name ?? null,
      subjectCount: c._count.subjects,
      teacherCount: c._count.teachers,
      studentCount: c._count.Student,
    })),
  });
}
