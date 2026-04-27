import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/authOptions";
import { prisma } from "../../../../../lib/prisma";

const VALID_STATUSES = new Set(["PRESENT", "ABSENT", "LATE", "EXCUSED"]);

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER" || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tenantId = session.user.tenantId;
  const { id } = await ctx.params;

  const body = await req.json();
  const { status, notes } = body as { status?: string; notes?: string };
  if (status !== undefined && !VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Confirm attendance belongs to this teacher's class.
  const teacher = await prisma.teacher.findFirst({
    where: { user: { email: session.user.email! }, tenantId },
    include: { subject: { select: { classId: true } } },
  });
  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }
  const teacherClassId = teacher.classId ?? teacher.subject?.classId ?? null;
  if (!teacherClassId) {
    return NextResponse.json({ error: "No class assigned" }, { status: 400 });
  }

  const attendance = await prisma.attendance.findFirst({
    where: { id, tenantId, classId: teacherClassId },
  });
  if (!attendance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.attendance.update({
    where: { id },
    data: {
      ...(status ? { status, markedByTeacherId: teacher.id } : {}),
      ...(notes !== undefined ? { notes } : {}),
    },
  });

  return NextResponse.json({ success: true, attendance: updated });
}
