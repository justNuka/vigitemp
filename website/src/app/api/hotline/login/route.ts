import { NextRequest } from "next/server"
import { apiError, apiOk } from "@/lib/api-response"
import { getHotlineServerConfig } from "@/lib/hotline-config"
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

const DEV_BYPASS_ENABLED =
  process.env.NODE_ENV !== "production" && process.env.HOTLINE_DEV_BYPASS !== "0"

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      slug?: string
      username?: string
      password?: string
    }

    const config = await getHotlineServerConfig()
    if (!body?.slug) {
      return apiError(400, "missing_hotline_slug", "Slug hotline manquant")
    }

    if (!config.serverHost || !config.serverPort) {
      if (!DEV_BYPASS_ENABLED) {
        return apiError(503, "hotline_server_missing", "Serveur hotline non configure")
      }
      console.warn("[HOTLINE] Dev bypass enabled: skipping C# hotline auth (server host/port missing)")
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    try {
      if (config.serverHost && config.serverPort) {
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
      }
    } catch (error) {
      if (!DEV_BYPASS_ENABLED) {
        console.error("[HOTLINE] Server login error:", error)
        return apiError(503, "hotline_server_unavailable", "Serveur hotline indisponible")
      }
      console.warn("[HOTLINE] Dev bypass enabled: C# hotline auth unavailable, login accepted")
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
    console.error("[HOTLINE] Login error:", error)
    return apiError(500, "hotline_login_failed", "Erreur serveur")
  }
}