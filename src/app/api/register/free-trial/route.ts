import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import { sendEmailWithTempPassword } from "../../../../lib/email";
import { addDays } from "date-fns";
import { generateSchoolCode } from "../../../../lib/generateSchoolCode";
import { generateRandomPassword } from "../../../../lib/password-utils";
import {
  enforceRateLimit,
  enforceSameOrigin,
  BCRYPT_COST,
} from "../../../../lib/security";

export async function POST(req: Request) {
  const csrf = enforceSameOrigin(req);
  if (csrf) return csrf;

  const rl = enforceRateLimit(req, {
    name: "free-trial",
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (rl) return rl;

  try {
    const body = await req.json();
    const { firstName, lastName, schoolName, phone, address, email } = body;

    if (
      typeof email !== "string" ||
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof schoolName !== "string"
    ) {
      return NextResponse.json(
        { error: "Champs requis manquants." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email." },
        { status: 409 }
      );
    }

    const trialEndsAt = addDays(new Date(), 20);
    const tempPassword = generateRandomPassword(16);
    const hashedPassword = await bcrypt.hash(tempPassword, BCRYPT_COST);

    let schoolCode = generateSchoolCode(schoolName);
    let existingCode = await prisma.tenant.findUnique({
      where: { schoolCode },
    });
    while (existingCode) {
      schoolCode = generateSchoolCode(schoolName);
      existingCode = await prisma.tenant.findUnique({ where: { schoolCode } });
    }

    const tenant = await prisma.tenant.create({
      data: {
        name: schoolName,
        phone,
        address,
        status: "TRIAL",
        trialEndsAt,
        schoolCode,
      },
    });

    await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role: "DIRECTOR",
        tenantId: tenant.id,
        phone,
      },
    });

    await sendEmailWithTempPassword({
      to: email,
      name: firstName,
      password: tempPassword,
    });

    return NextResponse.json({ success: true, tenantId: tenant.id });
  } catch (error) {
    console.error("Erreur création free trial");
    void error;
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
