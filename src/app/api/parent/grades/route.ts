import { NextResponse } from "next/server";
import { requireSession } from "../../../../lib/security";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const auth = await requireSession({ roles: ["PARENT"], requireTenant: true });
  if ("error" in auth) return auth.error;
  const { session } = auth;
  const tenantId = session.user.tenantId as string;

  const students = await prisma.student.findMany({
    where: { parentId: session.user.id, tenantId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      class: { select: { name: true } },
      grades: {
        include: {
          evaluation: {
            select: {
              id: true,
              title: true,
              date: true,
              maxScore: true,
              coefficient: true,
              type: true,
              subject: { select: { name: true } },
              class: { select: { name: true } },
            },
          },
        },
        orderBy: { evaluation: { date: "desc" } },
      },
    },
  });

  const result = students.map((s) => {
    const scored = s.grades.filter((g) => g.score !== null && !g.absent);
    const weightedSum = scored.reduce(
      (acc, g) => acc + (g.score ?? 0) * g.evaluation.coefficient,
      0
    );
    const totalCoeff = scored.reduce((acc, g) => acc + g.evaluation.coefficient, 0);
    const average = totalCoeff > 0 ? Math.round((weightedSum / totalCoeff) * 100) / 100 : null;

    return {
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      className: s.class?.name ?? null,
      average,
      grades: s.grades.map((g) => ({
        id: g.id,
        score: g.score,
        absent: g.absent,
        comment: g.comment,
        evaluation: {
          id: g.evaluation.id,
          title: g.evaluation.title,
          date: g.evaluation.date,
          maxScore: g.evaluation.maxScore,
          coefficient: g.evaluation.coefficient,
          type: g.evaluation.type,
          subjectName: g.evaluation.subject?.name ?? null,
          className: g.evaluation.class.name,
        },
      })),
    };
  });

  return NextResponse.json({ students: result });
}
