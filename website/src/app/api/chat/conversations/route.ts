import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { prismaChat } from "@/lib/prisma-chat"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { checkChatAccess } from "@/lib/chat-guard"
import { getInitialsForAvatar, resolveAvatarSrc } from "@/lib/avatar-library"
import { getUserAvatarMap } from "@/lib/user-avatar-db"
import type { JWTPayload } from "@/lib/jwt"

type UserInfo = {
  id: number
  name: string
  initials: string
  avatarSrc: string | null
}

type ConversationItem = {
  id: number
  type: string
  name: string
  dmKey: string | null
  lastMessage: {
    id: number
    content: string
    senderId: number
    senderName: string
    createdAt: string
  } | null
  unreadCount: number
}

export const GET = withAuthLogging(
  async (_req: NextRequest, ctx: { user: JWTPayload }) => {
    try {
      const guard = await checkChatAccess(ctx.user)
      if (!guard.ok) return guard.response

      const userId = ctx.user.userId

      const participantRows = await prismaChat.t_conversation_participant.findMany({
        where: { Id_Utilisateur: userId },
        include: {
          conversation: {
            include: {
              participants: {
                select: {
                  Id_Utilisateur: true,
                },
              },
              messages: {
                where: { Date_Suppression: null },
                orderBy: { Id_Message: "desc" },
                take: 1,
                select: {
                  Id_Message: true,
                  Contenu: true,
                  Sender_Id: true,
                  Date_Creation: true,
                },
              },
            },
          },
        },
      })

      const allUserIds = new Set<number>()
      for (const row of participantRows) {
        for (const p of row.conversation.participants) {
          allUserIds.add(p.Id_Utilisateur)
        }
      }

      const userIdList = Array.from(allUserIds)

      const dbUsers = await prisma.t_utilisateur.findMany({
        where: { Id_Utilisateur: { in: userIdList } },
        select: {
          Id_Utilisateur: true,
          Login: true,
          Prenom: true,
          Nom: true,
        },
      })

      const avatarMap = await getUserAvatarMap(userIdList)

      const userMap = new Map<number, UserInfo>()
      for (const u of dbUsers) {
        const initials = getInitialsForAvatar(u.Prenom, u.Nom, u.Login)
        const avatarValue = avatarMap.get(u.Id_Utilisateur) ?? null
        const avatarSrc = resolveAvatarSrc(avatarValue, initials)
        userMap.set(u.Id_Utilisateur, {
          id: u.Id_Utilisateur,
          name: (`${u.Prenom ?? ""} ${u.Nom ?? ""}`.trim()) || (u.Login ?? `User ${u.Id_Utilisateur}`),
          initials,
          avatarSrc,
        })
      }

      const conversations: ConversationItem[] = participantRows.map((row) => {
        const conv = row.conversation
        const otherParticipants = conv.participants.filter((p) => p.Id_Utilisateur !== userId)

        let name: string
        if (conv.Type === "dm" && otherParticipants.length > 0) {
          const otherId = otherParticipants[0].Id_Utilisateur
          name = userMap.get(otherId)?.name ?? `User ${otherId}`
        } else {
          name = conv.Titre ?? "Conversation"
        }

        const lastMsg = conv.messages[0] ?? null
        const senderInfo = lastMsg ? userMap.get(lastMsg.Sender_Id) : null

        return {
          id: conv.Id_Conversation,
          type: conv.Type,
          name,
          dmKey: conv.DM_Key,
          lastMessage: lastMsg
            ? {
                id: lastMsg.Id_Message,
                content: lastMsg.Contenu,
                senderId: lastMsg.Sender_Id,
                senderName: senderInfo?.name ?? `User ${lastMsg.Sender_Id}`,
                createdAt: lastMsg.Date_Creation.toISOString(),
              }
            : null,
          unreadCount: 0,
        }
      })

      conversations.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt ?? ""
        const bTime = b.lastMessage?.createdAt ?? ""
        return bTime.localeCompare(aTime)
      })

      return apiOk(conversations)
    } catch (error) {
      console.error("[GET /api/chat/conversations]", error)
      return apiError(500, "conversations_fetch_failed", "Erreur lors de la recuperation des conversations")
    }
  },
)
