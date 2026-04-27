import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { resend } from "../../../lib/resend";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user || user.role !== "DIRECTOR") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { email, firstName, lastName, phone, classId, subjectId } =
    await req.json();

  if (!email || !firstName || !lastName || !phone) {
    return NextResponse.json(
      { error: "Champs requis manquants" },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Utilisateur déjà existant" },
      { status: 400 }
    );
  }

  // Validate optional class / subject belong to the inviting director's tenant.
  let validClassId: string | null = null;
  if (classId) {
    const cls = await prisma.class.findFirst({
      where: { id: classId, tenantId: user.tenantId! },
      select: { id: true },
    });
    if (!cls) {
      return NextResponse.json(
        { error: "Classe introuvable dans votre établissement" },
        { status: 400 }
      );
    }
    validClassId = cls.id;
  }
  let validSubjectId: string | null = null;
  if (subjectId) {
    const subj = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        tenantId: user.tenantId!,
        ...(validClassId ? { classId: validClassId } : {}),
      },
      select: { id: true },
    });
    if (!subj) {
      return NextResponse.json(
        { error: "Matière introuvable ou non rattachée à cette classe" },
        { status: 400 }
      );
    }
    validSubjectId = subj.id;
  }

  const inviteToken = nanoid();

  let createdUserId: string;
  try {
    const created = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        phone,
        password: null,
        role: "TEACHER",
        inviteToken,
        tenantId: user.tenantId,
      },
      select: { id: true },
    });
    createdUserId = created.id;
  } catch (err) {
    console.error("❌ Erreur création user :", err);
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }

  // Pre-create the Teacher row so the teacher lands in a working state on first login.
  if (validClassId || validSubjectId) {
    try {
      await prisma.teacher.create({
        data: {
          userId: createdUserId,
          tenantId: user.tenantId!,
          classId: validClassId,
          subjectId: validSubjectId,
        },
      });
    } catch (err) {
      console.error("Pre-create Teacher row failed:", err);
      // Non-fatal — the teacher can still complete via create-password flow.
    }
  }

  await resend.emails.send({
    from: "Formwise <onboarding@formwise.fr>",
    to: [email],
    subject: "Invitation à rejoindre Formwise",
    html: `
      <p>Bonjour ${firstName},</p>
      <p>Vous avez été invité à rejoindre Formwise en tant que professeur.</p>
      <p><a href="https://formwise.fr/create-password?token=${inviteToken}">Cliquez ici pour activer votre compte</a></p>
    `,
  });

  return NextResponse.json({ success: true });
}
