import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireSession } from "../../../../lib/security";

export async function GET() {
  const auth = await requireSession({
    roles: ["DIRECTOR", "SUPER_ADMIN"],
    requireTenant: true,
  });
  if ("error" in auth) return auth.error;
  const { session } = auth;

  const tenantFilter =
    session.user.role === "SUPER_ADMIN"
      ? {}
      : { tenantId: session.user.tenantId as string };

  try {
    const results = await prisma.schoolYear.findMany({
      where: tenantFilter,
      orderBy: { startDate: "asc" },
      select: {
        name: true,
        classes: { select: { Student: { select: { id: true } } } },
      },
    });

    const data = results.map((year) => ({
      year: year.name,
      élèves: year.classes.reduce((sum, cls) => sum + cls.Student.length, 0),
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur API /count-by-year");
    void error;
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
