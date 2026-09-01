import { NextRequest } from "next/server"

import { withAdminLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { log } from "@/lib/logger"
import { getActiveUserSessionThreshold } from "@/lib/license-user-limit"

/**
 * GET /api/admin/utilisateurs-connectes?page=1&limit=10
 * Retourne les utilisateurs connectés (dernière connexion récente)
 */
export const GET = withAdminLogging(async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1", 10)
    const rawLimit = parseInt(searchParams.get("limit") || "10", 10)
    const limit = Math.min(Math.max(rawLimit, 1), 10)
    const skip = (page - 1) * limit

    const activeSince = getActiveUserSessionThreshold()
    const where = {
      Est_Archive: false,
      Date_Heure_Derniere_Connexion: { gte: activeSince },
    }

    const totalCount = await prisma.t_utilisateur.count({ where })
    const total = Math.min(totalCount, 50)

    if (skip >= total) {
      return apiOk({
        data: [],
        pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
      })
    }

    const connectedUsers = await prisma.t_utilisateur.findMany({
      where,
      select: {
        Id_Utilisateur: true,
        Login: true,
        Nom: true,
        Prenom: true,
        Adresse_IP_Connexion: true,
        Profil_Utilisateur: true,
        Date_Heure_Derniere_Connexion: true,
      },
      orderBy: { Date_Heure_Derniere_Connexion: "desc" },
      skip,
      take: Math.min(limit, 50 - skip),
    })

    const formatted = connectedUsers.map((user) => ({
      id: String(user.Id_Utilisateur),
      login: user.Login || "Unknown",
      nom: user.Nom || "",
      prenom: user.Prenom || "",
      poste: user.Profil_Utilisateur || "Unknown",
      ip: user.Adresse_IP_Connexion || "Unknown",
    }))

    return apiOk({
      data: formatted,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    })
  } catch (error) {
    log.error("admin/utilisateurs-connectes", "error_fetching_connected_users", { error: error });
    return apiError(500, "internal_error", "Failed to fetch connected users")
  }
})
