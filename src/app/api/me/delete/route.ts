import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  enforceSameOrigin,
  requireSession,
} from "../../../../lib/security";
import {
  eraseParent,
  eraseStaff,
  eraseTeacher,
} from "../../../../lib/gdpr";

const REQUIRED_PHRASE = "DELETE_MY_ACCOUNT";

export async function POST(req: Request) {
  const csrf = enforceSameOrigin(req);
  if (csrf) return csrf;

  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const { session } = auth;

  const rl = enforceRateLimit(
    req,
    { name: "gdpr-delete", limit: 3, windowMs: 24 * 60 * 60 * 1000 },
    session.user.id
  );
  if (rl) return rl;

  let body: { confirm?: unknown };
  try {
    body = (await req.json()) as { confirm?: unknown };
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  if (body.confirm !== REQUIRED_PHRASE) {
    return NextResponse.json(
      {
        error:
          "Confirmation manquante. Envoyez { confirm: \"DELETE_MY_ACCOUNT\" } pour confirmer la suppression.",
      },
      { status: 400 }
    );
  }

  const role = session.user.role;
  try {
    if (role === "PARENT") {
      await eraseParent(session.user.id);
    } else if (role === "TEACHER") {
      await eraseTeacher(session.user.id);
    } else if (role === "STAFF") {
      await eraseStaff(session.user.id);
    } else {
      // DIRECTOR / SUPER_ADMIN: self-erasure refused. Removing a Director
      // affects the school's continuity (sole admin, billing) and removing
      // a SUPER_ADMIN is a platform-level decision. Route via support.
      return NextResponse.json(
        {
          error:
            "La suppression d'un compte administrateur doit être faite par le support.",
        },
        { status: 403 }
      );
    }
  } catch (err) {
    console.error("GDPR erasure failed");
    void err;
    return NextResponse.json(
      { error: "Suppression impossible" },
      { status: 500 }
    );
  }

  // The session JWT is invalidated by the tokenVersion bump in the erasure
  // transaction; the next request from this client will be treated as
  // unauthenticated.
  return NextResponse.json({ success: true });
}
