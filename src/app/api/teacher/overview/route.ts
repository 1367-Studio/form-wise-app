import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireSession } from "../../../../lib/security";

function dayOnly(input: Date): Date {
  return new Date(
    Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate()),
  );
}

export async function GET() {
  const auth = await requireSession({ roles: ["TEACHER"], requireTenant: true });
  if ("error" in auth) return auth.error;

  const { session } = auth;
  const tenantId = session.user.tenantId!;

  // Find the teacher record linked to the authenticated user
  const teacher = await prisma.teacher.findFirst({
    where: { user: { email: session.user.email! }, tenantId },
    include: {
      user: { select: { firstName: true, lastName: true } },
      class: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, classId: true } },
    },
  });

  if (!teacher) {
    return NextResponse.json({
      teacher: null,
      students: { total: 0 },
      attendance: { present: 0, absent: 0, late: 0, excused: 0 },
      journal: { entriesThisWeek: 0 },
      notifications: { unread: 0 },
      recentJournals: [],
    });
  }

  const classId = teacher.classId ?? teacher.subject?.classId ?? null;
  const today = dayOnly(new Date());

  // Start of week (Monday)
  const weekStart = new Date(today);
  const dow = weekStart.getUTCDay();
  const diff = dow === 0 ? 6 : dow - 1; // Monday = 0 offset
  weekStart.setUTCDate(weekStart.getUTCDate() - diff);

  const [studentCount, attendanceRows, journalCount, unreadCount, recentJournals] =
    await Promise.all([
      // Student count in teacher's class
      classId
        ? prisma.student.count({
            where: { tenantId, classId, status: { not: "REJECTED" } },
          })
        : Promise.resolve(0),

      // Today's attendance entries
      classId
        ? prisma.attendance.findMany({
            where: { tenantId, classId, date: today },
            select: { status: true },
          })
        : Promise.resolve([]),

      // Journal entries this week
      prisma.dailyJournal.count({
        where: {
          teacherId: teacher.id,
          tenantId,
          date: { gte: weekStart },
        },
      }),

      // Unread notifications count
      prisma.notification.count({
        where: {
          teacherId: teacher.id,
          tenantId,
          readByTeachers: { none: { teacherId: teacher.id } },
        },
      }),

      // Recent journal entries (last 3)
      prisma.dailyJournal.findMany({
        where: { teacherId: teacher.id, tenantId },
        orderBy: { date: "desc" },
        take: 3,
        select: {
          id: true,
          date: true,
          classSummary: true,
          subjectId: true,
        },
      }),
    ]);

  // Tally attendance statuses
  const attendance = { present: 0, absent: 0, late: 0, excused: 0 };
  for (const row of attendanceRows) {
    const s = row.status.toUpperCase();
    if (s === "PRESENT") attendance.present++;
    else if (s === "ABSENT") attendance.absent++;
    else if (s === "LATE") attendance.late++;
    else if (s === "EXCUSED") attendance.excused++;
  }

  // Resolve subject names for recent journals
  const subjectIds = [
    ...new Set(
      recentJournals.map((j) => j.subjectId).filter((id): id is string => !!id),
    ),
  ];
  const subjects =
    subjectIds.length > 0
      ? await prisma.subject.findMany({
          where: { id: { in: subjectIds }, tenantId },
          select: { id: true, name: true },
        })
      : [];
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

  return NextResponse.json({
    teacher: {
      firstName: teacher.user?.firstName ?? "",
      lastName: teacher.user?.lastName ?? "",
      className: teacher.class?.name ?? "",
      subjectName: teacher.subject?.name ?? "",
    },
    students: { total: studentCount },
    attendance,
    journal: { entriesThisWeek: journalCount },
    notifications: { unread: unreadCount },
    recentJournals: recentJournals.map((j) => ({
      id: j.id,
      date: j.date.toISOString(),
      classSummary: j.classSummary,
      subjectName: j.subjectId ? subjectMap.get(j.subjectId) ?? "" : "",
    })),
  });
}
