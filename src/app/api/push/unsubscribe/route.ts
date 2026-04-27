import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { enforceSameOrigin, requireSession } from "../../../../lib/security";

export async function POST(req: Request) {
  const csrf = enforceSameOrigin(req);
  if (csrf) return csrf;

  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const { session } = auth;

  const body = (await req.json().catch(() => null)) as {
    endpoint?: unknown;
  } | null;

  if (!body || typeof body.endpoint !== "string") {
    return NextResponse.json({ error: "Endpoint manquant" }, { status: 400 });
  }

  // Only delete a subscription owned by this user — prevents one user
  // from removing another's subscription if they happened to know an
  // endpoint string.
  await prisma.pushSubscription.deleteMany({
    where: { endpoint: body.endpoint, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
