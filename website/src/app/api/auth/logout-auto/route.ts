import { NextRequest } from "next/server"

import { getRequestContext, withLogging } from "@/lib/api-logger"
import { apiOk } from "@/lib/api-response"
import { getAuthenticatedUser } from "@/lib/auth"
import { log } from "@/lib/logger"
import { shouldUseSecureCookies } from "@/lib/cookie-security"

export const POST = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req)
  const { ip } = getRequestContext(req)

  const response = apiOk({ success: true })
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
    log.auth.logout(user.username, user.userId, ip, "Auto logout (inactivity)", {
      userProfile: user.profile,
    })
  }

  return response
})
