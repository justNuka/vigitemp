import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { apiError, apiOk } from "@/lib/api-response"
import { withAuthLogging, withAuthorizationLogging, type HandlerContext } from "@/lib/api-wrappers"
import { log } from "@/lib/logger"
import { getRequestContext } from "@/lib/api-logger"
import { buildAuditChanges } from "@/lib/audit-route"

const SECTION = "CFR21"
const KEY = "TEMPS_DECONNEXION_MINUTES"
const DEFAULT_DURATION_MINUTES = 15

const updateSchema = z.object({
  enabled: z.boolean(),
  duration: z.number().int().min(1).max(1440),
})

function parseDuration(value: string | null | undefined) {
  const parsed = Number.parseInt(value ?? "", 10)
  return Number.isFinite(parsed) ? parsed : DEFAULT_DURATION_MINUTES
}

async function readAutoLockSetting() {
  const setting = await prisma.t_parametre.findUnique({
    where: {
      Section_Mot_Cle: {
        Section: SECTION,
        Mot_Cle: KEY,
      },
    },
  })

  const rawDuration = parseDuration(setting?.Valeur)
  const enabled = rawDuration > 0
  return {
    setting,
    config: {
      enabled,
      duration: enabled ? rawDuration : DEFAULT_DURATION_MINUTES,
    },
  }
}

export const GET = withAuthLogging(async (_req: NextRequest) => {
  try {
    const { config } = await readAutoLockSetting()
    return apiOk(config)
  } catch (error) {
    log.error("parametres/auto-lock", "get_auto_lock_error", { error })
    return apiError(500, "auto_lock_fetch_failed", "Failed to fetch auto-lock settings")
  }
})

export const PATCH = withAuthorizationLogging(
  "PARAMETRES_GERER",
  async (req: NextRequest, ctx: HandlerContext) => {
    try {
      const { ip } = getRequestContext(req)
      const body = await req.json()
      const payload = updateSchema.parse(body)
      const value = payload.enabled ? String(payload.duration) : "0"

      const { setting: oldSetting } = await readAutoLockSetting()
      const setting = await prisma.t_parametre.upsert({
        where: {
          Section_Mot_Cle: {
            Section: SECTION,
            Mot_Cle: KEY,
          },
        },
        update: { Valeur: value },
        create: {
          Section: SECTION,
          Mot_Cle: KEY,
          Valeur: value,
          Commentaire: "Temps d'inactivite avant deconnexion automatique en minutes",
        },
      })

      log.config.change(`${SECTION}:${KEY}`, ctx.user.username, ctx.user.userId, ip, oldSetting?.Valeur || "N/A", value)
      log.audit("CC", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        userProfile: ctx.user.profile,
        ip,
        resource: `Parametre: ${SECTION}:${KEY}`,
        resourceId: `${SECTION}:${KEY}`,
        changes: {
          action: oldSetting ? "update" : "create",
          ...buildAuditChanges(
            { value: oldSetting?.Valeur ?? null },
            { value },
            ["value"],
          ),
        },
      })

      const rawDuration = parseDuration(setting.Valeur)
      const enabled = rawDuration > 0
      return apiOk({
        enabled,
        duration: enabled ? rawDuration : payload.duration,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Invalid input")
      }

      log.error("parametres/auto-lock", "update_auto_lock_error", { error })
      return apiError(500, "auto_lock_update_failed", "Failed to update auto-lock settings")
    }
  },
)
