import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { resend } from "../../../lib/resend";
import { enforceRateLimit, enforceSameOrigin } from "../../../lib/security";

const schema = z.object({
  parent: z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email().max(254),
    phone: z.string().min(1).max(40),
    address: z.string().min(1).max(500),
  }),
  children: z
    .array(
      z.object({
        firstName: z.string().min(1).max(100),
        lastName: z.string().min(1).max(100),
        gender: z.enum(["FILLE", "GARÇON"]),
        birthDate: z.string().refine((s) => !isNaN(Date.parse(s)), {
          message: "Invalid date",
        }),
        birthCity: z.string().min(1).max(100),
        birthCountry: z.string().min(1).max(100),
        currentSchool: z.string().min(1).max(200),
        desiredClass: z.string().min(1).max(100),
      })
    )
    .min(1)
    .max(10),
  uploadedFiles: z.object({
    motivationLetterUrl: z.string().url().nullable(),
    schoolResultsUrl: z.string().url().nullable(),
    familyBookUrl: z.string().url().nullable(),
  }),
  schoolCode: z.string().min(1).max(64),
});

export async function POST(req: Request) {
  const csrf = enforceSameOrigin(req);
  if (csrf) return csrf;

  const rl = enforceRateLimit(req, {
    name: "preinscriptions",
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (rl) return rl;

  let parsed: z.infer<typeof schema>;
  try {
    const body = await req.json();
    parsed = schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { schoolCode: parsed.schoolCode },
      select: { id: true, name: true, email: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: "École introuvable" }, { status: 404 });
    }

    const parent = await prisma.preRegistrationParent.create({
      data: {
        ...parsed.parent,
        tenantId: tenant.id,
        children: {
          create: parsed.children.map((child) => ({
            ...child,
            birthDate: new Date(child.birthDate),
          })),
        },
      },
    });

    await prisma.preRegistrationDocument.create({
      data: {
        parentId: parent.id,
        motivationLetterUrl: parsed.uploadedFiles.motivationLetterUrl,
        schoolResultsUrl: parsed.uploadedFiles.schoolResultsUrl,
        familyBookUrl: parsed.uploadedFiles.familyBookUrl,
      },
    });

    await resend.emails.send({
      from: "Formwise <onboarding@formwise.fr>",
      to: parent.email,
      subject: "Confirmation de votre pré-inscription",
      html: `
        <p>Bonjour ${escapeHtml(parent.firstName)},</p>
        <p>Nous confirmons la bonne réception de votre demande de pré-inscription pour l'établissement <strong>${escapeHtml(tenant.name)}</strong>.</p>
        <p>L'école vous recontactera sous peu.</p>
        <p>Merci et à bientôt !<br/>L'équipe Formwise</p>
      `,
    });

    if (tenant.email) {
      await resend.emails.send({
        from: "Formwise <onboarding@formwise.fr>",
        to: tenant.email,
        subject: `Nouvelle pré-inscription - ${parent.firstName} ${parent.lastName}`,
        html: `
          <p>Bonjour,</p>
          <p>Une nouvelle demande de pré-inscription a été soumise pour votre établissement <strong>${escapeHtml(tenant.name)}</strong>.</p>
          <p><strong>Parent :</strong> ${escapeHtml(parent.firstName)} ${escapeHtml(parent.lastName)} (${escapeHtml(parent.email)})</p>
          <p>Vous pouvez la consulter dans votre dashboard.</p>
          <p>— Formwise</p>
        `,
      });
    }

    return NextResponse.json({ success: true, parentId: parent.id });
  } catch (error) {
    console.error("Erreur préinscription");
    void error;
    // Don't leak DB / validation error details to the client.
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
