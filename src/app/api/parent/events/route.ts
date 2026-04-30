import { NextResponse } from "next/server";
import { requireSession } from "../../../../lib/security";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
  const auth = await requireSession({ roles: ["PARENT"], requireTenant: true });
  if ("error" in auth) return auth.error;
  const tenantId = auth.session.user.tenantId as string;

  const url = new URL(req.url);
  const now = new Date();
  const from = url.searchParams.get("from") ? new Date(url.searchParams.get("from")!) : now;
  const to = url.searchParams.get("to")
    ? new Date(url.searchParams.get("to")!)
    : new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  const events = await prisma.schoolEvent.findMany({
    where: {
      tenantId,
      startDate: { lte: to },
      endDate: { gte: from },
    },
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json({ events, total: events.length });
}
