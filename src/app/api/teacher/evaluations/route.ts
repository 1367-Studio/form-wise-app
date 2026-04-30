import { NextResponse } from "next/server";
import { requireSession } from "../../../../lib/security";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const auth = await requireSession({ roles: ["TEACHER"], requireTenant: true });
  if ("error" in auth) return auth.error;
  const { session } = auth;

  const teacher = await prisma.teacher.findUnique({ where: { userId: session.user.id } });
  if (!teacher) return NextResponse.json({ error: "Enseignant non trouvé" }, { status: 404 });

  const evaluations = await prisma.evaluation.findMany({
    where: { teacherId: teacher.id },
    include: {
      class: { select: { name: true } },
      subject: { select: { name: true } },
      _count: { select: { grades: true } },
      grades: { select: { score: true, absent: true } },
    },
    orderBy: { date: "desc" },
  });

  const result = evaluations.map((e) => {
    const scored = e.grades.filter((g) => g.score !== null && !g.absent);
    const avg = scored.length > 0 ? scored.reduce((s, g) => s + (g.score ?? 0), 0) / scored.length : null;
    return {
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.date,
      maxScore: e.maxScore,
      coefficient: e.coefficient,
      type: e.type,
      className: e.class.name,
      subjectName: e.subject?.name ?? null,
      gradedCount: e._count.grades,
      average: avg !== null ? Math.round(avg * 100) / 100 : null,
    };
  });

  return NextResponse.json({ evaluations: result });
}

export async function POST(req: Request) {
  const auth = await requireSession({ roles: ["TEACHER"], requireTenant: true });
  if ("error" in auth) return auth.error;
  const { session } = auth;
  const tenantId = session.user.tenantId as string;

  const teacher = await prisma.teacher.findUnique({ where: { userId: session.user.id } });
  if (!teacher || !teacher.classId) {
    return NextResponse.json({ error: "Enseignant ou classe non trouvé" }, { status: 404 });
  }

  const body = await req.json();
  const { title, description, date, maxScore, coefficient, type } = body as {
    title?: string; description?: string; date?: string;
    maxScore?: number; coefficient?: number; type?: string;
  };

  if (!title?.trim() || !date) {
    return NextResponse.json({ error: "Titre et date requis" }, { status: 400 });
  }

  const evaluation = await prisma.evaluation.create({
    data: {
      tenantId,
      classId: teacher.classId,
      subjectId: teacher.subjectId,
      teacherId: teacher.id,
      title: title.trim(),
      description: description?.trim() || null,
      date: new Date(date),
      maxScore: maxScore ?? 20,
      coefficient: coefficient ?? 1,
      type: type ?? "EXAM",
    },
  });

  return NextResponse.json({ success: true, evaluation }, { status: 201 });
}
