import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { z } from "zod";
import { isSIRET } from "vat-siren-siret";

// Import the enum if you are using 'PreRegistrationStatus' in the TenantApplication model
// import { PreRegistrationStatus } from '@prisma/client';

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
    .refine((v) => isSIRET(v), {
      message: "SIRET invalide.",
    }),
});

export async function POST(req: Request) {
  try {
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
    } = parsed.data; // 1. Check if a user already exists with this email (to avoid future conflict)

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
    } // NOTE: The SIRET check on Tenant was removed,
    // because the Tenant only exists after approval. If you need to check
    // if there is a PENDING or APPROVED application with the same SIRET,
    // you can add a check here (e.g., findFirst on TenantApplication).
    // Optional check: Prevents multiple PENDING applications with the same SIRET

    const existingPendingApplication = await prisma.tenantApplication.findFirst(
      {
        where: { siret, status: "PENDING" },
      }
    );
    if (existingPendingApplication) {
      return NextResponse.json(
        {
          errors: [
            {
              field: "siret",
              message:
                "Une demande d'inscription pour ce SIRET est déjà en cours de révision.",
            },
          ],
        },
        { status: 409 }
      );
    } // 2. Creation of the TenantApplication (the request)

    const application = await prisma.tenantApplication.create({
      data: {
        // Applicant's data (Director)
        firstName,
        lastName,
        email, // School data

        name: schoolName, // Corresponds to `schoolName` from the schema
        phone,
        address,
        siret,
        postal,
        city,
        country,
        landlinePhone, // Initial Status: PENDING (PreRegistrationStatus)

        status: "PENDING",
      },
    }); // 3. Success response (without User/Tenant creation)

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      message:
        "Votre demande a été envoyée pour révision. Vous recevrez une notification par e-mail après l'approbation.",
    });
  } catch (error) {
    console.error("Error during creation of the registration request:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
