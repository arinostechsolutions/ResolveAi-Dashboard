import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TOKEN_COOKIE_KEY = "resolveai_admin_token";
const publicRoutes = ["/login"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE_KEY)?.value ?? null;
  const { pathname } = request.nextUrl;

  const isAuthRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (!token && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets|public).*)",
  ],
};


