import { NextRequest } from "next/server"
import { prismaChat } from "@/lib/prisma-chat"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { checkChatAccess } from "@/lib/chat-guard"
import { z } from "zod"
import type { JWTPayload } from "@/lib/jwt"

const directBodySchema = z.object({
  targetUserId: z.number().int().positive(),
})

export const POST = withAuthLogging(
  async (req: NextRequest, ctx: { user: JWTPayload }) => {
    try {
      const guard = await checkChatAccess(ctx.user)
      if (!guard.ok) return guard.response

      const userId = ctx.user.userId

      const body: unknown = await req.json()
      const parsed = directBodySchema.safeParse(body)

      if (!parsed.success) {
        return apiError(400, "validation_error", "Donnees invalides", { issues: parsed.error.issues })
      }

      const { targetUserId } = parsed.data

      if (targetUserId === userId) {
        return apiError(400, "self_message", "Impossible d'envoyer un message a soi-meme")
      }

      const dmKey = [userId, targetUserId].sort((a, b) => a - b).join("_")

      const existing = await prismaChat.t_conversation.findUnique({
        where: { DM_Key: dmKey },
        select: {
          Id_Conversation: true,
          Type: true,
          DM_Key: true,
        },
      })

      if (existing !== null) {
        return apiOk({
          id: existing.Id_Conversation,
          type: existing.Type,
          dmKey: existing.DM_Key,
        })
      }

      const created = await prismaChat.t_conversation.create({
        data: {
          Type: "dm",
          DM_Key: dmKey,
          participants: {
            create: [
              { Id_Utilisateur: userId },
              { Id_Utilisateur: targetUserId },
            ],
          },
        },
        select: {
          Id_Conversation: true,
          Type: true,
          DM_Key: true,
        },
      })

      return apiOk({
        id: created.Id_Conversation,
        type: created.Type,
        dmKey: created.DM_Key,
      })
    } catch (error) {
      console.error("[POST /api/chat/conversations/direct]", error)
      return apiError(500, "direct_conversation_failed", "Erreur lors de la creation de la conversation directe")
    }
  },
)
