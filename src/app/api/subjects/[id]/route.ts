import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import { prisma } from "../../../../lib/prisma";

async function ownSubject(id: string, tenantId: string) {
  return prisma.subject.findFirst({ where: { id, tenantId } });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "DIRECTOR" || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const subject = await ownSubject(id, session.user.tenantId);
  if (!subject) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { name } = body as { name?: string };
  if (!name || !name.trim() || name.length > 100) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

  const updated = await prisma.subject.update({
    where: { id },
    data: { name: name.trim() },
  });
  return NextResponse.json({ success: true, subject: updated });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "DIRECTOR" || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const subject = await ownSubject(id, session.user.tenantId);
  if (!subject) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Detach teachers (FK is optional on Teacher.subjectId) before delete to avoid constraint errors.
  await prisma.teacher.updateMany({
    where: { subjectId: id, tenantId: session.user.tenantId },
    data: { subjectId: null },
  });
  await prisma.subject.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
