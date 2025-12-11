import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/", "/surveillance", "/alarms", "/audit", "/settings", "/users"];

// Routes that should redirect to dashboard if authenticated
const authRoutes = ["/login"];

// Routes de test à bloquer en production
const TEST_ROUTES = ["/surveillance-cached", "/test", "/debug"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token");

  // Debug logs
  console.log(`[Proxy] ${pathname} - Token: ${token ? 'YES' : 'NO'}`);

  // Bloquer les routes de test en production
  if (process.env.NODE_ENV === "production") {
    const isTestRoute = TEST_ROUTES.some((route) => pathname.startsWith(route));
    if (isTestRoute) {
      return NextResponse.redirect(new URL("/404", request.url));
    }
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => {
    // Exact match for root path
    if (route === "/" && pathname === "/") return true;
    // Prefix match for other routes
    if (route !== "/" && pathname.startsWith(route)) return true;
    return false;
  });

  // Check if route is auth-only
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    // Only add 'from' parameter if it's not the default surveillance route
    if (pathname !== "/surveillance") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing login with valid token
  if (isAuthRoute && token) {
    console.log('[Proxy] Redirecting from /login to /');
    return NextResponse.redirect(new URL("/", request.url));
  }

  console.log('[Proxy] Allowing request to proceed');
  return NextResponse.next();
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
