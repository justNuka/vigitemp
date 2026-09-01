import { NextRequest } from "next/server"
import { revalidateTag } from "next/cache"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { log } from "@/lib/logger"
import { getRequestContext } from "@/lib/api-logger"
import { withAuthorizationLogging, type HandlerContext } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { buildAuditChanges } from "@/lib/audit-route"
import { requireParameterLicense } from "@/lib/parameter-license-guards"

const updateSettingSchema = z.object({
  value: z.string(),
})

const OPTIONAL_SETTING_DEFAULTS = new Map([
  ["tools:assigned_standard_serial", ""],
])

function getCaseCandidates(section: string, motCle: string) {
  const sectionLower = section.toLowerCase()
  const sectionUpper = section.toUpperCase()
  const motCleLower = motCle.toLowerCase()
  const motCleUpper = motCle.toUpperCase()

  return [
    { Section: section, Mot_Cle: motCle },
    { Section: sectionLower, Mot_Cle: motCleLower },
    { Section: sectionUpper, Mot_Cle: motCleUpper },
    { Section: sectionLower, Mot_Cle: motCleUpper },
    { Section: sectionUpper, Mot_Cle: motCleLower },
  ]
}

export const GET = withAuthorizationLogging(
  "PARAMETRES_GERER",
  async (_req: NextRequest, _ctx: HandlerContext, { params }: { params: Promise<{ key: string }> }) => {
    try {
      const { key } = await params
      const [section, motCle] = key.split(":")

      const sectionVal = section || ""
      const motCleVal = motCle || key
      const licenseError = await requireParameterLicense(sectionVal, motCleVal)
      if (licenseError) return licenseError

      const candidates = getCaseCandidates(sectionVal, motCleVal)

      let setting = await prisma.t_parametre.findUnique({
        where: {
          Section_Mot_Cle: {
            Section: sectionVal,
            Mot_Cle: motCleVal,
          },
        },
      })

      if (!setting) {
        setting = await prisma.t_parametre.findFirst({
          where: {
            OR: candidates,
          },
        })
      }

      if (!setting) {
        const optionalDefault = OPTIONAL_SETTING_DEFAULTS.get(`${sectionVal}:${motCleVal}`.toLowerCase())
        if (optionalDefault !== undefined) {
          return apiOk({
            key: `${sectionVal}:${motCleVal}`,
            section: sectionVal,
            motCle: motCleVal,
            value: optionalDefault,
            description: null,
          })
        }

        return apiError(404, "not_found", "Setting not found")
      }

      return apiOk({
        key: `${setting.Section}:${setting.Mot_Cle}`,
        section: setting.Section,
        motCle: setting.Mot_Cle,
        value: setting.Valeur || "",
        description: setting.Commentaire || null,
      })
    } catch (error) {
      log.error("parametres", "get_setting_error", { error })
      return apiError(500, "setting_fetch_failed", "Failed to fetch setting")
    }
  },
)

export const PATCH = withAuthorizationLogging(
  "PARAMETRES_GERER",
  async (req: NextRequest, ctx: HandlerContext, { params }: { params: Promise<{ key: string }> }) => {
    try {
      const { ip } = getRequestContext(req)

      const { key } = await params
      const body = await req.json()
      const { value } = updateSettingSchema.parse(body)

      const [section, motCle] = key.split(":")
      const sectionVal = section || ""
      const motCleVal = motCle || key
      const licenseError = await requireParameterLicense(sectionVal, motCleVal)
      if (licenseError) return licenseError

      const candidates = getCaseCandidates(sectionVal, motCleVal)
      const oldSetting = await prisma.t_parametre.findFirst({
        where: {
          OR: candidates,
        },
      })

      const targetSection = oldSetting?.Section || sectionVal.toUpperCase()
      const targetMotCle = oldSetting?.Mot_Cle || motCleVal.toUpperCase()

      const setting = await prisma.t_parametre.upsert({
        where: {
          Section_Mot_Cle: {
            Section: targetSection,
            Mot_Cle: targetMotCle,
          },
        },
        update: { Valeur: value },
        create: {
          Section: targetSection,
          Mot_Cle: targetMotCle,
          Valeur: value,
        },
      })

      log.config.change(key, ctx.user.username, ctx.user.userId, ip, oldSetting?.Valeur || "N/A", value)
      log.audit("CC", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        userProfile: ctx.user.profile,
        ip,
        resource: `Parametre: ${setting.Section}:${setting.Mot_Cle}`,
        resourceId: `${setting.Section}:${setting.Mot_Cle}`,
        changes: {
          action: oldSetting ? "update" : "create",
          ...buildAuditChanges(
            { value: oldSetting?.Valeur ?? null },
            { value },
            ["value"],
          ),
        },
      })

      revalidateTag("parametres-data", "default")

      return apiOk({
        key: `${setting.Section}:${setting.Mot_Cle}`,
        section: setting.Section,
        motCle: setting.Mot_Cle,
        value: setting.Valeur || "",
        description: setting.Commentaire || null,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Invalid input")
      }

      log.error("parametres", "update_setting_error", { error })
      return apiError(500, "setting_update_failed", "Failed to update setting")
    }
  },
)
