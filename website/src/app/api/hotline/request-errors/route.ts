import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { getHotlineSession } from "@/lib/hotline-auth"
import { readRequestErrors } from "@/lib/request-error-store"

export async function GET(req: NextRequest) {
  const session = getHotlineSession(req)
  if (!session) {
    return apiError(401, "unauthenticated", "Non authentifie")
  }

  const { searchParams } = new URL(req.url)
  const limitRaw = searchParams.get("limit")
  const limit = limitRaw ? Number(limitRaw) : 200
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 1000) : 200

  try {
    const items = await readRequestErrors(safeLimit)
    return apiOk({ items })
  } catch {
    return apiOk({ items: [] })
  }
}