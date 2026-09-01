import { NextRequest } from "next/server"
import { prismaChat } from "@/lib/prisma-chat"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { checkChatAccess } from "@/lib/chat-guard"
import { z } from "zod"
import type { JWTPayload } from "@/lib/jwt"
import { log } from "@/lib/logger"

const groupBodySchema = z.object({
  titre: z.string().min(1).max(128),
  participantIds: z.array(z.number().int().positive()).min(1).max(50),
})

export const POST = withAuthLogging(
  async (req: NextRequest, ctx: { user: JWTPayload }) => {
    try {
      const guard = await checkChatAccess()
      if (!guard.ok) return guard.response

      const userId = ctx.user.userId

      const body: unknown = await req.json()
      const parsed = groupBodySchema.safeParse(body)

      if (!parsed.success) {
        return apiError(400, "validation_error", "Donnees invalides", { issues: parsed.error.issues })
      }

      const { titre, participantIds } = parsed.data

      const allParticipantIds = Array.from(new Set([userId, ...participantIds]))

      const created = await prismaChat.t_conversation.create({
        data: {
          Type: "group",
          Titre: titre,
          participants: {
            create: allParticipantIds.map((id) => ({ Id_Utilisateur: id })),
          },
        },
        select: {
          Id_Conversation: true,
          Type: true,
          Titre: true,
        },
      })

      return apiOk({
        id: created.Id_Conversation,
        type: created.Type,
        titre: created.Titre,
      })
    } catch (error) {
      log.error("chat/conversations/group", "group_conversation_create_error", { error: error });
      return apiError(500, "group_conversation_failed", "Erreur lors de la creation du groupe de conversation")
    }
  },
)
