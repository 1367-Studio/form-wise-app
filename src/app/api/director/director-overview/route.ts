import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireSession } from "../../../../lib/security";

export async function GET() {
  const auth = await requireSession({
    roles: ["DIRECTOR", "SUPER_ADMIN"],
    requireTenant: true,
  });
  if ("error" in auth) return auth.error;
  const { session } = auth;

  const tenantId = session.user.tenantId as string;

  // Start / end of today (server-local time)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  // Start / end of current month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // 30 days from now (contracts expiring soon)
  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);

  try {
    const [
      activeStudents,
      pendingInscriptions,
      totalStaff,
      totalTeachers,
      revenueResult,
      overdueCount,
      overdueAmountResult,
      attendanceByStatus,
      contractsExpiringSoon,
      recentNotifications,
      upcomingEvents,
    ] = await Promise.all([
      // 1. Student stats
      prisma.student.count({
        where: { tenantId, status: "ACCEPTED" },
      }),
      prisma.student.count({
        where: { tenantId, status: "PENDING" },
      }),

      // 2. Staff stats
      prisma.staff.count({
        where: { tenantId },
      }),
      prisma.teacher.count({
        where: { tenantId },
      }),

      // 3. Finance stats (this month)
      prisma.payment.aggregate({
        where: {
          tenantId,
          paidAt: { gte: monthStart, lt: monthEnd },
        },
        _sum: { amount: true },
      }),
      prisma.invoice.count({
        where: { tenantId, status: "OVERDUE" },
      }),
      prisma.invoice.aggregate({
        where: { tenantId, status: "OVERDUE" },
        _sum: { amount: true },
      }),

      // 4. Attendance today
      prisma.attendance.groupBy({
        by: ["status"],
        where: {
          tenantId,
          date: { gte: todayStart, lt: todayEnd },
        },
        _count: { status: true },
      }),

      // 5. Contracts expiring soon
      prisma.staffContract.count({
        where: {
          tenantId,
          status: "ACTIVE",
          endDate: { gte: now, lte: in30Days },
        },
      }),

      // 6. Recent notifications (last 5)
      prisma.notification.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          message: true,
          createdAt: true,
          isGlobal: true,
        },
      }),

      // 7. Upcoming events (next 3)
      prisma.schoolEvent.findMany({
        where: {
          tenantId,
          startDate: { gte: now },
        },
        orderBy: { startDate: "asc" },
        take: 3,
        select: {
          id: true,
          title: true,
          startDate: true,
          type: true,
        },
      }),
    ]);

    // Build attendance map from groupBy result
    const attendanceMap: Record<string, number> = {};
    for (const row of attendanceByStatus) {
      attendanceMap[row.status] = row._count.status;
    }

    return NextResponse.json({
      students: {
        active: activeStudents,
        pending: pendingInscriptions,
      },
      staff: {
        total: totalStaff,
        teachers: totalTeachers,
      },
      finance: {
        revenueThisMonth: revenueResult._sum.amount ?? 0,
        overdueCount,
        overdueAmount: overdueAmountResult._sum.amount ?? 0,
      },
      attendance: {
        present: attendanceMap["PRESENT"] ?? 0,
        absent: attendanceMap["ABSENT"] ?? 0,
        late: attendanceMap["LATE"] ?? 0,
        excused: attendanceMap["EXCUSED"] ?? 0,
      },
      contractsExpiringSoon,
      recentNotifications,
      upcomingEvents,
    });
  } catch (error) {
    console.error("Erreur API /director/director-overview:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
