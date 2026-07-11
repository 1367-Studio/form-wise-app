import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const ADHERA_URL = process.env.ADHERA_URL ?? "https://adhera-ebon.vercel.app";

// Strips a leading locale segment (e.g. "/en/login" -> "/login") so the checks
// below apply regardless of which locale prefix the request came in with.
function stripLocale(pathname: string): string {
  const [, maybeLocale, ...rest] = pathname.split("/");
  if ((routing.locales as readonly string[]).includes(maybeLocale)) {
    return "/" + rest.join("/");
  }
  return pathname;
}

export default function middleware(request: NextRequest) {
  const pathname = stripLocale(request.nextUrl.pathname) || "/";

  // Auth now lives on adhera, embedded on this domain under /app (its own
  // next.config.ts sets basePath: "/app" to match) — same pattern as 1367studio's
  // /hub proxy. Covers assets/API requests too since it's matched before locale
  // routing and independently of the dotted-filename exclusion below.
  if (pathname === "/app" || pathname.startsWith("/app/")) {
    const target = new URL(pathname + request.nextUrl.search, ADHERA_URL);
    return NextResponse.rewrite(target);
  }

  // Legacy direct links to /login and /register (nav links, bookmarks, a user
  // typing the URL) now live under /app. "/register-staff" is a different flow
  // (staff accepting an invite to an existing tenant) and is intentionally left alone.
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/app/login", request.url));
  }
  if (pathname === "/register" || pathname.startsWith("/register/")) {
    return NextResponse.redirect(new URL("/app/register", request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/app/:path*",
    // Match everything else except API routes, Next internals, static files, and /app
    "/((?!api|_next|_vercel|app|.*\\..*).*)",
  ],
};
