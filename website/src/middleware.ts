import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/surveillance", "/alarms", "/audit", "/settings", "/users"];

// Routes that should redirect to dashboard if authenticated
const authRoutes = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("session");

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if route is auth-only
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    // Only add 'from' parameter if it's not the default surveillance route
    if (pathname !== "/surveillance") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing login with valid session
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

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
