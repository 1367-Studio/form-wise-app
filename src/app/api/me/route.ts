import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      civility: true,
      createdAt: true,
      tenant: {
        select: {
          name: true,
          schoolCode: true,
        },
      },
    },
  });

  return NextResponse.json({ user });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { firstName, lastName, phone, civility } = await req.json();

  if (!firstName || !lastName) {
    return NextResponse.json(
      { error: "First name and last name are required" },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { email: session.user.email! },
    data: {
      firstName,
      lastName,
      phone,
      ...(civility !== undefined && { civility }),
    },
  });

  return NextResponse.json({ success: true, user: updated });
}
