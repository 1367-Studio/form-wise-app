import { prisma } from "../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "../../../lib/security";

export async function GET(req: NextRequest) {
  const rl = enforceRateLimit(req, {
    name: "check-invite",
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (rl) return rl;

  const email = req.nextUrl.searchParams.get("email");
  const code = req.nextUrl.searchParams.get("schoolCode");

  if (!email || !code) {
    return NextResponse.json({ valid: false });
  }

  const staff = await prisma.staff.findFirst({
    where: { email, schoolCode: code, accepted: false },
    select: { id: true },
  });

  return NextResponse.json({ valid: !!staff });
}
