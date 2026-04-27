import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/authOptions";
import { prisma } from "../../../../../../lib/prisma";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PARENT" || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tenantId = session.user.tenantId;
  const { id } = await ctx.params;

  const body = await req.json();
  const { notes, documentId } = body as {
    notes?: string;
    documentId?: string | null;
  };
  if (!notes || !notes.trim()) {
    return NextResponse.json({ error: "Notes required" }, { status: 400 });
  }
  if (notes.length > 2000) {
    return NextResponse.json({ error: "Notes too long" }, { status: 400 });
  }

  // Verify the attendance row belongs to one of this parent's children.
  const attendance = await prisma.attendance.findFirst({
    where: {
      id,
      tenantId,
      student: { parent: { email: session.user.email! } },
    },
  });
  if (!attendance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // If documentId is provided, ensure it belongs to the same student.
  if (documentId) {
    const doc = await prisma.document.findFirst({
      where: { id: documentId, studentId: attendance.studentId },
      select: { id: true },
    });
    if (!doc) {
      return NextResponse.json(
        { error: "Document not found for this student" },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.attendance.update({
    where: { id },
    data: {
      justificationNotes: notes,
      justificationDocId: documentId ?? null,
      justifiedByParentId: session.user.id,
      justifiedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, attendance: updated });
}
