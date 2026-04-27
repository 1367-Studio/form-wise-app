import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tenantId = session.user.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "Missing tenant" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const studentIdFilter = searchParams.get("studentId");

  const students = await prisma.student.findMany({
    where: { parent: { email: session.user.email! }, tenantId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      classId: true,
      class: { select: { id: true, name: true } },
    },
  });

  const myStudents = studentIdFilter
    ? students.filter((s) => s.id === studentIdFilter)
    : students;

  const classIds = Array.from(
    new Set(myStudents.map((s) => s.classId).filter((c): c is string => !!c))
  );

  if (classIds.length === 0) {
    return NextResponse.json({
      students: students.map((s) => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        className: s.class?.name ?? null,
      })),
      entries: [],
    });
  }

  const entries = await prisma.dailyJournal.findMany({
    where: {
      tenantId,
      classId: { in: classIds },
    },
    orderBy: { date: "desc" },
    take: 100,
    include: {
      readBy: {
        where: { parentId: session.user.id },
        select: { id: true },
      },
    },
  });

  // Hydrate teacher and subject names without trusting the client
  const teacherIds = Array.from(new Set(entries.map((e) => e.teacherId)));
  const subjectIds = Array.from(
    new Set(
      entries.map((e) => e.subjectId).filter((s): s is string => !!s)
    )
  );

  const [teachers, subjects] = await Promise.all([
    prisma.teacher.findMany({
      where: { id: { in: teacherIds }, tenantId },
      select: {
        id: true,
        user: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.subject.findMany({
      where: { id: { in: subjectIds }, tenantId },
      select: { id: true, name: true },
    }),
  ]);

  const teacherMap = new Map(
    teachers.map((t) => [
      t.id,
      `${t.user?.firstName ?? ""} ${t.user?.lastName ?? ""}`.trim(),
    ])
  );
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

  const classToStudents = new Map<string, { id: string; name: string }[]>();
  for (const s of students) {
    if (!s.classId) continue;
    const list = classToStudents.get(s.classId) ?? [];
    list.push({ id: s.id, name: `${s.firstName} ${s.lastName}` });
    classToStudents.set(s.classId, list);
  }

  return NextResponse.json({
    students: students.map((s) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      className: s.class?.name ?? null,
    })),
    entries: entries.map((e) => ({
      id: e.id,
      date: e.date.toISOString(),
      classId: e.classId,
      subjectId: e.subjectId,
      subjectName: e.subjectId ? subjectMap.get(e.subjectId) ?? null : null,
      teacherName: teacherMap.get(e.teacherId) ?? null,
      classSummary: e.classSummary,
      homework: e.homework,
      isRead: e.readBy.length > 0,
      students: classToStudents.get(e.classId) ?? [],
      createdAt: e.createdAt.toISOString(),
    })),
  });
}
