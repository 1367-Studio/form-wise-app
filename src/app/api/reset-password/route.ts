import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  enforceRateLimit,
  enforceSameOrigin,
  validatePassword,
  BCRYPT_COST,
} from "../../../lib/security";

interface ResetTokenPayload {
  sub: string;
  email: string;
  tv: number;
  iat?: number;
  exp?: number;
}

export async function POST(req: Request) {
  const csrf = enforceSameOrigin(req);
  if (csrf) return csrf;

  const rl = enforceRateLimit(req, {
    name: "reset-password",
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (rl) return rl;

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    return NextResponse.json(
      { success: false, error: "Service indisponible" },
      { status: 500 }
    );
  }

  try {
    const { token, password } = (await req.json()) as {
      token?: unknown;
      password?: unknown;
    };

    if (typeof token !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Données manquantes." },
        { status: 400 }
      );
    }

    const pwdCheck = validatePassword(password);
    if (!pwdCheck.ok) {
      return NextResponse.json(
        { success: false, error: pwdCheck.error },
        { status: 400 }
      );
    }

    let decoded: ResetTokenPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as ResetTokenPayload;
    } catch (err) {
      const name = (err as Error & { name?: string }).name;
      if (name === "TokenExpiredError") {
        return NextResponse.json(
          { success: false, error: "Lien expiré. Veuillez recommencer." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, error: "Lien invalide." },
        { status: 400 }
      );
    }

    if (!decoded?.sub || typeof decoded.tv !== "number") {
      return NextResponse.json(
        { success: false, error: "Lien invalide." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_COST);

    // Atomic: only updates if tokenVersion still matches the one in the token.
    // Bumping tokenVersion makes the reset link single-use and invalidates
    // all existing JWT sessions for this user.
    const result = await prisma.user.updateMany({
      where: { id: decoded.sub, tokenVersion: decoded.tv },
      data: {
        password: hashedPassword,
        tokenVersion: { increment: 1 },
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: "Lien déjà utilisé ou invalide." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur reset-password");
    void error;
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
