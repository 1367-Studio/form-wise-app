import { NextResponse } from "next/server";
import { enforceRateLimit, enforceSameOrigin } from "../../../lib/security";

export async function POST(req: Request) {
  const csrf = enforceSameOrigin(req);
  if (csrf) return csrf;

  const rl = enforceRateLimit(req, {
    name: "newsletter",
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (rl) return rl;

  let email: string | undefined;
  try {
    const body = (await req.json()) as { email?: unknown };
    if (typeof body.email === "string") email = body.email;
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  if (!process.env.BREVO_API_KEY || !process.env.BREVO_LIST_ID) {
    return NextResponse.json(
      { error: "Service indisponible" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        listIds: [parseInt(process.env.BREVO_LIST_ID, 10)],
        updateEnabled: true,
      }),
    });

    if (!response.ok) {
      // Don't leak Brevo error details to the client.
      console.error("Brevo subscribe failed:", response.status);
      return NextResponse.json(
        { error: "Inscription impossible" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter error");
    void error;
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
