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

  try {
    await appendBetterAuthSignOutHeaders(response, req.headers)
  } catch (error) {
    // Un échec Better Auth ne doit pas empêcher la suppression des cookies legacy.
    log.warn("AUTH", "Failed to revoke Better Auth session during manual logout", {
      error: error instanceof Error ? error.message : String(error),
    })
  }

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

  if (user) {
    log.auth.logout(user.username, user.userId, ip, "Manual logout", {
      userProfile: user.profile,
    })
  }

  return response
})
