// app/api/superadmin/tenants/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { sendEmailWithTempPassword } from "../../../../lib/email";
import { addDays } from "date-fns";
import { generateSchoolCode } from "../../../../lib/generateSchoolCode";
import { isSIRET } from "vat-siren-siret";

const schema = z.object({
  firstName: z.string().min(3, { message: "Le prénom est requis." }),
  lastName: z.string().min(3, { message: "Le nom est requis." }),
  schoolName: z
    .string()
    .min(3, { message: "Le nom de l'établissement est requis." }),
  email: z.string().email({ message: "Adresse e-mail invalide." }),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  postal: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  landlinePhone: z.string().optional().nullable(),
  siret: z
    .string()
    .min(14, "Le SIRET doit contenir 14 chiffres.")
    .max(14, "Le SIRET doit contenir 14 chiffres.")
    .refine((v) => isSIRET(v), { message: "SIRET invalide." }),
});

export async function POST(req: Request) {
  try {
    // Check SUPER_ADMIN permission
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json({ errors }, { status: 400 });
    }

    const {
      firstName,
      lastName,
      schoolName,
      phone,
      address,
      email,
      postal,
      country,
      siret,
      city,
      landlinePhone,
    } = parsed.data;

    // Check if a user with the same email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        {
          errors: [
            {
              field: "email",
              message: "Un compte existe déjà avec cet email.",
            },
          ],
        },
        { status: 409 }
      );
    }

    // Check if a Tenant with the same SIRET already exists
    const existingTenant = await prisma.tenant.findFirst({ where: { siret } });
    if (existingTenant) {
      return NextResponse.json(
        {
          errors: [
            {
              field: "siret",
              message: "Un établissement avec ce SIRET existe déjà.",
            },
          ],
        },
        { status: 409 }
      );
    }

    // Generate unique school code
    let schoolCode = generateSchoolCode(schoolName);
    let existingCode = await prisma.tenant.findUnique({
      where: { schoolCode },
    });
    while (existingCode) {
      schoolCode = generateSchoolCode(schoolName);
      existingCode = await prisma.tenant.findUnique({ where: { schoolCode } });
    }

    // Create Tenant
    const trialEndsAt = addDays(new Date(), 20);
    const tenant = await prisma.tenant.create({
      data: {
        name: schoolName,
        phone,
        address,
        postal,
        city,
        country,
        landlinePhone,
        siret,
        schoolCode,
        status: "TRIAL",
        trialEndsAt,
      },
    });

    // Create Director user
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role: "DIRECTOR",
        tenantId: tenant.id,
        phone: phone || "",
      },
    });

    // Send email with temporary password
    await sendEmailWithTempPassword({
      to: email,
      name: firstName,
      password: tempPassword,
    });

    return NextResponse.json({
      success: true,
      tenantId: tenant.id,
      userId: user.id,
      message:
        "École et directeur créés avec succès. Un e-mail avec le mot de passe temporaire a été envoyé.",
    });
  } catch (error) {
    console.error("Error creating school:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: {
        where: { role: "DIRECTOR" },
        select: { email: true, firstName: true, lastName: true },
      },
    },
  });

  return NextResponse.json({ tenants });
}
