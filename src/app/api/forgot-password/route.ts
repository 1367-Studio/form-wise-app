import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { resend } from "../../../lib/resend";
import jwt from "jsonwebtoken";
import { enforceRateLimit, enforceSameOrigin } from "../../../lib/security";

export async function POST(req: Request) {
  const csrf = enforceSameOrigin(req);
  if (csrf) return csrf;

  // Per-IP cap (broad) + per-email cap (targeted) to prevent both
  // wide-spray and single-target email bombing.
  const rlIp = enforceRateLimit(req, {
    name: "forgot-password-ip",
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (rlIp) return rlIp;

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    return NextResponse.json(
      { success: false, error: "Service indisponible" },
      { status: 500 }
    );
  }

  try {
    const { email } = (await req.json()) as { email?: unknown };
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: true });
    }

    const rlEmail = enforceRateLimit(
      req,
      { name: "forgot-password-email", limit: 3, windowMs: 60 * 60 * 1000 },
      email
    );
    if (rlEmail) return rlEmail;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, tokenVersion: true },
    });

    // Only send the email if the user exists, but always return the same response.
    if (user) {
      const token = jwt.sign(
        { sub: user.id, email: user.email, tv: user.tokenVersion },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      const resetLink = `https://formwise.fr/reset-password?token=${token}`;

      await resend.emails.send({
        from: "Formwise <onboarding@formwise.fr>",
        to: [user.email],
        subject: "Réinitialisation du mot de passe",
        html: `
          <p>Bonjour,</p>
          <p>Cliquez ici pour réinitialiser votre mot de passe :</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>Ce lien expire dans 1 heure.</p>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API /forgot-password");
    void error;
    // Still return generic success to avoid leaking error states.
    return NextResponse.json({ success: true });
  }
}
