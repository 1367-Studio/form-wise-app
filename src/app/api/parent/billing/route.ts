import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = session.user.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "Missing tenant" }, { status: 400 });
  }

  const [parent, students, activeYear] = await Promise.all([
    prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { iban: true, bic: true, bankName: true },
    }),
    prisma.student.findMany({
      where: { parent: { email: session.user.email! }, tenantId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        status: true,
        class: { select: { id: true, name: true, monthlyFee: true } },
      },
    }),
    prisma.schoolYear.findFirst({
      where: { tenantId },
      orderBy: { startDate: "desc" },
      select: { id: true, name: true, startDate: true, endDate: true },
    }),
  ]);

  const monthlyTotal = students.reduce(
    (sum, s) => sum + (s.class?.monthlyFee ?? 0),
    0
  );

  let totalMonths: number | null = null;
  let elapsedMonths: number | null = null;
  let remainingMonths: number | null = null;
  if (activeYear) {
    const start = activeYear.startDate.getTime();
    const end = activeYear.endDate.getTime();
    const now = Date.now();
    const monthMs = (1000 * 60 * 60 * 24 * 365.25) / 12;
    totalMonths = Math.max(1, Math.round((end - start) / monthMs));
    elapsedMonths = Math.max(
      0,
      Math.min(totalMonths, Math.round((now - start) / monthMs))
    );
    remainingMonths = Math.max(0, totalMonths - elapsedMonths);
  }

  const annualEstimate =
    totalMonths !== null ? monthlyTotal * totalMonths : monthlyTotal * 10;

  const remainingEstimate =
    remainingMonths !== null
      ? monthlyTotal * remainingMonths
      : null;

  const ribComplete = !!(parent?.iban && parent?.bic && parent?.bankName);

  return NextResponse.json({
    monthlyTotal,
    annualEstimate,
    remainingEstimate,
    ribComplete,
    rib: ribComplete
      ? {
          bankName: parent!.bankName,
          ibanLast4: parent!.iban!.replace(/\s/g, "").slice(-4),
        }
      : null,
    schoolYear: activeYear
      ? {
          name: activeYear.name,
          startDate: activeYear.startDate.toISOString(),
          endDate: activeYear.endDate.toISOString(),
          totalMonths,
          elapsedMonths,
          remainingMonths,
        }
      : null,
    children: students.map((s) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      status: s.status,
      className: s.class?.name ?? null,
      monthlyFee: s.class?.monthlyFee ?? 0,
    })),
  });
}
