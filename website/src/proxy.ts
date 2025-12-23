import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next-intl
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Créer le middleware next-intl
const intlMiddleware = createMiddleware(routing);

// Routes that require authentication (FR + EN pathnames)
const protectedRoutes = [
  "/",
  "/surveillance",
  "/monitoring",
  "/alarmes",
  "/alarms",
  "/audit",
  "/parametres",
  "/settings",
  "/profil",
  "/profile",
  "/admin",
];

// Routes that should redirect to dashboard if authenticated
const authRoutes = ["/login"];

// Routes de test à bloquer en production
const TEST_ROUTES = ["/surveillance-cached", "/test", "/debug"];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  // Debug logs
  console.log(`[Proxy] ${pathname} - Token: ${token ? 'YES' : 'NO'}`);

  const maybeLocale = pathname.split("/")[1];
  const localeInPath = routing.locales.includes(maybeLocale as any) ? maybeLocale : undefined;
  const locale = localeInPath ?? routing.defaultLocale;
  const pathnameWithoutLocale =
    localeInPath ? (pathname.slice(localeInPath.length + 1) || "/") : pathname;

  // Bloquer les routes de test en production
  if (process.env.NODE_ENV === "production") {
    const isTestRoute = TEST_ROUTES.some((route) => pathnameWithoutLocale.startsWith(route));
    if (isTestRoute) {
      return NextResponse.redirect(new URL("/404", request.url));
    }
  }

  // Appliquer le middleware next-intl FIRST pour ajouter/rediriger la locale
  // Si la route n'a pas de locale, next-intl va rediriger automatiquement
  const intlResponse = intlMiddleware(request);

  // Si c'est une redirection de next-intl (ex: /surveillance -> /fr/surveillance)
  // laisser passer la redirection
  if (intlResponse.status === 307 || intlResponse.status === 308) {
    console.log(`[Proxy] Intl redirecting to: ${intlResponse.headers.get('location')}`);
    return intlResponse;
  }

  // À ce stade, la locale est dans le pathname (/fr/... ou /en/...)
  // Vérifier l'authentification
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => {
    if (route === "/") return pathnameWithoutLocale === "/";
    return pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(`${route}/`);
  });

  // Check if route is auth-only
  const isAuthRoute = authRoutes.some(
    (route) => pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(`${route}/`)
  );

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    console.log(`[Proxy] No token for protected route ${pathname}, redirecting to login`);
    const loginUrl = new URL(`/${locale}/login`, request.url);
    if (!pathname.includes("/surveillance")) {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing login with valid token
  if (isAuthRoute && token) {
    console.log('[Proxy] Token found for /login, redirecting to /');
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  console.log('[Proxy] Allowing request to proceed');
  return intlResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
