import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TOKEN_COOKIE_KEY = "resolveai_admin_token";
const publicRoutes = ["/login", "/admin/login"];
const siteRoutes = ["/sobre", "/recursos", "/contato"];
const dashboardRoutes = ["/dashboard", "/analytics", "/map", "/observations", "/reports", "/actions", "/admin", "/profile"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE_KEY)?.value ?? null;
  const { pathname } = request.nextUrl;

  // Verificar se é rota de autenticação (verificar ANTES de tudo)
  const isAuthRoute = publicRoutes.some((route) => pathname.startsWith(route));
  
  // Se tem token e está em rota de login, redirecionar para dashboard
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Permitir acesso a rotas de autenticação (sem token)
  if (isAuthRoute) {
    return NextResponse.next();
  }

  // Verificar se é rota do site público (exceto "/")
  const isSiteRoute = siteRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"));
  
  // Verificar se é rota do dashboard (após verificar autenticação)
  // Excluir rotas de autenticação que podem começar com /admin
  const isDashboardRoute = dashboardRoutes.some((route) => {
    // Não considerar /admin/login como rota de dashboard
    if (route === "/admin" && pathname.startsWith("/admin/login")) {
      return false;
    }
    return pathname.startsWith(route);
  });

  // Se está na raiz "/"
  if (pathname === "/") {
    // Sempre permitir acesso à raiz (site público ou dashboard quando autenticado)
    return NextResponse.next();
  }

  // Se está tentando acessar dashboard sem token, redirecionar para login
  if (!token && isDashboardRoute) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Permitir acesso a rotas públicas do site
  if (isSiteRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - arquivos de imagem (png, jpg, jpeg, gif, svg, ico, webp)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico|.*\\.webp).*)",
  ],
};




