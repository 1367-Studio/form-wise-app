import { NextResponse } from "next/server";
import { requireSession } from "../../../../../../lib/security";
import { prisma } from "../../../../../../lib/prisma";

export async function POST(
  req: Request,
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

  const body = await req.json();
  const { grades } = body as {
    grades?: { studentId: string; score?: number | null; absent?: boolean; comment?: string }[];
  };

  if (!grades?.length) {
    return NextResponse.json({ error: "Notes requises" }, { status: 400 });
  }

  // Validate students belong to the class
  const studentIds = grades.map((g) => g.studentId);
  const students = await prisma.student.findMany({
    where: { id: { in: studentIds }, classId: evaluation.classId },
    select: { id: true },
  });
  const validIds = new Set(students.map((s) => s.id));

  const upserts = grades
    .filter((g) => validIds.has(g.studentId))
    .map((g) =>
      prisma.grade.upsert({
        where: { evaluationId_studentId: { evaluationId: id, studentId: g.studentId } },
        create: {
          evaluationId: id,
          studentId: g.studentId,
          score: g.absent ? null : (g.score ?? null),
          absent: g.absent ?? false,
          comment: g.comment?.trim() || null,
        },
        update: {
          score: g.absent ? null : (g.score ?? null),
          absent: g.absent ?? false,
          comment: g.comment?.trim() || null,
        },
      })
    );

  await prisma.$transaction(upserts);

  return NextResponse.json({ success: true, count: upserts.length });
}
