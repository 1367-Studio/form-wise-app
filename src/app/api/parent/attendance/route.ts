import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PARENT" || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tenantId = session.user.tenantId;

  const students = await prisma.student.findMany({
    where: { parent: { email: session.user.email! }, tenantId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      class: { select: { name: true } },
    },
  });

  if (students.length === 0) {
    return NextResponse.json({ students: [], entries: [] });
  }

  const studentIds = students.map((s) => s.id);

  // Last 60 days of attendance
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 60);
  since.setUTCHours(0, 0, 0, 0);

  const entries = await prisma.attendance.findMany({
    where: {
      tenantId,
      studentId: { in: studentIds },
      date: { gte: since },
    },
    orderBy: { date: "desc" },
    take: 200,
  });

  return NextResponse.json({
    students: students.map((s) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      className: s.class?.name ?? null,
    })),
    entries: entries.map((e) => ({
      id: e.id,
      studentId: e.studentId,
      date: e.date.toISOString(),
      status: e.status,
      notes: e.notes,
      justificationNotes: e.justificationNotes,
      justificationDocId: e.justificationDocId,
      justifiedAt: e.justifiedAt?.toISOString() ?? null,
    })),
  });
}
