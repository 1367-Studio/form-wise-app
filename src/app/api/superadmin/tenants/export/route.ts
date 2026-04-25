import { prisma } from "../../../../../lib/prisma";
import { authOptions } from "../../../../../lib/authOptions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

function csvEscape(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: {
        where: { role: "DIRECTOR" },
        select: { firstName: true, lastName: true, email: true, phone: true },
      },
      _count: {
        select: { students: true, teachers: true, classes: true },
      },
    },
  });

  const headers = [
    "school_code",
    "name",
    "billing_plan",
    "subscription_status",
    "created_at",
    "director_name",
    "director_email",
    "director_phone",
    "students",
    "teachers",
    "classes",
  ];

  const rows = tenants.map((t) => {
    const dir = t.users[0];
    return [
      t.schoolCode,
      t.name,
      t.billingPlan,
      t.subscriptionStatus ?? "",
      t.createdAt.toISOString(),
      dir ? `${dir.firstName} ${dir.lastName}` : "",
      dir?.email ?? "",
      dir?.phone ?? "",
      t._count.students,
      t._count.teachers,
      t._count.classes,
    ]
      .map(csvEscape)
      .join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");
  const filename = `formwise-tenants-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
