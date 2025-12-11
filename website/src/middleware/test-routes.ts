import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes de test à bloquer en production
const TEST_ROUTES = [
  "/surveillance-cached",
  "/test",
  "/debug",
];

export function testRoutesMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isTestRoute = TEST_ROUTES.some((route) => pathname.startsWith(route));

  // En production, bloquer les routes de test
  if (process.env.NODE_ENV === "production" && isTestRoute) {
    return NextResponse.redirect(new URL("/404", request.url));
  }

  return NextResponse.next();
}
