import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"
import { ACCESS_COOKIE_MAX_AGE_SECONDS, SESSION_MAX_AGE_SECONDS } from "@/lib/jwt"
import { shouldUseSecureCookies } from "@/lib/cookie-security"
import { getCompatEnv } from "@/lib/vigisensys-compat"

const intlMiddleware = createMiddleware(routing)

const shouldLog =
  getCompatEnv("VIGISENSYS_PROXY_DEBUG", "VIGITEMP_PROXY_DEBUG") === "1" && process.env.NODE_ENV !== "production"

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

type TokenTiming = {
  exp?: number
  iat?: number
  sessionExpiresAt?: number
}

function readTokenTiming(token: string | undefined): TokenTiming | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null

  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const padded = b64.padEnd(Math.ceil(b64.length / 4) * 4, "=")
    const json = atob(padded)
    return JSON.parse(json) as TokenTiming
  } catch {
    return null
  }
}

function isTokenCurrentlyValid(token: string | undefined): boolean {
  const timing = readTokenTiming(token)
  if (typeof timing?.exp !== "number") return false
  const nowSec = Math.floor(Date.now() / 1000)
  return timing.exp > nowSec
}

function isRefreshTokenCurrentlyValid(token: string | undefined): boolean {
  const timing = readTokenTiming(token)
  if (typeof timing?.exp !== "number") return false

  const nowSec = Math.floor(Date.now() / 1000)
  if (timing.exp <= nowSec) return false

  const absoluteExpiry =
    typeof timing.sessionExpiresAt === "number"
      ? timing.sessionExpiresAt
      : typeof timing.iat === "number"
        ? timing.iat + SESSION_MAX_AGE_SECONDS
        : null

  return absoluteExpiry !== null && absoluteExpiry > nowSec
}

function clearAuthCookies(response: NextResponse, request: NextRequest) {
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: shouldUseSecureCookies(request),
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: shouldUseSecureCookies(request),
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })
  response.cookies.set("refresh-token", "", {
    httpOnly: true,
    secure: shouldUseSecureCookies(request),
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })
}

function refreshAuthCookie(response: NextResponse, request: NextRequest, token: string) {
  response.cookies.set("auth-token", token, {
    httpOnly: true,
    secure: shouldUseSecureCookies(request),
    sameSite: "lax",
    maxAge: ACCESS_COOKIE_MAX_AGE_SECONDS,
    path: "/",
  })
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const rawToken = request.cookies.get("token")?.value ?? request.cookies.get("auth-token")?.value
  const refreshToken = request.cookies.get("refresh-token")?.value
  const hasValidRefreshToken = isRefreshTokenCurrentlyValid(refreshToken)
  const hasValidToken = isTokenCurrentlyValid(rawToken)

  if (shouldLog) {
    console.log(
      `[Proxy] ${pathname} - Access valid: ${hasValidToken ? "YES" : "NO"} - Refresh valid: ${hasValidRefreshToken ? "YES" : "NO"}`,
    )
  }

  const maybeLocale = pathname.split("/")[1]
  const localeInPath = routing.locales.includes(maybeLocale as any) ? maybeLocale : undefined
  const locale = localeInPath ?? routing.defaultLocale
  const pathnameWithoutLocale = localeInPath ? pathname.slice(localeInPath.length + 1) || "/" : pathname

  const getLocalizedPathname = (path: string) => {
    const pathnames = routing.pathnames as Record<string, string | Record<string, string>> | undefined
    const entry = pathnames?.[path]
    if (!entry) return path
    if (typeof entry === "string") return entry
    return entry[locale] ?? entry[routing.defaultLocale] ?? path
  }

  const localizedLoginPath = getLocalizedPathname("/login")

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

  if (pathnameWithoutLocale === "/login" && localizedLoginPath !== "/login") {
    const redirectUrl = new URL(`/${locale}${localizedLoginPath}${request.nextUrl.search}`, request.url)
    return NextResponse.redirect(redirectUrl)
  }

  const isProtectedRoute = protectedRoutes.some((route) => {
    if (route === "/") return pathnameWithoutLocale === "/"
    return pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(`${route}/`)
  })

  const isAuthRoute = authRoutes.some(
    (route) => pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(`${route}/`),
  ) || pathnameWithoutLocale === localizedLoginPath

  if (isProtectedRoute && !hasValidToken && !hasValidRefreshToken) {
    if (shouldLog) {
      console.log(`[Proxy] No valid session for protected route ${pathname}, redirecting to login`)
    }
    const loginUrl = new URL(`/${locale}${localizedLoginPath}`, request.url)
    loginUrl.searchParams.set("from", `${pathnameWithoutLocale}${request.nextUrl.search}`)
    const response = NextResponse.redirect(loginUrl)
    clearAuthCookies(response, request)
    return response
  }

  const disconnectReason = request.nextUrl.searchParams.get("reason")
  const shouldForceDisconnect =
    isAuthRoute && (disconnectReason === "session-expired" || disconnectReason === "inactivity")

  if (shouldForceDisconnect) {
    if (shouldLog) {
      console.log(`[Proxy] Explicit disconnect on ${pathname}, clearing authentication cookies`)
    }
    clearAuthCookies(intlResponse, request)
    return intlResponse
  }

  if (isAuthRoute && hasValidToken) {
    if (shouldLog) {
      console.log("[Proxy] Valid token found for /login, redirecting to /")
    }
    const requestedTarget = request.nextUrl.searchParams.get("from")
    const safeTarget =
      requestedTarget && requestedTarget.startsWith("/") && !requestedTarget.startsWith("//")
        ? requestedTarget
        : `/${locale}`
    const response = NextResponse.redirect(new URL(safeTarget, request.url))
    if (rawToken) refreshAuthCookie(response, request, rawToken)
    return response
  }

  if (isAuthRoute && (rawToken || refreshToken) && !hasValidToken && !hasValidRefreshToken) {
    clearAuthCookies(intlResponse, request)
  } else if (rawToken && hasValidToken) {
    refreshAuthCookie(intlResponse, request, rawToken)
  }

  if (shouldLog) {
    console.log("[Proxy] Allowing request to proceed")
  }
  return intlResponse
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\..*|public).*)",
  ],
}
