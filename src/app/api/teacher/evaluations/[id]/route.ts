import { NextResponse } from "next/server";
import { requireSession } from "../../../../../lib/security";
import { prisma } from "../../../../../lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession({ roles: ["TEACHER"], requireTenant: true });
  if ("error" in auth) return auth.error;
  const { session } = auth;
  const { id } = await params;

  const teacher = await prisma.teacher.findUnique({ where: { userId: session.user.id } });
  if (!teacher) return NextResponse.json({ error: "Enseignant non trouvé" }, { status: 404 });

  const evaluation = await prisma.evaluation.findFirst({
    where: { id, teacherId: teacher.id },
    include: {
      class: { select: { name: true } },
      subject: { select: { name: true } },
      grades: {
        include: { student: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { student: { lastName: "asc" } },
      },
    },
  });

  if (!evaluation) {
    return NextResponse.json({ error: "Évaluation non trouvée" }, { status: 404 });
  }

  // Get all students in the class for the gradebook
  const students = await prisma.student.findMany({
    where: { classId: evaluation.classId, tenantId: session.user.tenantId as string },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { lastName: "asc" },
  });

  return NextResponse.json({ evaluation, students });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession({ roles: ["TEACHER"], requireTenant: true });
  if ("error" in auth) return auth.error;
  const { session } = auth;
  const { id } = await params;

  const teacher = await prisma.teacher.findUnique({ where: { userId: session.user.id } });
  if (!teacher) return NextResponse.json({ error: "Enseignant non trouvé" }, { status: 404 });

  const evaluation = await prisma.evaluation.findFirst({ where: { id, teacherId: teacher.id } });
  if (!evaluation) {
    return NextResponse.json({ error: "Évaluation non trouvée" }, { status: 404 });
  }

  await prisma.evaluation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
