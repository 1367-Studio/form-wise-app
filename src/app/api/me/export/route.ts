import { NextResponse } from "next/server";
import { enforceRateLimit, requireSession } from "../../../../lib/security";
import { buildUserExport } from "../../../../lib/gdpr";

export async function GET(req: Request) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const { session } = auth;

  const rl = enforceRateLimit(
    req,
    { name: "gdpr-export", limit: 5, windowMs: 24 * 60 * 60 * 1000 },
    session.user.id
  );
  if (rl) return rl;

  const data = await buildUserExport(
    session.user.id,
    session.user.role as
      | "PARENT"
      | "TEACHER"
      | "DIRECTOR"
      | "SUPER_ADMIN"
      | "STAFF"
  );

  if (!data) {
    return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
  }

  const filename = `formwise-export-${session.user.id}-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
