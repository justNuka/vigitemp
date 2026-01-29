import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

const intlMiddleware = createMiddleware(routing)

const shouldLog =
  process.env.VIGITEMP_PROXY_DEBUG === "1" && process.env.NODE_ENV !== "production"

const protectedRoutes = [
  "/",
  "/surveillance",
  "/monitoring",
  "/alarmes",
  "/alarms",
  "/parametres",
  "/settings",
  "/profil",
  "/profile",
  "/admin",
]

const authRoutes = ["/login"]

const TEST_ROUTES = ["/surveillance-cached", "/admin/test", "/test", "/debug"]

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("auth-token")?.value

  if (shouldLog) {
    console.log(`[Proxy] ${pathname} - Token: ${token ? "YES" : "NO"}`)
  }

  const maybeLocale = pathname.split("/")[1]
  const localeInPath = routing.locales.includes(maybeLocale as any) ? maybeLocale : undefined
  const locale = localeInPath ?? routing.defaultLocale
  const pathnameWithoutLocale = localeInPath ? pathname.slice(localeInPath.length + 1) || "/" : pathname

  if (process.env.NODE_ENV === "production") {
    const isTestRoute = TEST_ROUTES.some((route) => pathnameWithoutLocale.startsWith(route))
    if (isTestRoute) {
      return NextResponse.redirect(new URL("/404", request.url))
    }
  }

  const intlResponse = intlMiddleware(request)

  if (intlResponse.status === 307 || intlResponse.status === 308) {
    if (shouldLog) {
      console.log(`[Proxy] Intl redirecting to: ${intlResponse.headers.get("location")}`)
    }
    return intlResponse
  }

  const isProtectedRoute = protectedRoutes.some((route) => {
    if (route === "/") return pathnameWithoutLocale === "/"
    return pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(`${route}/`)
  })

  const isAuthRoute = authRoutes.some(
    (route) => pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(`${route}/`),
  )

  if (isProtectedRoute && !token) {
    if (shouldLog) {
      console.log(`[Proxy] No token for protected route ${pathname}, redirecting to login`)
    }
    const loginUrl = new URL(`/${locale}/login`, request.url)
    if (!pathname.includes("/surveillance")) {
      loginUrl.searchParams.set("from", pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && token) {
    if (shouldLog) {
      console.log("[Proxy] Token found for /login, redirecting to /")
    }
    return NextResponse.redirect(new URL(`/${locale}`, request.url))
  }

  if (shouldLog) {
    console.log("[Proxy] Allowing request to proceed")
  }
  return intlResponse
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
}
