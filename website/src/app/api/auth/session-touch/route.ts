import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { getVigiSensysBetterAuth, isBetterAuthRuntimeEnabled } from "@/lib/better-auth/auth"
import { appendBetterAuthResponseHeaders } from "@/lib/better-auth/response-headers"

export async function POST(req: NextRequest) {
  if (!isBetterAuthRuntimeEnabled()) {
    return apiOk({ success: true, engine: "legacy" as const })
  }

  try {
    const result = await getVigiSensysBetterAuth().api.getSession({
      headers: req.headers,
      returnHeaders: true,
      query: { disableCookieCache: true },
    })

    if (!result.response) {
      return apiError(401, "session_expired", "Session expirée")
    }

    const response = apiOk({
      success: true,
      engine: "better-auth" as const,
      expiresAt: result.response.session.expiresAt,
    })
    appendBetterAuthResponseHeaders(response, result.headers)
    return response
  } catch {
    return apiError(401, "session_expired", "Session expirée")
  }
}
