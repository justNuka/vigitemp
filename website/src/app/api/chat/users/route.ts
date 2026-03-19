import { NextRequest } from "next/server"

import { withAnyAuthorizationLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { log } from "@/lib/logger"
import { getPermissionAliases } from "@/lib/permissions"
import { getUserAvatarMap } from "@/lib/user-avatar-db"

export const GET = withAnyAuthorizationLogging(
  getPermissionAliases("CONVERSATION_ACCESS"),
  async (_req: NextRequest) => {
    try {
      const users = await prisma.t_utilisateur.findMany({
        where: { Est_Archive: false },
        orderBy: [{ Prenom: "asc" }, { Nom: "asc" }, { Login: "asc" }],
        select: {
          Id_Utilisateur: true,
          Login: true,
          Prenom: true,
          Nom: true,
          Profil_Utilisateur: true,
          Est_Archive: true,
          Date_Creation: true,
          Adresse_Email: true,
        },
      })

      const avatarMap = await getUserAvatarMap(users.map((user) => user.Id_Utilisateur))

      return apiOk(
        users.map((user) => ({
          id: user.Id_Utilisateur,
          username: user.Login,
          displayName: `${user.Prenom || ""} ${user.Nom || ""}`.trim() || user.Login,
          role: user.Profil_Utilisateur || "user",
          status: "active" as const,
          createdAt: user.Date_Creation?.toISOString() || null,
          email: user.Adresse_Email || null,
          avatar: avatarMap.get(user.Id_Utilisateur) ?? null,
        })),
      )
    } catch (error) {
      log.error("chat/users", "chat_users_fetch_failed", { error })
      return apiError(500, "chat_users_fetch_failed", "Erreur lors du chargement des utilisateurs")
    }
  },
)
