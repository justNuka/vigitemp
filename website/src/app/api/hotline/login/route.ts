import { NextRequest, NextResponse } from "next/server"
import { apiError, apiOk } from "@/lib/api-response"
import { getHotlineConfig } from "@/lib/hotline-config"
import { createHotlineToken, getHotlineCookieName, getHotlineCookieOptions } from "@/lib/hotline-auth"

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

    const config = await getHotlineConfig()
    if (!config.slug) {
      return apiError(503, "hotline_not_configured", "Hotline non configuree")
    }

    if (!body?.slug || body.slug !== config.slug) {
      return apiError(401, "invalid_hotline_slug", "Acces refuse")
    }

    if (!config.serverHost || !config.serverPort) {
      return apiError(503, "hotline_server_missing", "Serveur hotline non configure")
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)
    let serverResponse: HotlineServerLoginResponse | null = null

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
        }
      )
      serverResponse = (await response.json()) as HotlineServerLoginResponse
      if (!response.ok || !serverResponse?.ok) {
        return apiError(401, "invalid_credentials", "Identifiants invalides")
      }
    } catch (error) {
      console.error("[HOTLINE] Server login error:", error)
      return apiError(503, "hotline_server_unavailable", "Serveur hotline indisponible")
    } finally {
      clearTimeout(timeout)
    }

    const token = createHotlineToken({ username: body.username || "hotline" })
    const response = apiOk({ success: true })
    response.cookies.set(getHotlineCookieName(), token, getHotlineCookieOptions(req))
    return response
  } catch (error) {
    console.error("[HOTLINE] Login error:", error)
    return apiError(500, "hotline_login_failed", "Erreur serveur")
  }
}
