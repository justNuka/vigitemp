import { NextRequest } from "next/server"
import { withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { getHotlineSession } from "@/lib/hotline-auth"
import { getAgentSecretStatus } from "@/lib/agent-secret-status"

export const GET = withLogging(async (req: NextRequest) => {
  const session = getHotlineSession(req)
  if (!session) {
    return apiError(401, "unauthorized", "Non autorisé")
  }

  const status = await getAgentSecretStatus()
  return apiOk(status)
})
