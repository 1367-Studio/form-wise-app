import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import { prisma } from "../../../../lib/prisma";
import { writeAudit } from "../../../../lib/audit";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.update({
    where: { email: session.user.email! },
    data: { tokenVersion: { increment: 1 } },
    select: { id: true, email: true, role: true, tokenVersion: true },
  });

  await writeAudit({
    actorUserId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: "auth.signed_out_everywhere",
    targetType: "user",
    targetId: user.id,
    metadata: { newTokenVersion: user.tokenVersion },
  });

  return NextResponse.json({ success: true });
}
