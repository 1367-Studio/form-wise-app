import { prisma } from "../../../../lib/prisma";
import { authOptions } from "../../../../lib/authOptions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type ActivityEvent = {
  id: string;
  type:
    | "tenant_signup"
    | "preregistration_submitted"
    | "subscription_active"
    | "user_joined";
  at: string;
  title: string;
  subtitle?: string;
  tenantId?: string;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const [recentTenants, recentPrereg, recentUsers] = await Promise.all([
    prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        schoolCode: true,
        createdAt: true,
        subscriptionStatus: true,
        billingPlan: true,
      },
    }),
    prisma.preRegistrationParent.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        tenantId: true,
        tenant: { select: { name: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: { in: ["DIRECTOR", "TEACHER", "PARENT", "STAFF"] } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        tenantId: true,
        tenant: { select: { name: true } },
      },
    }),
  ]);

  const events: ActivityEvent[] = [];

  for (const t of recentTenants) {
    events.push({
      id: `tenant:${t.id}`,
      type:
        t.subscriptionStatus === "ACTIVE"
          ? "subscription_active"
          : "tenant_signup",
      at: t.createdAt.toISOString(),
      title: t.name,
      subtitle: t.schoolCode,
      tenantId: t.id,
    });
  }

  for (const p of recentPrereg) {
    events.push({
      id: `prereg:${p.id}`,
      type: "preregistration_submitted",
      at: p.createdAt.toISOString(),
      title: `${p.firstName} ${p.lastName}`,
      subtitle: p.tenant?.name,
      tenantId: p.tenantId ?? undefined,
    });
  }

  for (const u of recentUsers) {
    events.push({
      id: `user:${u.id}`,
      type: "user_joined",
      at: u.createdAt.toISOString(),
      title: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.role,
      subtitle: `${u.role} · ${u.tenant?.name ?? ""}`,
      tenantId: u.tenantId ?? undefined,
    });
  }

  events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return NextResponse.json({ events: events.slice(0, 15) });
}
