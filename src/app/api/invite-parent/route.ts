import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { resend } from "../../../lib/resend";
import {
  enforceRateLimit,
  enforceSameOrigin,
  requireSession,
} from "../../../lib/security";

const MAX_BATCH = 50;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const csrf = enforceSameOrigin(req);
  if (csrf) return csrf;

  const auth = await requireSession({ roles: ["DIRECTOR", "SUPER_ADMIN"] });
  if ("error" in auth) return auth.error;
  const { session } = auth;

  // Per-user rate limit so the batch-size cap can't be sidestepped by
  // multiple smaller batches in quick succession.
  const rl = enforceRateLimit(
    req,
    { name: "invite-parent", limit: 5, windowMs: 60 * 60 * 1000 },
    session.user.id
  );
  if (rl) return rl;

  const { emails: rawEmails, tenantId } = (await req.json()) as {
    emails?: unknown;
    tenantId?: unknown;
  };

  if (!Array.isArray(rawEmails) || rawEmails.length === 0) {
    return NextResponse.json(
      { error: "Aucune adresse email fournie" },
      { status: 400 }
    );
  }
  if (rawEmails.length > MAX_BATCH) {
    return NextResponse.json(
      { error: `Maximum ${MAX_BATCH} invitations par requête.` },
      { status: 400 }
    );
  }

  // Dedupe + validate per-email shape; reject the whole batch if any are bad.
  const seen = new Set<string>();
  const emails: string[] = [];
  for (const v of rawEmails) {
    if (typeof v !== "string") {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }
    const e = v.trim().toLowerCase();
    if (!EMAIL_RE.test(e) || e.length > 254) {
      return NextResponse.json(
        { error: `Email invalide: ${e.slice(0, 100)}` },
        { status: 400 }
      );
    }
    if (!seen.has(e)) {
      seen.add(e);
      emails.push(e);
    }
  }

  let targetTenantId: string;
  if (session.user.role === "SUPER_ADMIN") {
    if (typeof tenantId !== "string" || !tenantId) {
      return NextResponse.json(
        { error: "tenantId requis pour les SUPER_ADMIN" },
        { status: 400 }
      );
    }
    targetTenantId = tenantId;
  } else {
    if (!session.user.tenantId) {
      return NextResponse.json(
        { error: "Utilisateur sans tenant" },
        { status: 403 }
      );
    }
    targetTenantId = session.user.tenantId;
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: targetTenantId },
    select: { schoolCode: true, name: true },
  });

  if (!tenant?.schoolCode) {
    return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });
  }

  const results = await Promise.allSettled(
    emails.map((email) =>
      resend.emails.send({
        from: "Formwise <onboarding@formwise.fr>",
        to: [email],
        subject: "Invitation à rejoindre Formwise",
        html: `
          <p>Bonjour,</p>
          <p>Vous avez été invité à rejoindre <strong>${tenant.name}</strong> sur Formwise.</p>
          <p>Pour créer votre compte, utilisez ce code établissement :</p>
          <h2>${tenant.schoolCode}</h2>
          <p><a href="https://formwise.fr/register">Cliquez ici pour vous inscrire</a></p>
        `,
      })
    )
  );

  await prisma.invitedParent.createMany({
    data: emails.map((email) => ({ email, tenantId: targetTenantId, used: false })),
    skipDuplicates: true,
  });

  const successCount = results.filter((r) => r.status === "fulfilled").length;
  const failureCount = emails.length - successCount;

  return NextResponse.json({ success: true, successCount, failureCount });
}
