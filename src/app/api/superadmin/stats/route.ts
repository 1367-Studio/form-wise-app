import { prisma } from "../../../../lib/prisma";
import { authOptions } from "../../../../lib/authOptions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    tenantsTotal,
    tenantsActive,
    tenantsTrial,
    tenantsExpired,
    usersByRole,
    studentsTotal,
    signupsThisMonth,
    signupsLastMonth,
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { subscriptionStatus: "ACTIVE" } }),
    prisma.tenant.count({ where: { subscriptionStatus: "FREE_TRIAL" } }),
    prisma.tenant.count({ where: { subscriptionStatus: "EXPIRED" } }),
    prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    }),
    prisma.student.count(),
    prisma.tenant.count({ where: { createdAt: { gte: firstOfThisMonth } } }),
    prisma.tenant.count({
      where: {
        createdAt: { gte: firstOfLastMonth, lt: firstOfThisMonth },
      },
    }),
  ]);

  const roleCounts = usersByRole.reduce<Record<string, number>>((acc, row) => {
    acc[row.role] = row._count._all;
    return acc;
  }, {});

  const usersTotal = Object.values(roleCounts).reduce((a, b) => a + b, 0);
  const delta =
    signupsLastMonth === 0
      ? null
      : Math.round(
          ((signupsThisMonth - signupsLastMonth) / signupsLastMonth) * 100
        );

  return NextResponse.json({
    tenants: {
      total: tenantsTotal,
      active: tenantsActive,
      trial: tenantsTrial,
      expired: tenantsExpired,
    },
    users: {
      total: usersTotal,
      parents: roleCounts.PARENT ?? 0,
      teachers: roleCounts.TEACHER ?? 0,
      directors: roleCounts.DIRECTOR ?? 0,
      staff: roleCounts.STAFF ?? 0,
      admins: roleCounts.SUPER_ADMIN ?? 0,
    },
    students: { total: studentsTotal },
    signups: {
      thisMonth: signupsThisMonth,
      lastMonth: signupsLastMonth,
      delta,
    },
  });
}
