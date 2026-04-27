import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import { resend } from "../../../lib/resend";
import {
  enforceRateLimit,
  enforceSameOrigin,
  validatePassword,
  BCRYPT_COST,
} from "../../../lib/security";

export async function POST(req: Request) {
  const csrf = enforceSameOrigin(req);
  if (csrf) return csrf;

  const rl = enforceRateLimit(req, {
    name: "register",
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (rl) return rl;

  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phone, civility, schoolCode } = body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof firstName !== "string" ||
      !firstName.trim() ||
      typeof lastName !== "string" ||
      !lastName.trim() ||
      typeof phone !== "string" ||
      !phone.trim() ||
      typeof schoolCode !== "string" ||
      !schoolCode.trim()
    ) {
      return NextResponse.json(
        { success: false, error: "Champs requis manquants" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Email invalide" },
        { status: 400 }
      );
    }

    const pwdCheck = validatePassword(password);
    if (!pwdCheck.ok) {
      return NextResponse.json({ success: false, error: pwdCheck.error }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { schoolCode: schoolCode.trim() },
    });

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: "Code de l’école invalide." },
        { status: 404 }
      );
    }

    const invited = await prisma.invitedParent.findFirst({
      where: { email, tenantId: tenant.id, used: false },
    });

    if (!invited) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Aucune invitation valide trouvée pour cet email et cette école.",
        },
        { status: 401 }
      );
    }

    // Check existence after invite check so the unauthenticated path can't
    // enumerate registered emails on this school.
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Cet email est déjà utilisé." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_COST);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: "PARENT",
        civility,
        tenantId: tenant.id,
      },
    });

    await prisma.invitedParent.update({
      where: { id: invited.id },
      data: { used: true, firstName },
    });

    await resend.emails.send({
      from: "Formwise <onboarding@formwise.fr>",
      to: [email],
      subject: "Bienvenue sur Formwise !",
      html: `
        <p>Bonjour ${firstName},</p>
        <p>Votre compte a été créé avec succès.</p>
        <p><a href="https://formwise.fr/login?email=${encodeURIComponent(email)}">Cliquez ici pour vous connecter</a></p>
        <p>À bientôt !</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur dans /api/register");
    void error;
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
