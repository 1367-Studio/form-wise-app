import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const ADHERA_LOGIN_URL = "https://adhera-ebon.vercel.app/login";
const ADHERA_REGISTER_URL = "https://adhera-ebon.vercel.app/register";

// Strips a leading locale segment (e.g. "/en/login" -> "/login") so the redirect
// below applies regardless of which locale prefix the request came in with.
function stripLocale(pathname: string): string {
  const [, maybeLocale, ...rest] = pathname.split("/");
  if ((routing.locales as readonly string[]).includes(maybeLocale)) {
    return "/" + rest.join("/");
  }
  return pathname;
}

export default function middleware(request: NextRequest) {
  const pathname = stripLocale(request.nextUrl.pathname) || "/";

  // Auth now lives on adhera — catch every way of reaching these routes (nav
  // links, bookmarks, a user typing the URL directly) and send them there,
  // instead of only updating the on-site links. "/register-staff" is a
  // different flow (staff accepting an invite to an existing tenant) and is
  // intentionally left alone.
  if (pathname === "/login") {
    return NextResponse.redirect(ADHERA_LOGIN_URL);
  }
  if (pathname === "/register" || pathname.startsWith("/register/")) {
    return NextResponse.redirect(ADHERA_REGISTER_URL);
  }

  return intlMiddleware(request);
}

export const config = {
  // Match everything except API routes, Next internals, and static files
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
