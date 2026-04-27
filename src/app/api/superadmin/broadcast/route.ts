import { authOptions } from "../../../../lib/authOptions";
import { prisma } from "../../../../lib/prisma";
import { resend } from "../../../../lib/resend";
import { writeAudit } from "../../../../lib/audit";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";

type Audience = "directors" | "all";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { subject, html, audience } = (await req.json()) as {
    subject?: string;
    html?: string;
    audience?: Audience;
  };

  if (!subject || !html) {
    return NextResponse.json(
      { error: "subject and html are required" },
      { status: 400 }
    );
  }

  const where =
    audience === "all"
      ? { role: { in: ["DIRECTOR", "TEACHER", "PARENT", "STAFF"] as Role[] } }
      : { role: "DIRECTOR" as const };

  const recipients = await prisma.user.findMany({
    where,
    select: { email: true },
  });

  const emails = recipients.map((r) => r.email).filter(Boolean);
  if (emails.length === 0) {
    return NextResponse.json({ error: "No recipients" }, { status: 400 });
  }

  // Resend supports up to 50 addresses per send call; chunk to be safe.
  const chunks: string[][] = [];
  const CHUNK = 50;
  for (let i = 0; i < emails.length; i += CHUNK) {
    chunks.push(emails.slice(i, i + CHUNK));
  }

  let sent = 0;
  let failed = 0;
  for (const chunk of chunks) {
    try {
      await resend.emails.send({
        from: "Formwise <onboarding@formwise.fr>",
        to: chunk,
        subject,
        html,
      });
      sent += chunk.length;
    } catch (error) {
      console.error("Broadcast send error:", error);
      failed += chunk.length;
    }
  }

  await writeAudit({
    actorUserId: session.user.id ?? null,
    actorEmail: session.user.email ?? null,
    actorRole: session.user.role,
    action: "broadcast.sent",
    targetType: "audience",
    targetId: audience ?? "directors",
    metadata: {
      subject,
      audience: audience ?? "directors",
      totalRecipients: emails.length,
      sent,
      failed,
    },
  });

  return NextResponse.json({
    success: true,
    totalRecipients: emails.length,
    sent,
    failed,
  });
}
