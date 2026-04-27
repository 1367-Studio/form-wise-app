import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/authOptions";
import { prisma } from "../../../../../lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tenantId = session.user.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "Missing tenant" }, { status: 400 });
  }

  const { journalId } = await req.json();
  if (!journalId) {
    return NextResponse.json({ error: "Missing journalId" }, { status: 400 });
  }

  // Confirm parent has a child in this entry's class before marking read.
  const journal = await prisma.dailyJournal.findFirst({
    where: { id: journalId, tenantId },
    select: { id: true, classId: true },
  });
  if (!journal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const hasChildInClass = await prisma.student.findFirst({
    where: {
      tenantId,
      parent: { email: session.user.email! },
      classId: journal.classId,
    },
    select: { id: true },
  });
  if (!hasChildInClass) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.journalRead.upsert({
    where: {
      journalId_parentId: { journalId, parentId: session.user.id },
    },
    create: { journalId, parentId: session.user.id },
    update: { readAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
