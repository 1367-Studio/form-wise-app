import { NextResponse } from "next/server";
import { requireSession } from "@/lib/security";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// GET /api/director/finance-overview — Aggregated finance stats
// ---------------------------------------------------------------------------

export async function GET() {
  const auth = await requireSession({
    roles: ["DIRECTOR", "SUPER_ADMIN"],
    requireTenant: true,
  });
  if ("error" in auth) return auth.error;
  const { session } = auth;

  const tenantId = session.user.tenantId as string;

  try {
    // Current month boundaries
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Run all aggregations in parallel
    const [
      revenueThisMonthAgg,
      outstandingAgg,
      overdueAgg,
      totalInvoiceCount,
      paidInvoiceCount,
      pendingInvoiceCount,
      overdueInvoiceCount,
      recentTransactions,
    ] = await Promise.all([
      // Sum of payments this month
      prisma.payment.aggregate({
        where: {
          tenantId,
          paidAt: { gte: monthStart, lt: monthEnd },
        },
        _sum: { amount: true },
      }),

      // Sum of PENDING + OVERDUE invoices
      prisma.invoice.aggregate({
        where: {
          tenantId,
          status: { in: ["PENDING", "OVERDUE"] },
        },
        _sum: { amount: true },
      }),

      // Sum of OVERDUE invoices only
      prisma.invoice.aggregate({
        where: {
          tenantId,
          status: "OVERDUE",
        },
        _sum: { amount: true },
      }),

      // Invoice counts
      prisma.invoice.count({ where: { tenantId } }),
      prisma.invoice.count({ where: { tenantId, status: "PAID" } }),
      prisma.invoice.count({ where: { tenantId, status: "PENDING" } }),
      prisma.invoice.count({ where: { tenantId, status: "OVERDUE" } }),

      // Last 5 payments with student name
      prisma.payment.findMany({
        where: { tenantId },
        orderBy: { paidAt: "desc" },
        take: 5,
        select: {
          id: true,
          amount: true,
          method: true,
          paidAt: true,
          reference: true,
          invoice: {
            select: {
              id: true,
              number: true,
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const revenueThisMonth = revenueThisMonthAgg._sum.amount ?? 0;
    const outstandingAmount = outstandingAgg._sum.amount ?? 0;
    const overdueAmount = overdueAgg._sum.amount ?? 0;
    const paymentRate =
      totalInvoiceCount > 0
        ? Math.round((paidInvoiceCount / totalInvoiceCount) * 10000) / 100
        : 0;

    return NextResponse.json({
      stats: {
        revenueThisMonth,
        outstandingAmount,
        overdueAmount,
        paymentRate,
      },
      recentTransactions,
      invoiceCounts: {
        total: totalInvoiceCount,
        paid: paidInvoiceCount,
        pending: pendingInvoiceCount,
        overdue: overdueInvoiceCount,
      },
    });
  } catch (error) {
    console.error("Erreur finance overview :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
