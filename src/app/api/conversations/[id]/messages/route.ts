import { NextResponse } from "next/server";
import { requireSession } from "@/lib/security";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession({ requireTenant: true });
  if ("error" in auth) return auth.error;
  const { session } = auth;
  const { id } = await params;

  // Verify participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: id, userId: session.user.id } },
  });
  if (!participant) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, role: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Mark as read
  await prisma.conversationParticipant.update({
    where: { id: participant.id },
    data: { lastReadAt: new Date() },
  });

  return NextResponse.json({ messages });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSession({ requireTenant: true });
  if ("error" in auth) return auth.error;
  const { session } = auth;
  const { id } = await params;

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: id, userId: session.user.id } },
  });
  if (!participant) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const { body: messageBody } = body as { body?: string };
  if (!messageBody?.trim()) {
    return NextResponse.json({ error: "Message requis" }, { status: 400 });
  }

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId: id,
        senderId: session.user.id,
        body: messageBody.trim(),
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    }),
    prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    }),
    prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { lastReadAt: new Date() },
    }),
  ]);

  return NextResponse.json({ success: true, message }, { status: 201 });
}
