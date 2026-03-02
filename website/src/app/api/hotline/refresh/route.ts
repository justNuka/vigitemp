import { NextRequest } from "next/server"
import { apiError, apiOk } from "@/lib/api-response"
import {
  createHotlineAccessToken,
  createHotlineRefreshToken,
  getHotlineAccessCookieName,
  getHotlineAccessCookieOptions,
  getHotlineRefreshCookieName,
  getHotlineRefreshCookieOptions,
  getHotlineRefreshSession,
} from "@/lib/hotline-auth"

export async function POST(req: NextRequest) {
  const session = getHotlineRefreshSession(req)
  if (!session) {
    return apiError(401, "refresh_invalid", "Session hotline expiree")
  }

  const nextAccessToken = createHotlineAccessToken({ username: session.username })
  const nextRefreshToken = createHotlineRefreshToken({ username: session.username })

  const response = apiOk({ success: true })
  response.cookies.set(getHotlineAccessCookieName(), nextAccessToken, getHotlineAccessCookieOptions(req))
  response.cookies.set(getHotlineRefreshCookieName(), nextRefreshToken, getHotlineRefreshCookieOptions(req))
  return response
}