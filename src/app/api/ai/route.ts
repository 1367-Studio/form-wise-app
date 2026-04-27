import { NextResponse } from "next/server";
import { faq } from "../../../lib/faq";
import { enforceRateLimit, enforceSameOrigin } from "../../../lib/security";

export async function POST(req: Request) {
  const csrf = enforceSameOrigin(req);
  if (csrf) return csrf;

  const rl = enforceRateLimit(req, {
    name: "ai-faq",
    limit: 30,
    windowMs: 5 * 60 * 1000,
  });
  if (rl) return rl;

  let role: unknown;
  let message: unknown;
  try {
    ({ role, message } = await req.json());
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  if (typeof role !== "string" || typeof message !== "string") {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const roleFAQ = faq[role] || {};
  const lower = message.toLowerCase();
  const found = Object.entries(roleFAQ).find(([question]) =>
    lower.includes(question)
  );

  if (found) return NextResponse.json({ answer: found[1] });
  return NextResponse.json({
    answer: "Je ne suis pas encore programmé pour répondre à cette question.",
  });
}
