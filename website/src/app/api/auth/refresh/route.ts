import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { shouldUseSecureCookies } from "@/lib/cookie-security"
import {
  ACCESS_COOKIE_MAX_AGE_SECONDS,
  REFRESH_COOKIE_MAX_AGE_SECONDS,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/lib/jwt"

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh-token")?.value
  if (!refreshToken) {
    return apiError(401, "refresh_missing", "Session expirée")
  }

  const payload = verifyRefreshToken(refreshToken)
  if (!payload) {
    const response = apiError(401, "refresh_invalid", "Session expirée")
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
    return response
  }

  const nextAccessToken = generateAccessToken({
    userId: payload.userId,
    username: payload.username,
    profile: payload.profile,
    authorizations: payload.authorizations ?? [],
  })

  // Rotate refresh token for better security.
  const nextRefreshToken = generateRefreshToken({
    userId: payload.userId,
    username: payload.username,
    profile: payload.profile,
  })

  const response = apiOk({ success: true })
  response.cookies.set("auth-token", nextAccessToken, {
    httpOnly: true,
    secure: shouldUseSecureCookies(req),
    sameSite: "lax",
    maxAge: ACCESS_COOKIE_MAX_AGE_SECONDS,
    path: "/",
  })
  response.cookies.set("refresh-token", nextRefreshToken, {
    httpOnly: true,
    secure: shouldUseSecureCookies(req),
    sameSite: "lax",
    maxAge: REFRESH_COOKIE_MAX_AGE_SECONDS,
    path: "/",
  })

  return response
}
