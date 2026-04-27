// ✅ Multi-tenant filter added (tenantId) for each action

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";
import { prisma } from "../../../lib/prisma";
import { sendPushToUser } from "../../../lib/webpush";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "DIRECTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, message, targetType, studentId, teacherId, category } = body;

  if (!title || !message || !targetType) {
    return NextResponse.json(
      { error: "Champs requis manquants" },
      { status: 400 }
    );
  }

  const VALID_CATEGORIES = [
    "GENERAL",
    "ANNOUNCEMENT",
    "ACADEMIC",
    "ATTENDANCE",
    "BILLING",
    "EVENT",
    "HEALTH",
    "ADMIN",
  ] as const;
  const cat: (typeof VALID_CATEGORIES)[number] =
    typeof category === "string" &&
    (VALID_CATEGORIES as readonly string[]).includes(category)
      ? (category as (typeof VALID_CATEGORIES)[number])
      : "GENERAL";

  try {
    const tenantId = session.user.tenantId!;

    let targetUserIds: string[] = [];
    switch (targetType) {
      case "global_parents":
        await sendNotificationToAllParents(title, message, tenantId, cat);
        targetUserIds = (
          await prisma.user.findMany({
            where: { tenantId, role: "PARENT" },
            select: { id: true },
          })
        ).map((u) => u.id);
        break;
      case "student":
        if (!studentId) throw new Error("studentId requis");
        await sendNotificationToStudentParent(
          title,
          message,
          studentId,
          tenantId,
          cat
        );
        {
          const stu = await prisma.student.findFirst({
            where: { id: studentId, tenantId },
            select: { parentId: true },
          });
          if (stu) targetUserIds = [stu.parentId];
        }
        break;
      case "global_teachers":
        await sendNotificationToAllTeachers(title, message, tenantId, cat);
        targetUserIds = (
          await prisma.user.findMany({
            where: { tenantId, role: "TEACHER" },
            select: { id: true },
          })
        ).map((u) => u.id);
        break;
      case "teacher":
        if (!teacherId) throw new Error("teacherId requis");
        await sendNotificationToSpecificTeacher(
          title,
          message,
          teacherId,
          tenantId,
          cat
        );
        {
          const t = await prisma.teacher.findFirst({
            where: { id: teacherId, tenantId },
            select: { userId: true },
          });
          if (t?.userId) targetUserIds = [t.userId];
        }
        break;
      default:
        return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    }

    // Fire-and-forget pushes. tag=`notif-{tenantId}-{title-hash}` would dedupe
    // identical messages but we want each new title to appear distinctly,
    // so use a per-creation tag.
    const tag = `notif-${Date.now()}`;
    for (const uid of targetUserIds) {
      void sendPushToUser(uid, {
        title,
        body: message,
        url: "/dashboard/parent",
        tag,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur création notification :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  const email = session.user.email!;
  const tenantId = session.user.tenantId!;

  try {
    if (role === "DIRECTOR") {
      const notifications = await prisma.notification.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        include: {
          student: { select: { firstName: true, lastName: true } },
          teacher: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
          readBy: true,
          readByTeachers: true,
        },
      });
      return NextResponse.json({ notifications });
    }

    if (role === "PARENT") {
      const parent = await prisma.user.findUnique({
        where: { email },
        include: { students: true },
      });

      const studentIds = parent?.students.map((s) => s.id) || [];

      const notifications = await prisma.notification.findMany({
        where: {
          tenantId,
          OR: [{ isGlobal: true }, { studentId: { in: studentIds } }],
        },
        orderBy: { createdAt: "desc" },
        include: {
          student: { select: { firstName: true, lastName: true } },
          readBy: true,
        },
      });

      return NextResponse.json({ notifications });
    }

    if (role === "TEACHER") {
      const teacher = await prisma.teacher.findFirst({
        where: { user: { email }, tenantId },
      });

      if (!teacher) {
        return NextResponse.json(
          { error: "Professeur non trouvé" },
          { status: 404 }
        );
      }

      const notifications = await prisma.notification.findMany({
        where: {
          tenantId,
          OR: [{ teacherId: teacher.id }, { isGlobal: true, studentId: null }],
        },
        orderBy: { createdAt: "desc" },
        include: {
          teacher: {
            select: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
          readByTeachers: true,
        },
      });

      return NextResponse.json({ notifications });
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    console.error("Erreur récupération notifications :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ✅ Updated to include tenantId
type Cat =
  | "GENERAL"
  | "ANNOUNCEMENT"
  | "ACADEMIC"
  | "ATTENDANCE"
  | "BILLING"
  | "EVENT"
  | "HEALTH"
  | "ADMIN";

async function sendNotificationToAllParents(
  title: string,
  message: string,
  tenantId: string,
  category: Cat
) {
  await prisma.notification.create({
    data: { title, message, isGlobal: true, category, tenantId },
  });
}

async function sendNotificationToStudentParent(
  title: string,
  message: string,
  studentId: string,
  tenantId: string,
  category: Cat
) {
  await prisma.notification.create({
    data: {
      title,
      message,
      isGlobal: false,
      category,
      studentId,
      tenantId,
    },
  });
}

async function sendNotificationToAllTeachers(
  title: string,
  message: string,
  tenantId: string,
  category: Cat
) {
  await prisma.notification.create({
    data: {
      title,
      message,
      isGlobal: true,
      category,
      studentId: null,
      teacherId: null,
      tenantId,
    },
  });
}

async function sendNotificationToSpecificTeacher(
  title: string,
  message: string,
  teacherId: string,
  tenantId: string,
  category: Cat
) {
  await prisma.notification.create({
    data: {
      title,
      message,
      isGlobal: false,
      category,
      teacherId,
      tenantId,
    },
  });
}
