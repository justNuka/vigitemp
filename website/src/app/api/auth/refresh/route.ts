import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { shouldUseSecureCookies } from "@/lib/cookie-security"
import {
  ACCESS_COOKIE_MAX_AGE_SECONDS,
  REFRESH_COOKIE_MAX_AGE_SECONDS,
  generateAccessToken,
  generateRefreshToken,
  getRefreshSessionExpiresAt,
  verifyRefreshToken,
} from "@/lib/jwt"
import { getUserAuthorizationCodes } from "@/lib/authz"

function clearAuthCookies(req: NextRequest, response: ReturnType<typeof apiError>) {
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

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh-token")?.value
  if (!refreshToken) {
    return apiError(401, "refresh_missing", "Session expirée")
  }

  const payload = verifyRefreshToken(refreshToken)
  if (!payload) {
    return clearAuthCookies(req, apiError(401, "refresh_invalid", "Session expirée"))
  }

  const sessionExpiresAt = getRefreshSessionExpiresAt(payload)
  const nowSeconds = Math.floor(Date.now() / 1000)
  const remainingSessionSeconds = sessionExpiresAt === null ? 0 : sessionExpiresAt - nowSeconds

  if (remainingSessionSeconds <= 0 || sessionExpiresAt === null) {
    return clearAuthCookies(req, apiError(401, "session_expired", "Session expirée"))
  }

  let authorizations = payload.authorizations ?? []
  try {
    authorizations = await getUserAuthorizationCodes(payload.userId)
  } catch {
    // If the main database is temporarily unavailable, keep the signed claims
    // already present in the refresh token instead of dropping permissions.
  }

  const nextAccessToken = generateAccessToken(
    {
      userId: payload.userId,
      username: payload.username,
      profile: payload.profile,
      authorizations,
    },
    sessionExpiresAt,
  )

  // Rotate le refresh token sans repousser la fin absolue de la session.
  const nextRefreshToken = generateRefreshToken(
    {
      userId: payload.userId,
      username: payload.username,
      profile: payload.profile,
      authorizations,
    },
    sessionExpiresAt,
  )

  const response = apiOk({ success: true })
  response.cookies.set("auth-token", nextAccessToken, {
    httpOnly: true,
    secure: shouldUseSecureCookies(req),
    sameSite: "lax",
    maxAge: Math.min(ACCESS_COOKIE_MAX_AGE_SECONDS, remainingSessionSeconds),
    path: "/",
  })
  response.cookies.set("refresh-token", nextRefreshToken, {
    httpOnly: true,
    secure: shouldUseSecureCookies(req),
    sameSite: "lax",
    maxAge: Math.min(REFRESH_COOKIE_MAX_AGE_SECONDS, remainingSessionSeconds),
    path: "/",
  })

  return response
}
