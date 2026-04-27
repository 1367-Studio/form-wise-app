import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { enforceRateLimit } from "../../../lib/security";

export async function GET(req: Request) {
  const rl = enforceRateLimit(req, {
    name: "check-code",
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (rl) return rl;

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code || !code.trim()) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { schoolCode: code.trim() },
    select: { name: true },
  });

  if (!tenant) {
    // Same response shape and status as the success path so an attacker
    // cannot enumerate school codes by status code or response timing.
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({ valid: true, name: tenant.name });
}
