import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import { prisma } from "../../../../lib/prisma";
import { sendAbsenceEmail } from "../../../../lib/attendanceMail";
import { sendPushToUser } from "../../../../lib/webpush";

const VALID_STATUSES = new Set(["PRESENT", "ABSENT", "LATE", "EXCUSED"]);

function dayOnly(input: string | Date): Date {
  const d = new Date(input);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

async function getTeacherAndClass(email: string, tenantId: string) {
  const teacher = await prisma.teacher.findFirst({
    where: { user: { email }, tenantId },
    include: {
      class: { select: { id: true, name: true } },
      subject: { select: { classId: true } },
    },
  });
  if (!teacher) return null;
  const classId = teacher.classId ?? teacher.subject?.classId ?? null;
  return { teacher, classId };
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER" || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ctx = await getTeacherAndClass(session.user.email!, session.user.tenantId);
  if (!ctx) {
    return NextResponse.json({ teacher: null, classId: null, students: [], entries: [], date: null });
  }
  const { teacher, classId } = ctx;
  if (!classId) {
    return NextResponse.json({
      teacher: { id: teacher.id, className: teacher.class?.name ?? null },
      classId: null,
      students: [],
      entries: [],
      date: null,
    });
  }

  const { searchParams } = new URL(req.url);
  const dateRaw = searchParams.get("date");
  const date = dayOnly(dateRaw ?? new Date().toISOString());

  const [students, entries] = await Promise.all([
    prisma.student.findMany({
      where: {
        tenantId: session.user.tenantId,
        classId,
        status: { not: "REJECTED" },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: { id: true, firstName: true, lastName: true },
    }),
    prisma.attendance.findMany({
      where: {
        tenantId: session.user.tenantId,
        classId,
        date,
      },
    }),
  ]);

  return NextResponse.json({
    teacher: { id: teacher.id, className: teacher.class?.name ?? null },
    classId,
    date: date.toISOString(),
    students,
    entries: entries.map((e) => ({
      id: e.id,
      studentId: e.studentId,
      status: e.status,
      notes: e.notes,
      justificationNotes: e.justificationNotes,
      justificationDocId: e.justificationDocId,
      justifiedAt: e.justifiedAt?.toISOString() ?? null,
    })),
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER" || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ctx = await getTeacherAndClass(session.user.email!, session.user.tenantId);
  if (!ctx?.classId) {
    return NextResponse.json({ error: "Teacher not assigned to a class" }, { status: 400 });
  }
  const { teacher, classId } = ctx;
  const tenantId = session.user.tenantId;

  const body = await req.json();
  const { date, entries } = body as {
    date: string;
    entries: { studentId: string; status: string; notes?: string }[];
  };
  if (!date || !Array.isArray(entries)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  for (const e of entries) {
    if (!e.studentId || !VALID_STATUSES.has(e.status)) {
      return NextResponse.json({ error: "Invalid entry" }, { status: 400 });
    }
  }
  const dayDate = dayOnly(date);

  // Confirm every studentId belongs to this teacher's class — never trust the client.
  const validStudents = await prisma.student.findMany({
    where: {
      tenantId,
      classId,
      id: { in: entries.map((e) => e.studentId) },
    },
    include: {
      parent: { select: { email: true, firstName: true } },
      tenant: { select: { name: true } },
      class: { select: { name: true } },
    },
  });
  const studentMap = new Map(validStudents.map((s) => [s.id, s]));

  // Find what existed before to know which are NEW absences (worth notifying).
  const existing = await prisma.attendance.findMany({
    where: {
      tenantId,
      classId,
      date: dayDate,
      studentId: { in: Array.from(studentMap.keys()) },
    },
  });
  const existingMap = new Map(existing.map((e) => [e.studentId, e.status]));

  const ops = entries
    .filter((e) => studentMap.has(e.studentId))
    .map((e) =>
      prisma.attendance.upsert({
        where: {
          studentId_date: { studentId: e.studentId, date: dayDate },
        },
        create: {
          tenantId,
          classId,
          studentId: e.studentId,
          date: dayDate,
          status: e.status,
          notes: e.notes ?? null,
          markedByTeacherId: teacher.id,
        },
        update: {
          status: e.status,
          notes: e.notes ?? null,
          markedByTeacherId: teacher.id,
        },
      })
    );
  await prisma.$transaction(ops);

  // Side-effects: parent bell notification + email for newly-flagged ABSENT/LATE
  const newlyFlagged = entries.filter((e) => {
    const before = existingMap.get(e.studentId);
    const isFlag = e.status === "ABSENT" || e.status === "LATE";
    return isFlag && before !== e.status;
  });

  if (newlyFlagged.length > 0) {
    // Bell notifications, deduped by parent
    const seenParents = new Set<string>();
    const notifData: {
      title: string;
      message: string;
      isGlobal: boolean;
      category: "ATTENDANCE";
      studentId: string;
      teacherId: string;
      tenantId: string;
    }[] = [];
    for (const e of newlyFlagged) {
      const s = studentMap.get(e.studentId);
      if (!s) continue;
      if (seenParents.has(s.parentId)) continue;
      seenParents.add(s.parentId);
      notifData.push({
        title:
          e.status === "ABSENT"
            ? `Absence signalée — ${s.firstName} ${s.lastName}`
            : `Retard signalé — ${s.firstName} ${s.lastName}`,
        message:
          e.status === "ABSENT"
            ? "Votre enfant a été marqué absent aujourd'hui."
            : "Votre enfant a été marqué en retard aujourd'hui.",
        isGlobal: false,
        category: "ATTENDANCE" as const,
        studentId: s.id,
        teacherId: teacher.id,
        tenantId,
      });
    }
    if (notifData.length > 0) {
      await prisma.notification.createMany({ data: notifData });
    }

    // Push notifications — same fire-and-forget pattern as emails. Coalesce
    // by parent so two siblings flagged the same day don't double-buzz.
    const seenParentsForPush = new Set<string>();
    for (const e of newlyFlagged) {
      const s = studentMap.get(e.studentId);
      if (!s || seenParentsForPush.has(s.parentId)) continue;
      seenParentsForPush.add(s.parentId);
      void sendPushToUser(s.parentId, {
        title:
          e.status === "ABSENT"
            ? `Absence — ${s.firstName}`
            : `Retard — ${s.firstName}`,
        body:
          e.status === "ABSENT"
            ? "Marqué(e) absent(e) aujourd'hui."
            : "Marqué(e) en retard aujourd'hui.",
        url: "/dashboard/parent",
        tag: `attendance-${s.id}-${dayDate.toISOString().slice(0, 10)}`,
      });
    }

    // Emails — fire and forget so we don't block the response on Resend latency.
    const dateLabel = dayDate.toISOString().slice(0, 10);
    Promise.all(
      newlyFlagged.map(async (e) => {
        const s = studentMap.get(e.studentId);
        if (!s?.parent?.email) return;
        await sendAbsenceEmail({
          to: s.parent.email,
          childFirstName: s.firstName,
          childLastName: s.lastName,
          dateLabel,
          schoolName: s.tenant?.name ?? null,
          status: e.status as "ABSENT" | "LATE",
          classLabel: s.class?.name ?? null,
        });
      })
    ).catch((err) => console.error("absence emails failed:", err));
  }

  return NextResponse.json({ success: true, count: entries.length });
}
