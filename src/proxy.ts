import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Filtre rapide : sans cookie de session, on renvoie vers la connexion.
 * La vraie vérification de la session est faite dans chaque page (requireUser).
 */
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const url = new URL("/connexion", request.url);
    url.searchParams.set("redirect", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/compte", "/compte/:path*", "/admin", "/admin/:path*"],
};
