import { NextRequest } from "next/server"

import { apiOk } from "@/lib/api-response"
import { withAnyAuthorizationLogging } from "@/lib/api-wrappers"
import { presenceVigilogAgent } from "@/lib/vigilog-agent"
import { VIGILOG_ACCESS_CODES } from "../../_shared"

export const GET = withAnyAuthorizationLogging(VIGILOG_ACCESS_CODES, async (_req: NextRequest) => {
  try {
    const response = await presenceVigilogAgent()
    return apiOk(response)
  } catch {
    return apiOk({
      res: false,
      details: "Presence check unavailable",
      step: null,
    })
  }
})
