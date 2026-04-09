import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth"
import { getClientIp, withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"

export const GET = withLogging(async (req: NextRequest) => {
  try {
    const user = getAuthenticatedUser(req)
    if (!user) {
      return apiError(401, "unauthenticated", "Non authentifié")
    }

    const { searchParams } = new URL(req.url)
    const regroupement = searchParams.get("regroupement")

    const where: Record<string, unknown> = {}

    if (regroupement) {
      where.Numero_Regroupement = regroupement
    }

    const groupes = await prisma.t_groupe.findMany({
      where,
      select: {
        Id_Groupe: true,
        Nom_Groupe: true,
        Numero_Regroupement: true,
        Est_Archive: true,
        t_lieu_groupe: {
          where: { t_lieu: { Est_Archive: false } },
          select: { Id_Lieu: true },
        },
        t_liaison_utilisateur_groupe: {
          where: { t_utilisateur: { Est_Archive: false } },
          select: { Id_Utilisateur: true },
        },
      },
      orderBy: {
        Nom_Groupe: "asc",
      },
    })

    const groupesWithCounts = groupes.map((groupe) => ({
      Id_Groupe: groupe.Id_Groupe,
      Nom_Groupe: groupe.Nom_Groupe,
      Numero_Regroupement: groupe.Numero_Regroupement,
      Est_Archive: groupe.Est_Archive,
      nombre_lieux: groupe.t_lieu_groupe.length,
      nombre_utilisateurs: groupe.t_liaison_utilisateur_groupe.length,
    }))

    return apiOk(groupesWithCounts)
  } catch (error) {
    log.error("groupes", "groupes_fetch_error", { error: error });
    return apiError(500, "groupes_fetch_failed", "Erreur lors de la récupération des groupes")
  }
})

export const POST = withLogging(async (req: NextRequest) => {
  try {
    const user = getAuthenticatedUser(req)
    if (!user) {
      return apiError(401, "unauthenticated", "Non authentifié")
    }

    const body = await req.json()
    const { nom, regroupement } = body

    if (!nom || !regroupement) {
      return apiError(400, "missing_fields", "Nom et regroupement sont obligatoires")
    }

    const groupe = await prisma.t_groupe.create({
      data: {
        Nom_Groupe: nom,
        Numero_Regroupement: regroupement,
      },
    })

    log.data.create("Groupe", groupe.Id_Groupe, user.username, user.userId, getClientIp(req), {
      nom,
      regroupement,
    })

    return apiOk({
      Id_Groupe: groupe.Id_Groupe,
      Nom_Groupe: groupe.Nom_Groupe,
      Numero_Regroupement: groupe.Numero_Regroupement,
      Est_Archive: groupe.Est_Archive,
      nombre_lieux: 0,
      nombre_utilisateurs: 0,
    })
  } catch (error) {
    log.error("groupes", "groupe_creation_error", { error: error });
    return apiError(500, "groupe_create_failed", "Erreur lors de la création du groupe")
  }
})
