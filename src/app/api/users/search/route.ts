import { NextResponse } from "next/server";
import { requireSession } from "@/lib/security";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = await requireSession({ requireTenant: true });
  if ("error" in auth) return auth.error;
  const { session } = auth;
  const tenantId = session.user.tenantId as string;

  // Only directors can search all tenant users
  if (session.user.role !== "DIRECTOR" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json([]);
  }

  const users = await prisma.user.findMany({
    where: {
      tenantId,
      id: { not: session.user.id },
      OR: [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
    },
    take: 20,
    orderBy: { firstName: "asc" },
  });

  return NextResponse.json(users);
}
