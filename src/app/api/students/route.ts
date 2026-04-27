// ✅ Multi-tenant filter added (tenantId)
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";
import { prisma } from "../../../lib/prisma";

// Récupérer les élèves du parent connecté
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userEmail = session.user?.email;

  if (!userEmail || !session.user.tenantId) {
    return NextResponse.json(
      { error: "Informations manquantes dans la session" },
      { status: 400 }
    );
  }

  const students = await prisma.student.findMany({
    where: {
      parent: {
        email: userEmail,
      },
      tenantId: session.user.tenantId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      class: {
        select: { id: true, name: true, monthlyFee: true },
      },
      _count: { select: { documents: true } },
    },
  });

  return NextResponse.json({ students });
}

// Ajouter un élève
export async function POST(req: Request) {
  const generateStudentCode = async (): Promise<string> => {
    let code: string = "";
    let exists = true;

    while (exists) {
      code = Math.floor(10000 + Math.random() * 90000).toString();
      const student = await prisma.student.findUnique({ where: { code } });
      exists = !!student;
    }

    return code;
  };

  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userEmail = session.user?.email;
  const tenantId = session.user?.tenantId;

  if (!userEmail || !tenantId) {
    return NextResponse.json(
      { error: "Informations manquantes dans la session" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const {
    firstName,
    lastName,
    birthDate,
    address,
    hasHealthIssues,
    healthDetails,
    canLeaveAlone,
    classId,
  } = body;

  if (!firstName || !lastName || !birthDate || !address || !classId) {
    return NextResponse.json(
      { error: "Champs requis manquants" },
      { status: 400 }
    );
  }

  const targetClass = await prisma.class.findFirst({
    where: {
      id: classId,
      tenantId: tenantId,
    },
  });

  if (!targetClass) {
    return NextResponse.json({ error: "Classe introuvable" }, { status: 404 });
  }

  const code = await generateStudentCode();

  const student = await prisma.student.create({
    data: {
      firstName,
      lastName,
      birthDate: new Date(birthDate),
      address,
      hasHealthIssues,
      healthDetails: hasHealthIssues ? healthDetails : null,
      canLeaveAlone,
      code,
      status: "PENDING",
      tenant: {
        connect: { id: tenantId },
      },
      parent: {
        connect: { email: userEmail },
      },
      class: {
        connect: { id: classId },
      },
    },
  });

  return NextResponse.json({ success: true, student });
}
