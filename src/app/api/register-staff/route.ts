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
    name: "register-staff",
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (rl) return rl;

  const body = await req.json();
  const { email, password, schoolCode } = body;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof schoolCode !== "string"
  ) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  const pwdCheck = validatePassword(password);
  if (!pwdCheck.ok) {
    return NextResponse.json({ error: pwdCheck.error }, { status: 400 });
  }

  const staff = await prisma.staff.findFirst({
    where: { email, schoolCode, used: false, accepted: false },
    include: { tenant: true },
  });

  if (!staff) {
    return NextResponse.json(
      { error: "Lien invalide ou déjà utilisé." },
      { status: 401 }
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "Un compte existe déjà avec cet email." },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_COST);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: "STAFF",
      firstName: staff.firstName,
      lastName: staff.lastName,
      phone: staff.phone,
      tenantId: staff.tenantId,
    },
  });

  await prisma.staff.update({
    where: { id: staff.id },
    data: {
      accepted: true,
      used: true,
      validatedAt: new Date(),
      userId: user.id,
    },
  });

  return NextResponse.json({ success: true });
}
