import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "./authOptions";

type UserRole = "PARENT" | "TEACHER" | "DIRECTOR" | "SUPER_ADMIN" | "STAFF";

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, per-instance)
// ---------------------------------------------------------------------------
// NOTE: Vercel Functions can run multiple concurrent instances, so this map
// is per-instance. For production-grade global limits, swap the body of
// `consume` with @upstash/ratelimit (env-detected, drop-in).
// This in-memory limiter is still a meaningful brute-force speed bump and
// avoids a hard dependency until Upstash is provisioned.

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitOptions {
  /** logical name, e.g. "forgot-password" */
  name: string;
  /** max requests per window */
  limit: number;
  /** window length in ms */
  windowMs: number;
}

export function consumeRateLimit(
  key: string,
  opts: RateLimitOptions
): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const bucketKey = `${opts.name}:${key}`;
  const bucket = rateBuckets.get(bucketKey);
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(bucketKey, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true };
  }
  if (bucket.count >= opts.limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { ok: true };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "0.0.0.0";
}

export function enforceRateLimit(
  req: Request,
  opts: RateLimitOptions,
  extraKey?: string
): NextResponse | null {
  const ip = clientIp(req);
  const key = extraKey ? `${ip}:${extraKey.toLowerCase()}` : ip;
  const result = consumeRateLimit(key, opts);
  if (!result.ok) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez plus tard." },
      {
        status: 429,
        headers: { "Retry-After": String(result.retryAfter) },
      }
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// Same-origin (CSRF) guard
// ---------------------------------------------------------------------------

const ALLOWED_ORIGINS = new Set(
  [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXTAUTH_URL,
    "https://formwise.fr",
    "https://www.formwise.fr",
  ].filter((v): v is string => typeof v === "string" && v.length > 0)
);

export function enforceSameOrigin(req: Request): NextResponse | null {
  const secFetchSite = req.headers.get("sec-fetch-site");
  // Modern browsers send sec-fetch-site. "same-origin" / "same-site" / "none"
  // are safe (none = direct navigation/no referrer). "cross-site" is rejected.
  if (secFetchSite && secFetchSite !== "cross-site") return null;

  const origin = req.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.has(origin)) return null;

  // No origin header on same-origin server-side fetches — only block when
  // we have positive evidence of cross-site.
  if (secFetchSite === "cross-site") {
    return NextResponse.json(
      { error: "Origine non autorisée" },
      { status: 403 }
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

export interface RequireSessionOptions {
  roles?: UserRole[];
  requireTenant?: boolean;
}

export async function requireSession(
  opts: RequireSessionOptions = {}
): Promise<{ session: Session } | { error: NextResponse }> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }),
    };
  }
  if (opts.roles && !opts.roles.includes(session.user.role as UserRole)) {
    return {
      error: NextResponse.json(
        { error: "Permissions insuffisantes" },
        { status: 403 }
      ),
    };
  }
  if (
    opts.requireTenant &&
    session.user.role !== "SUPER_ADMIN" &&
    !session.user.tenantId
  ) {
    return {
      error: NextResponse.json(
        { error: "Utilisateur sans tenant" },
        { status: 403 }
      ),
    };
  }
  return { session };
}

// ---------------------------------------------------------------------------
// Password validation
// ---------------------------------------------------------------------------

export const MIN_PASSWORD_LENGTH = 10;
export const BCRYPT_COST = 12;

export function validatePassword(pw: unknown): { ok: true } | { ok: false; error: string } {
  if (typeof pw !== "string") {
    return { ok: false, error: "Mot de passe requis." };
  }
  if (pw.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,
    };
  }
  // Require some basic complexity: at least one letter and one digit-or-symbol.
  if (!/[A-Za-z]/.test(pw) || !/[\d\W_]/.test(pw)) {
    return {
      ok: false,
      error: "Le mot de passe doit contenir des lettres et des chiffres ou symboles.",
    };
  }
  return { ok: true };
}
