import { NextResponse } from "next/server";
import { requireSession } from "@/lib/security";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireSession({ requireTenant: true });
  if ("error" in auth) return auth.error;
  const { session } = auth;
  const userId = session.user.id;
  const tenantId = session.user.tenantId as string;

  const conversations = await prisma.conversation.findMany({
    where: {
      tenantId,
      participants: { some: { userId } },
    },
    include: {
      student: { select: { firstName: true, lastName: true } },
      participants: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, role: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          sender: { select: { firstName: true, lastName: true } },
        },
      },
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const result = conversations.map((c) => {
    const myParticipant = c.participants.find((p) => p.userId === userId);
    const lastReadAt = myParticipant?.lastReadAt ?? new Date(0);
    const lastMessage = c.messages[0] ?? null;
    const unreadCount = lastMessage && lastMessage.createdAt > lastReadAt ? 1 : 0;

    return {
      id: c.id,
      subject: c.subject,
      student: c.student,
      participants: c.participants.map((p) => ({
        userId: p.user.id,
        firstName: p.user.firstName,
        lastName: p.user.lastName,
        role: p.user.role,
      })),
      lastMessage: lastMessage
        ? {
            body: lastMessage.body,
            senderName: `${lastMessage.sender.firstName} ${lastMessage.sender.lastName}`,
            createdAt: lastMessage.createdAt,
          }
        : null,
      totalMessages: c._count.messages,
      unreadCount,
      updatedAt: c.updatedAt,
    };
  });

  return NextResponse.json({ conversations: result });
}

export async function POST(req: Request) {
  const auth = await requireSession({ requireTenant: true });
  if ("error" in auth) return auth.error;
  const { session } = auth;
  const tenantId = session.user.tenantId as string;
  const userId = session.user.id;

  const body = await req.json();
  const { subject, participantIds, studentId } = body as {
    subject?: string;
    participantIds?: string[];
    studentId?: string;
  };

  if (!subject?.trim() || !participantIds?.length) {
    return NextResponse.json({ error: "Sujet et participants requis" }, { status: 400 });
  }

  // Ensure all participants are in the same tenant
  const users = await prisma.user.findMany({
    where: { id: { in: participantIds }, tenantId },
    select: { id: true },
  });
  if (users.length !== participantIds.length) {
    return NextResponse.json({ error: "Participants invalides" }, { status: 400 });
  }

  const allParticipantIds = [...new Set([userId, ...participantIds])];

  const conversation = await prisma.conversation.create({
    data: {
      tenantId,
      subject: subject.trim(),
      studentId: studentId || null,
      participants: {
        create: allParticipantIds.map((uid) => ({
          userId: uid,
          lastReadAt: uid === userId ? new Date() : null,
        })),
      },
    },
    include: {
      participants: {
        include: { user: { select: { firstName: true, lastName: true, role: true } } },
      },
    },
  });

  return NextResponse.json({ success: true, conversation }, { status: 201 });
}
