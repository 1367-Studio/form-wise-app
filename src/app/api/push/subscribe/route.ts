import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import {
  enforceRateLimit,
  enforceSameOrigin,
  requireSession,
} from "../../../../lib/security";

export async function POST(req: Request) {
  const csrf = enforceSameOrigin(req);
  if (csrf) return csrf;

  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const { session } = auth;

  const rl = enforceRateLimit(
    req,
    { name: "push-subscribe", limit: 30, windowMs: 60 * 60 * 1000 },
    session.user.id
  );
  if (rl) return rl;

  const body = (await req.json().catch(() => null)) as
    | {
        endpoint?: unknown;
        keys?: { p256dh?: unknown; auth?: unknown };
      }
    | null;

  if (
    !body ||
    typeof body.endpoint !== "string" ||
    !body.keys ||
    typeof body.keys.p256dh !== "string" ||
    typeof body.keys.auth !== "string"
  ) {
    return NextResponse.json(
      { error: "Subscription invalide" },
      { status: 400 }
    );
  }

  // Idempotent upsert keyed by the unique endpoint. If the user re-subscribes
  // (or the same browser is shared by another account), the latest userId
  // wins so notifications go to the currently-logged-in user.
  await prisma.pushSubscription.upsert({
    where: { endpoint: body.endpoint },
    create: {
      userId: session.user.id,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      userAgent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
    },
    update: {
      userId: session.user.id,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      userAgent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
    },
  });

  return NextResponse.json({ success: true });
}
