import React from "react";
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { resend } from "../../../lib/resend";
import { render } from "@react-email/render";
import ValidateEmailTemplate from "../../../components/emails/ValidateEmailTemplate";
import { enforceSameOrigin, requireSession } from "../../../lib/security";

export async function POST(req: Request) {
  const csrf = enforceSameOrigin(req);
  if (csrf) return csrf;

  const auth = await requireSession({
    roles: ["DIRECTOR", "SUPER_ADMIN"],
    requireTenant: true,
  });
  if ("error" in auth) return auth.error;
  const { session } = auth;

  const { childId, decision } = (await req.json()) as {
    childId?: unknown;
    decision?: unknown;
  };

  if (
    typeof childId !== "string" ||
    (decision !== "ACCEPTED" && decision !== "REJECTED")
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Tenant guard: confirm the child belongs to the caller's tenant before
  // any update. SUPER_ADMIN bypasses tenant scoping.
  const child = await prisma.preRegistrationChild.findUnique({
    where: { id: childId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      parent: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
          tenantId: true,
          tenant: { select: { schoolCode: true } },
        },
      },
    },
  });

  if (!child) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    session.user.role !== "SUPER_ADMIN" &&
    child.parent.tenantId !== session.user.tenantId
  ) {
    // Same response shape as 404 to avoid telling an attacker that a child
    // exists but belongs to a different school.
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const schoolCode = child.parent.tenant?.schoolCode;
  if (!schoolCode) {
    return NextResponse.json(
      { error: "Code établissement manquant" },
      { status: 500 }
    );
  }

  try {
    await prisma.preRegistrationChild.update({
      where: { id: childId },
      data: { status: decision },
    });

    if (decision === "ACCEPTED") {
      const alreadyInvited = await prisma.invitedParent.findFirst({
        where: {
          email: child.parent.email,
          tenantId: child.parent.tenantId,
        },
      });
      if (!alreadyInvited) {
        await prisma.invitedParent.create({
          data: {
            email: child.parent.email,
            tenantId: child.parent.tenantId,
            used: false,
          },
        });
      }
    }

    const emailHtml = await render(
      React.createElement(ValidateEmailTemplate, {
        decision: decision as "ACCEPTED" | "REJECTED",
        childName: `${child.firstName} ${child.lastName}`,
        parentName: `${child.parent.firstName} ${child.parent.lastName}`,
        schoolCode,
        registrationLink: "https://formwise.fr/register",
      })
    );

    await resend.emails.send({
      from: "Formwise <onboarding@formwise.fr>",
      to: child.parent.email,
      subject:
        decision === "ACCEPTED"
          ? "Votre préinscription a été acceptée"
          : "Votre préinscription a été refusée",
      html: emailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur validate-preinscription");
    void error;
    return NextResponse.json(
      { error: "Une erreur est survenue." },
      { status: 500 }
    );
  }
}
