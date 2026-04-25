import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      civility: true,
      address: true,
      role: true,
      createdAt: true,
      tenant: {
        select: { id: true, name: true, schoolCode: true },
      },
      students: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          birthDate: true,
          address: true,
          createdAt: true,
        },
      },
      teacher: {
        select: {
          id: true,
          subject: { select: { name: true } },
          class: { select: { name: true } },
        },
      },
      NotificationRead: {
        select: { notificationId: true, readAt: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    user: {
      ...user,
      // Strip db ids that are noise to the user — keep only meaningful ones
    },
  };

  const filename = `formwise-export-${user.email}-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
