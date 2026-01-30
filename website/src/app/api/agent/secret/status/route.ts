import { NextRequest } from "next/server"
import { withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { getAuthenticatedUser } from "@/lib/auth"
import { getAgentSecretStatus } from "@/lib/agent-secret-status"

export const GET = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req)
  if (!user) {
    return apiError(401, "unauthorized", "Non authentifié")
  }

  const status = await getAgentSecretStatus()
  return apiOk(status)
})
