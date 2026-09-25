import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { getHotlineSession } from "@/lib/hotline-auth"
import { collectSystemHealth } from "@/lib/system-health"

export async function GET(req: NextRequest) {
  const session = getHotlineSession(req)
  if (!session) {
    return apiError(401, "unauthenticated", "Non authentifie")
  }

  const health = await collectSystemHealth()

  return apiOk({
    server: health.services.server.status,
    dbMain: health.services.dbMain.status,
    dbMesure: health.services.dbMesure.status,
    dbChat: health.services.dbChat.status,
    webVersion: health.services.web.version,
    serverVersion: health.services.server.version,
  })
}
