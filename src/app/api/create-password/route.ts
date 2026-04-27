import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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
    name: "create-password",
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (rl) return rl;

  try {
    const { token, password, classId, subjectId } = await req.json();
    if (typeof token !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Champs requis manquants" },
        { status: 400 }
      );
    }

    const pwdCheck = validatePassword(password);
    if (!pwdCheck.ok) {
      return NextResponse.json(
        { success: false, error: pwdCheck.error },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { inviteToken: token },
    });

    if (!user || user.role !== "TEACHER") {
      return NextResponse.json(
        { success: false, error: "Lien invalide ou expiré" },
        { status: 400 }
      );
    }

    if (user.password) {
      return NextResponse.json(
        { success: false, error: "Un compte existe déjà avec cet email" },
        { status: 400 }
      );
    }

    try {
      const existingTeacher = await prisma.teacher.findUnique({
        where: { userId: user.id },
        select: { id: true, classId: true, subjectId: true },
      });
      if (existingTeacher) {
        await prisma.teacher.update({
          where: { id: existingTeacher.id },
          data: {
            classId: existingTeacher.classId ?? classId ?? null,
            subjectId: existingTeacher.subjectId ?? subjectId ?? null,
          },
        });
      } else {
        await prisma.teacher.create({
          data: {
            userId: user.id,
            classId: classId,
            subjectId: subjectId,
            tenantId: user.tenantId!,
          },
        });
      }
    } catch (err) {
      console.error("Erreur lors de la création du teacher");
      void err;
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_COST);

    // Atomic claim of the invite token. Bumping tokenVersion invalidates
    // any pre-existing JWT (defense in depth) and the inviteToken=null
    // makes this single-use.
    const result = await prisma.user.updateMany({
      where: { id: user.id, inviteToken: token },
      data: {
        password: hashedPassword,
        inviteToken: null,
        tokenVersion: { increment: 1 },
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: "Lien déjà utilisé" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erreur dans /api/create-password");
    void err;
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
