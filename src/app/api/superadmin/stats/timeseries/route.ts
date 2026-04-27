import { prisma } from "../../../../../lib/prisma";
import { authOptions } from "../../../../../lib/authOptions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const tenants = await prisma.tenant.findMany({
    where: { createdAt: { gte: start } },
    select: { createdAt: true, billingPlan: true, subscriptionStatus: true },
  });

  // Build 12 buckets (current month + 11 previous)
  type Bucket = {
    key: string;
    label: string;
    signups: number;
    trial: number;
    monthly: number;
    annual: number;
  };
  const buckets: Bucket[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.push({
      key,
      label: d.toLocaleDateString("en-US", { month: "short" }),
      signups: 0,
      trial: 0,
      monthly: 0,
      annual: 0,
    });
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]));

  for (const t of tenants) {
    const d = t.createdAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = byKey.get(key);
    if (!bucket) continue;
    bucket.signups += 1;
    if (t.billingPlan === "FREE_TRIAL") bucket.trial += 1;
    else if (t.billingPlan === "MONTHLY") bucket.monthly += 1;
    else if (t.billingPlan === "YEARLY") bucket.annual += 1;
  }

  return NextResponse.json({ buckets });
}
