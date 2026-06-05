import { NextRequest } from "next/server"

import { getClientIp } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { auditRouteCreate } from "@/lib/audit-route"
import { withOneOrHigherAnyAuthorizationLogging, type HandlerContext } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"

const GROUP_ACCESS_CODES = ["PARAMETRES_GERER"] as const

export const GET = withOneOrHigherAnyAuthorizationLogging(GROUP_ACCESS_CODES, async (req: NextRequest) => {
  try {
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
    log.error("groupes", "groupes_fetch_error", { error })
    return apiError(500, "groupes_fetch_failed", "Erreur lors de la recuperation des groupes")
  }
})

export const POST = withOneOrHigherAnyAuthorizationLogging(
  GROUP_ACCESS_CODES,
  async (req: NextRequest, ctx: HandlerContext) => {
    try {
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

      log.data.create("Groupe", groupe.Id_Groupe, ctx.user.username, ctx.user.userId, getClientIp(req), {
        nom,
        regroupement,
      })

      auditRouteCreate(req, ctx.user, {
        resource: "Groupe",
        resourceId: groupe.Id_Groupe,
        data: {
          Nom_Groupe: groupe.Nom_Groupe,
          Numero_Regroupement: groupe.Numero_Regroupement,
          Est_Archive: groupe.Est_Archive,
        },
        reason: `Creation groupe ${groupe.Nom_Groupe}`,
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
      log.error("groupes", "groupe_creation_error", { error })
      return apiError(500, "groupe_create_failed", "Erreur lors de la creation du groupe")
    }
  },
)
