import { NextRequest } from "next/server"
import { apiError, apiOk } from "@/lib/api-response"
import { getHotlineServerConfig } from "@/lib/hotline-config"
import { log } from "@/lib/logger"
import { getClientIp } from "@/lib/api-logger"
import { checkRateLimit } from "@/lib/rate-limiter"
import {
  createHotlineAccessToken,
  createHotlineRefreshToken,
  getHotlineAccessCookieName,
  getHotlineAccessCookieOptions,
  getHotlineRefreshCookieName,
  getHotlineRefreshCookieOptions,
} from "@/lib/hotline-auth"

type HotlineServerLoginResponse = {
  ok: boolean
  error?: string
  message?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      slug?: string
      username?: string
      password?: string
    }

    const rateLimit = checkRateLimit(`hotline_login:${getClientIp(req)}`, 10, 15 * 60_000)
    if (!rateLimit.allowed) {
      return apiError(429, "too_many_requests", "Trop de tentatives. Réessayez plus tard.")
    }

    const config = await getHotlineServerConfig()
    if (!body?.slug) {
      return apiError(400, "missing_hotline_slug", "Slug hotline manquant")
    }

    if (!config.serverHost || !config.serverPort) {
      return apiError(503, "hotline_server_missing", "Serveur hotline non configure")
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    try {
      const response = await fetch(
        `http://${config.serverHost}:${config.serverPort}/api/hotline/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: body.slug,
            username: body.username,
            password: body.password,
          }),
          signal: controller.signal,
        },
      )
      const serverResponse = (await response.json()) as HotlineServerLoginResponse
      if (!response.ok || !serverResponse?.ok) {
        return apiError(401, "invalid_credentials", "Identifiants invalides")
      }
    } catch (error) {
      log.warn("hotline/login", "hotline_server_unavailable", { error })
      return apiError(503, "hotline_server_unavailable", "Serveur hotline indisponible")
    } finally {
      clearTimeout(timeout)
    }

    const user = body.username || "hotline"
    const accessToken = createHotlineAccessToken({ username: user })
    const refreshToken = createHotlineRefreshToken({ username: user })

    const response = apiOk({ success: true })
    response.cookies.set(getHotlineAccessCookieName(), accessToken, getHotlineAccessCookieOptions(req))
    response.cookies.set(getHotlineRefreshCookieName(), refreshToken, getHotlineRefreshCookieOptions(req))
    return response
  } catch (error) {
    log.error("hotline/login", "hotline_login_error", { error })
    return apiError(500, "hotline_login_failed", "Erreur serveur")
  }
}