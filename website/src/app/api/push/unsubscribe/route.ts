import { NextRequest } from "next/server"
import { withLogging } from "@/lib/api-logger"
import { apiError } from "@/lib/api-response"

export const POST = withLogging(async (_req: NextRequest) => {
  return apiError(410, "web_push_disabled", "Web push désactivé")
})
