import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import { prisma } from "../../../../lib/prisma";
import { sendPushToUser } from "../../../../lib/webpush";

async function getTeacher(session: { user: { email: string; tenantId: string | null } }) {
  if (!session.user.tenantId) return null;
  return prisma.teacher.findFirst({
    where: { user: { email: session.user.email }, tenantId: session.user.tenantId },
    include: {
      class: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, classId: true } },
    },
  });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacher = await getTeacher(session);
  if (!teacher) {
    // No Teacher row yet (e.g. role changed to TEACHER but no profile created).
    // Return a well-shaped empty payload so the client renders an explanatory
    // empty state instead of crashing.
    return NextResponse.json({
      teacher: null,
      subjects: [],
      journals: [],
    });
  }

  const teacherClassId =
    teacher.classId ?? teacher.subject?.classId ?? null;

  const journals = await prisma.dailyJournal.findMany({
    where: { teacherId: teacher.id, tenantId: session.user.tenantId! },
    orderBy: { date: "desc" },
    take: 100,
  });

  const subjects = teacherClassId
    ? await prisma.subject.findMany({
        where: {
          tenantId: session.user.tenantId!,
          classId: teacherClassId,
        },
        select: { id: true, name: true },
      })
    : [];

  return NextResponse.json({
    teacher: {
      id: teacher.id,
      classId: teacherClassId,
      className: teacher.class?.name ?? null,
      subjectId: teacher.subjectId ?? null,
      subjectName: teacher.subject?.name ?? null,
    },
    subjects,
    journals,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacher = await getTeacher(session);
  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  const teacherClassId = teacher.classId ?? teacher.subject?.classId ?? null;
  if (!teacherClassId) {
    return NextResponse.json(
      { error: "Teacher is not assigned to a class" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { date, subjectId, classSummary, homework } = body;

  if (!date || !classSummary || !homework) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }
  if (classSummary.length > 5000 || homework.length > 5000) {
    return NextResponse.json({ error: "Text too long" }, { status: 400 });
  }

  if (subjectId) {
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        tenantId: session.user.tenantId!,
        classId: teacherClassId,
      },
    });
    if (!subject) {
      return NextResponse.json(
        { error: "Subject does not belong to your class" },
        { status: 400 }
      );
    }
  }

  const journal = await prisma.dailyJournal.create({
    data: {
      tenantId: session.user.tenantId!,
      classId: teacherClassId,
      subjectId: subjectId || null,
      teacherId: teacher.id,
      date: new Date(date),
      classSummary,
      homework,
    },
  });

  // Emit one notification per UNIQUE PARENT for this class — not per student.
  // A family with two siblings in the same class would otherwise get two
  // duplicate bell entries for a single journal post.
  const students = await prisma.student.findMany({
    where: {
      tenantId: session.user.tenantId!,
      classId: teacherClassId,
    },
    select: { id: true, parentId: true },
  });

  const seenParents = new Set<string>();
  const oneStudentPerParent = students.filter((s) => {
    if (seenParents.has(s.parentId)) return false;
    seenParents.add(s.parentId);
    return true;
  });

  if (oneStudentPerParent.length > 0) {
    const className = teacher.class?.name ?? "";
    const subjectName =
      subjectId && teacher.subject?.id === subjectId
        ? teacher.subject?.name
        : null;
    const titleSuffix = subjectName
      ? `${className} · ${subjectName}`
      : className;
    const notifTitle = titleSuffix
      ? `Journal de classe — ${titleSuffix}`
      : "Journal de classe";
    const notifMessage = "Nouveau résumé de classe et devoirs pour demain.";

    await prisma.notification.createMany({
      data: oneStudentPerParent.map((s) => ({
        title: notifTitle,
        message: notifMessage,
        isGlobal: false,
        category: "ACADEMIC" as const,
        studentId: s.id,
        teacherId: teacher.id,
        tenantId: session.user.tenantId!,
      })),
    });

    // Fire-and-forget push to each parent. tag=`journal-{classId}-{date}` so
    // multiple updates to the same day's journal coalesce into one banner.
    const tag = `journal-${teacherClassId}-${journal.date.toISOString().slice(0, 10)}`;
    for (const s of oneStudentPerParent) {
      void sendPushToUser(s.parentId, {
        title: notifTitle,
        body: notifMessage,
        url: "/dashboard/parent",
        tag,
      });
    }
  }

  return NextResponse.json({ success: true, journal });
}
