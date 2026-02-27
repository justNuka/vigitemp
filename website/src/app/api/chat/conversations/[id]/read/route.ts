import { NextRequest, NextResponse } from "next/server"
import { prismaChat } from "@/lib/prisma-chat"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError } from "@/lib/api-response"
import { checkChatAccess, verifyParticipant } from "@/lib/chat-guard"
import type { JWTPayload } from "@/lib/jwt"

type RouteParams = { params: Promise<{ id: string }> }

export const POST = withAuthLogging(
  async (_req: NextRequest, ctx: { user: JWTPayload }, { params }: RouteParams) => {
    try {
      const guard = await checkChatAccess(ctx.user)
      if (!guard.ok) return guard.response

      const { id: idParam } = await params
      const convId = parseInt(idParam, 10)

      if (isNaN(convId) || convId <= 0) {
        return apiError(400, "invalid_id", "ID de conversation invalide")
      }

      const userId = ctx.user.userId
      const isMember = await verifyParticipant(convId, userId)
      if (!isMember) {
        return apiError(403, "not_participant", "Vous n'etes pas membre de cette conversation")
      }

      const lastMessage = await prismaChat.t_message.findFirst({
        where: {
          Id_Conversation: convId,
          Date_Suppression: null,
        },
        orderBy: { Id_Message: "desc" },
        select: { Id_Message: true },
      })

      if (lastMessage !== null) {
        await prismaChat.t_conversation_participant.update({
          where: {
            Id_Conversation_Id_Utilisateur: {
              Id_Conversation: convId,
              Id_Utilisateur: userId,
            },
          },
          data: {
            Last_Read_Msg_Id: lastMessage.Id_Message,
          },
        })
      }

      return new NextResponse(null, { status: 204 })
    } catch (error) {
      console.error("[POST /api/chat/conversations/[id]/read]", error)
      return apiError(500, "read_update_failed", "Erreur lors de la mise a jour de la lecture")
    }
  },
)
