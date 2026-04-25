// app/api/forgot-password/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { resend } from "../../../lib/resend";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    return NextResponse.json(
      { success: false, error: "JWT_SECRET is not configured" },
      { status: 500 }
    );
  }

  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur introuvable." },
        { status: 404 }
      );
    }

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

    const resetLink = `${
      process.env.NODE_ENV === "development"
        ? "https://formwise.fr"
        : "https://formwise.fr"
    }/reset-password?token=${token}`;

    await resend.emails.send({
      from: "Formwise <onboarding@formwise.fr>",
      to: [email],
      subject: "Réinitialisation du mot de passe",
      html: `
        <p>Bonjour,</p>
        <p>Cliquez ici pour réinitialiser votre mot de passe :</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>Ce lien expire dans 1 heure.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Erreur API /forgot-password :", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
