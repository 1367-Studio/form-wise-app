import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/authOptions";
import { prisma } from "../../../../../lib/prisma";

async function ownEntry(
  id: string,
  email: string,
  tenantId: string
) {
  const teacher = await prisma.teacher.findFirst({
    where: { user: { email }, tenantId },
    select: { id: true },
  });
  if (!teacher) return null;
  const journal = await prisma.dailyJournal.findFirst({
    where: { id, teacherId: teacher.id, tenantId },
  });
  return journal;
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER" || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const journal = await ownEntry(id, session.user.email!, session.user.tenantId);
  if (!journal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { classSummary, homework, date, subjectId } = body;

  if (subjectId) {
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        tenantId: session.user.tenantId,
        classId: journal.classId,
      },
    });
    if (!subject) {
      return NextResponse.json(
        { error: "Subject does not belong to your class" },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.dailyJournal.update({
    where: { id },
    data: {
      classSummary: classSummary ?? journal.classSummary,
      homework: homework ?? journal.homework,
      date: date ? new Date(date) : journal.date,
      subjectId: subjectId === undefined ? journal.subjectId : subjectId || null,
    },
  });

  return NextResponse.json({ success: true, journal: updated });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER" || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const journal = await ownEntry(id, session.user.email!, session.user.tenantId);
  if (!journal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.dailyJournal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
