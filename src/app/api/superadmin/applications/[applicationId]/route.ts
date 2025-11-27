import { prisma } from "../../../../../lib/prisma";
import { authOptions } from "../../../../../lib/authOptions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import {
  sendEmailForDeniedRequest,
  sendEmailWithTempPassword,
} from "../../../../../lib/email";
import bcrypt from "bcryptjs";
import { generateSchoolCode } from "../../../../../lib/generateSchoolCode";

type RequestBody = {
  action: "APPROVE" | "REJECT";
  rejectionReason: string | null;
  adminId: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const { applicationId } = await params;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    return new NextResponse("Non autorisé", { status: 401 });
  }

  const loggedInAdminId = session.user.id;

  let body: RequestBody;
  try {
    body = await request.json();
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Corps de requête invalide" },
      { status: 400 }
    );
  }

  const { action, rejectionReason, adminId } = body;

  if (!action || !adminId) {
    return NextResponse.json(
      { error: "Les champs « action » et « adminId » sont requis." },
      { status: 400 }
    );
  }

  if (
    action === "REJECT" &&
    (!rejectionReason || rejectionReason.trim().length < 5)
  ) {
    return NextResponse.json(
      {
        error:
          "La raison du refus doit être fournie et contenir au moins 5 caractères.",
      },
      { status: 400 }
    );
  }

  if (loggedInAdminId !== adminId) {
    return NextResponse.json(
      { error: "Incohérence d'identifiant administrateur." },
      { status: 403 }
    );
  }
  if (!applicationId) {
    return NextResponse.json(
      { error: "ID de la demande manquant." },
      { status: 400 }
    );
  }

  try {
    const application = await prisma.tenantApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Demande introuvable." },
        { status: 404 }
      );
    }

    if (application.status !== "PENDING") {
      return NextResponse.json(
        {
          error: `Cette demande a déjà été traitée : ${application.status}.`,
        },
        { status: 400 }
      );
    }

    if (action === "APPROVE") {
      const tempPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      let schoolCode = generateSchoolCode(application.name);
      let existingCode = await prisma.tenant.findUnique({
        where: { schoolCode },
      });

      while (existingCode) {
        schoolCode = generateSchoolCode(application.name);
        existingCode = await prisma.tenant.findUnique({
          where: { schoolCode },
        });
      }

      await prisma.$transaction(async (tx) => {
        const newTenant = await tx.tenant.create({
          data: {
            name: application.name,
            schoolCode,
            address: application.address,
            phone: application.phone || "",
            siret: application.siret,
            postal: application.postal,
            city: application.city,
            country: application.country,
            landlinePhone: application.landlinePhone || "",
          },
        });

        await tx.user.create({
          data: {
            email: application.email,
            firstName: application.firstName,
            lastName: application.lastName,
            phone: application.phone || "",
            role: "DIRECTOR",
            tenantId: newTenant.id,
            password: hashedPassword,
          },
        });

        await tx.tenantApplication.update({
          where: { id: applicationId },
          data: {
            status: "ACCEPTED",
            approvedById: loggedInAdminId,
            rejectionReason: null,
          },
        });
      });
      await sendEmailWithTempPassword({
        to: application.email,
        name: application.firstName,
        password: tempPassword,
      });
      return NextResponse.json(
        {
          message:
            "Demande approuvée avec succès. Établissement et Directeur créés.",
        },
        { status: 200 }
      );
    } else if (action === "REJECT") {
      await prisma.tenantApplication.update({
        where: { id: applicationId },
        data: {
          status: "REJECTED",
          rejectionReason: rejectionReason,
          approvedById: loggedInAdminId,
        },
      });
      await sendEmailForDeniedRequest({
        to: application.email,
        name: application.firstName,
        reason: rejectionReason || "Aucune raison fournie",
      });
      return NextResponse.json(
        { message: "Demande rejetée avec succès." },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error processing application:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur lors du traitement de l’action." },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const session = await getServerSession(authOptions);
  const { applicationId } = await params;

  // 1. Vérification de l'Authentification et de l'Autorisation (seulement SUPER_ADMIN)
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return new NextResponse("Non autorisé", { status: 401 });
  }
  if (!applicationId) {
    return NextResponse.json(
      { error: "ID de la demande manquant." },
      { status: 400 }
    );
  }

  try {
    // 2. Recherche de la Candidature dans la base de données
    const application = await prisma.tenantApplication.findUnique({
      where: { id: applicationId },
    });

    // 3. Vérification de l'existence
    if (!application) {
      return NextResponse.json(
        { error: "Demande introuvable." },
        { status: 404 }
      );
    }

    // 4. Succès: Retourne l'objet de la candidature
    return NextResponse.json(application, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération de la demande:", error);
    return NextResponse.json(
      {
        error:
          "Erreur interne du serveur lors de la récupération de la demande.",
      },
      { status: 500 }
    );
  }
}
