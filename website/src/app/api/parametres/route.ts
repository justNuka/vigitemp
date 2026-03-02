import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuthorizationLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"
import { getRequestContext } from "@/lib/api-logger"

export const GET = withAuthorizationLogging("GERER_PROFIL", async (_req: NextRequest) => {
  try {
    const settings = await prisma.t_parametre.findMany({
      orderBy: { Mot_Cle: "asc" },
    })

    const formatted = settings.map((setting: any) => ({
      key: `${setting.Section}:${setting.Mot_Cle}`,
      section: setting.Section,
      motCle: setting.Mot_Cle,
      value: setting.Valeur || "",
      description: setting.Commentaire || null,
    }))

    return apiOk(formatted)
  } catch (error) {
    console.error("Get settings error:", error)
    return apiError(500, "settings_fetch_failed", "Failed to fetch settings")
  }
})

/**
 * PUT /api/parametres
 * Upsert d'un paramètre (admin: GERER_PROFIL).
 */
export const PUT = withAuthorizationLogging("GERER_PROFIL", async (req: NextRequest, ctx: any) => {
  try {
    const body = await req.json()
    const section = body?.section as string | undefined
    const motCle = body?.motCle as string | undefined
    const value = body?.value as string | undefined

    if (!section || !motCle) {
      return apiError(400, "missing_fields", "Section et motCle sont requis")
    }

    const { ip } = getRequestContext(req)
    const oldSetting = await prisma.t_parametre.findUnique({
      where: {
        Section_Mot_Cle: {
          Section: section,
          Mot_Cle: motCle,
        },
      },
    })

    const param = await prisma.t_parametre.upsert({
      where: {
        Section_Mot_Cle: {
          Section: section,
          Mot_Cle: motCle,
        },
      },
      update: { Valeur: value },
      create: {
        Section: section,
        Mot_Cle: motCle,
        Valeur: value,
        Commentaire: "",
      },
    })

    return apiOk({ message: "Paramètre mis à jour", param })
  } catch (error) {
    const { ip } = getRequestContext(req)
    log.error("SETTINGS", "Settings upsert failed", { user: ctx.user.username, userId: ctx.user.userId, ip, error: error instanceof Error ? error.message : String(error) })
    console.error("Update settings error:", error)
    return apiError(500, "settings_update_failed", "Erreur lors de la mise à jour")
  }
})
