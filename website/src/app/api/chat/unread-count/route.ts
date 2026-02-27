import { NextRequest } from "next/server"
import { prismaChat } from "@/lib/prisma-chat"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { checkChatAccess } from "@/lib/chat-guard"
import type { JWTPayload } from "@/lib/jwt"

export const GET = withAuthLogging(
  async (_req: NextRequest, ctx: { user: JWTPayload }) => {
    try {
      const guard = await checkChatAccess()
      if (!guard.ok) return guard.response

      const userId = ctx.user.userId

      const participants = await prismaChat.t_conversation_participant.findMany({
        where: { Id_Utilisateur: userId },
        select: {
          Id_Conversation: true,
          Last_Read_Msg_Id: true,
        },
      })

      const results = await Promise.all(
        participants.map((participant) => {
          const lastReadId = participant.Last_Read_Msg_Id ?? 0
          return prismaChat.t_message.findFirst({
            where: {
              Id_Conversation: participant.Id_Conversation,
              Sender_Id: { not: userId },
              Date_Suppression: null,
              Id_Message: { gt: lastReadId },
            },
            select: { Id_Message: true },
          })
        }),
      )
      const unreadCount = results.filter((r) => r !== null).length

      return apiOk({ count: unreadCount })
    } catch (error) {
      console.error("[GET /api/chat/unread-count]", error)
      return apiError(500, "unread_count_failed", "Erreur lors du comptage des messages non lus")
    }
  },
)
