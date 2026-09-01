import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { prismaChat } from "@/lib/prisma-chat"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { checkChatAccess, verifyParticipant } from "@/lib/chat-guard"
import { getInitialsForAvatar, resolveAvatarSrc } from "@/lib/avatar-library"
import { getUserAvatarMap } from "@/lib/user-avatar-db"
import type { JWTPayload } from "@/lib/jwt"
import { log } from "@/lib/logger"

type RouteParams = { params: Promise<{ id: string }> }

export const GET = withAuthLogging(
  async (_req: NextRequest, ctx: { user: JWTPayload }, { params }: RouteParams) => {
    try {
      const guard = await checkChatAccess()
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

      const conversation = await prismaChat.t_conversation.findUnique({
        where: { Id_Conversation: convId },
        select: {
          Id_Conversation: true,
          Type: true,
          Titre: true,
          Date_Creation: true,
          participants: {
            select: {
              Id_Utilisateur: true,
              Date_Ajout: true,
            },
          },
        },
      })

      if (!conversation) {
        return apiError(404, "not_found", "Conversation introuvable")
      }

      const participantIds = conversation.participants.map((p) => p.Id_Utilisateur)

      const [dbUsers, avatarMap] = await Promise.all([
        prisma.t_utilisateur.findMany({
          where: { Id_Utilisateur: { in: participantIds } },
          select: {
            Id_Utilisateur: true,
            Login: true,
            Prenom: true,
            Nom: true,
            Adresse_Email: true,
            Tel_Num_Mobile: true,
            Tel_Num_Fixe: true,
            Date_Creation: true,
            Profil_Utilisateur: true,
          },
        }),
        getUserAvatarMap(participantIds),
      ])

      const joinedAtMap = new Map(
        conversation.participants.map((p) => [p.Id_Utilisateur, p.Date_Ajout.toISOString()])
      )

      const participants = dbUsers.map((u) => {
        const initials = getInitialsForAvatar(u.Prenom, u.Nom, u.Login)
        const avatarValue = avatarMap.get(u.Id_Utilisateur) ?? null
        const avatar = resolveAvatarSrc(avatarValue, initials)
        const displayName =
          (`${u.Prenom ?? ""} ${u.Nom ?? ""}`.trim()) || (u.Login ?? `User ${u.Id_Utilisateur}`)
        return {
          id: u.Id_Utilisateur,
          displayName,
          username: u.Login ?? "",
          email: u.Adresse_Email ?? null,
          avatar,
          role: u.Profil_Utilisateur ?? null,
          phoneMobile: u.Tel_Num_Mobile ?? null,
          phoneFixed: u.Tel_Num_Fixe ?? null,
          createdAt: u.Date_Creation?.toISOString() ?? null,
          joinedAt: joinedAtMap.get(u.Id_Utilisateur) ?? conversation.Date_Creation.toISOString(),
        }
      })

      return apiOk({
        id: conversation.Id_Conversation,
        type: conversation.Type as "dm" | "group",
        titre: conversation.Titre ?? null,
        createdAt: conversation.Date_Creation.toISOString(),
        participants,
      })
    } catch (error) {
      log.error("chat/conversations/details", "details_fetch_error", { error })
      return apiError(500, "details_fetch_failed", "Erreur lors de la récupération des détails")
    }
  },
)
