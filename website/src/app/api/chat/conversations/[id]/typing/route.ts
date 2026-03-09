import { NextRequest } from "next/server"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { checkChatAccess, verifyParticipant } from "@/lib/chat-guard"
import { setTyping, clearTyping } from "@/lib/chat-typing-store"
import { z } from "zod"
import type { JWTPayload } from "@/lib/jwt"
import { log } from "@/lib/logger"

const bodySchema = z.object({ isTyping: z.boolean() })
type RouteParams = { params: Promise<{ id: string }> }

export const POST = withAuthLogging(
  async (req: NextRequest, ctx: { user: JWTPayload }, { params }: RouteParams) => {
    try {
      const guard = await checkChatAccess()
      if (!guard.ok) return guard.response

      const { id: idParam } = await params
      const convId = parseInt(idParam, 10)
      if (isNaN(convId) || convId <= 0) return apiError(400, "invalid_id", "ID invalide")

      const userId = ctx.user.userId
      const isMember = await verifyParticipant(convId, userId)
      if (!isMember) return apiError(403, "not_participant", "Non membre")

      const body: unknown = await req.json()
      const parsed = bodySchema.safeParse(body)
      if (!parsed.success) return apiError(400, "validation_error", "Données invalides")

      if (parsed.data.isTyping) {
        setTyping(convId, userId)
      } else {
        clearTyping(convId, userId)
      }

      return apiOk({ ok: true })
    } catch (error) {
      log.error("chat/typing", "typing_error", { error })
      return apiError(500, "typing_failed", "Erreur typing")
    }
  }
)
