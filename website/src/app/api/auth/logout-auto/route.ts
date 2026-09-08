import { NextRequest } from "next/server"

import { getRequestContext, withLogging } from "@/lib/api-logger"
import { apiOk } from "@/lib/api-response"
import { getAuthenticatedUser } from "@/lib/auth"
import { appendBetterAuthSignOutHeaders } from "@/lib/better-auth/session"
import { log } from "@/lib/logger"
import { shouldUseSecureCookies } from "@/lib/cookie-security"

export const POST = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req)
  const { ip } = getRequestContext(req)

  const response = apiOk({ success: true })

  response.cookies.set("token", "", {
    httpOnly: true,
    secure: shouldUseSecureCookies(req),
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })

  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: shouldUseSecureCookies(req),
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })

  response.cookies.set("refresh-token", "", {
    httpOnly: true,
    secure: shouldUseSecureCookies(req),
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })

  // Ajouter les Set-Cookie Better Auth en dernier : NextResponse.cookies peut réécrire
  // l'en-tête Set-Cookie lors des suppressions de cookies legacy.
  try {
    await appendBetterAuthSignOutHeaders(response, req.headers)
  } catch (error) {
    // L'auto-logout doit rester effectif même si la révocation Better Auth échoue.
    log.warn("AUTH", "Failed to revoke Better Auth session during auto logout", {
      error: error instanceof Error ? error.message : String(error),
    })
  }

  if (user) {
    log.auth.logout(user.username, user.userId, ip, "Auto logout (inactivity)", {
      userProfile: user.profile,
    })
  }

  return response
})
