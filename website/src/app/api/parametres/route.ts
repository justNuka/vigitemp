import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuthorizationLogging, type HandlerContext } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"
import { getRequestContext } from "@/lib/api-logger"
import { buildAuditChanges } from "@/lib/audit-route"
import { filterParametersForLicense, requireParameterLicense } from "@/lib/parameter-license-guards"

export const GET = withAuthorizationLogging("PARAMETRES_GERER", async (_req: NextRequest) => {
  try {
    const settings = await prisma.t_parametre.findMany({
      orderBy: { Mot_Cle: "asc" },
    })

    const formatted = settings.map((setting) => ({
      key: `${setting.Section}:${setting.Mot_Cle}`,
      section: setting.Section,
      motCle: setting.Mot_Cle,
      value: setting.Valeur || "",
      description: setting.Commentaire || null,
    }))

    return apiOk(await filterParametersForLicense(formatted))
  } catch (error) {
    log.error("parametres", "get_settings_error", { error })
    return apiError(500, "settings_fetch_failed", "Failed to fetch settings")
  }
})

/**
 * PUT /api/parametres
 * Upsert d'un paramètre.
 */
export const PUT = withAuthorizationLogging("PARAMETRES_GERER", async (req: NextRequest, ctx: HandlerContext) => {
  try {
    const body = await req.json()
    const section = body?.section as string | undefined
    const motCle = body?.motCle as string | undefined
    const value = body?.value as string | undefined

    if (!section || !motCle) {
      return apiError(400, "missing_fields", "Section et motCle sont requis")
    }

    const licenseError = await requireParameterLicense(section, motCle)
    if (licenseError) return licenseError

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

    log.config.change(
      `${param.Section}:${param.Mot_Cle}`,
      ctx.user.username,
      ctx.user.userId,
      ip,
      oldSetting?.Valeur ?? "N/A",
      value ?? "",
    )
    log.audit("CC", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      userProfile: ctx.user.profile,
      ip,
      resource: `Parametre: ${param.Section}:${param.Mot_Cle}`,
      resourceId: `${param.Section}:${param.Mot_Cle}`,
      changes: {
        action: oldSetting ? "update" : "create",
        ...buildAuditChanges(
          { value: oldSetting?.Valeur ?? null },
          { value: value ?? null },
          ["value"],
        ),
      },
    })

    return apiOk({ message: "Paramètre mis à jour", param })
  } catch (error) {
    const { ip } = getRequestContext(req)
    log.error("SETTINGS", "Settings upsert failed", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      error: error instanceof Error ? error.message : String(error),
    })
    return apiError(500, "settings_update_failed", "Erreur lors de la mise à jour")
  }
})
