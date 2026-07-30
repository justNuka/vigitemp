import { NextRequest } from "next/server"
import { z } from "zod"

import { apiError, apiOk } from "@/lib/api-response"
import { getRequestContext } from "@/lib/api-logger"
import { withAuthorizationLogging, type HandlerContext } from "@/lib/api-wrappers"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"

type LocationSettingRow = {
  Id_Lieu: number | bigint
  Nom_Lieu: string | null
  Sonde_Numero_Serie: string | null
  Est_Acq_Auto_Alarme_NR: boolean | number | bigint | null
}

const updateSchema = z.object({
  locationIds: z.array(z.number().int().positive()).min(1).max(10_000),
  enabled: z.boolean(),
})

async function readLocations(): Promise<LocationSettingRow[]> {
  return prisma.$queryRaw<LocationSettingRow[]>`
    SELECT
      Id_Lieu,
      Nom_Lieu,
      Sonde_Numero_Serie,
      Est_Acq_Auto_Alarme_NR
    FROM t_lieu
    WHERE Est_Archive = 0
    ORDER BY Nom_Lieu ASC, Id_Lieu ASC
  `
}

function isEnabled(value: LocationSettingRow["Est_Acq_Auto_Alarme_NR"]) {
  return value === true || Number(value ?? 0) === 1
}

export const GET = withAuthorizationLogging("PARAMETRES_GERER", async () => {
  try {
    const rows = await readLocations()
    return apiOk(rows.map((row) => ({
      id: Number(row.Id_Lieu),
      name: row.Nom_Lieu?.trim() || `Lieu #${String(row.Id_Lieu)}`,
      sensorSerial: row.Sonde_Numero_Serie?.trim() || null,
      enabled: isEnabled(row.Est_Acq_Auto_Alarme_NR),
    })))
  } catch (error) {
    log.error("parametres/acquittement-auto-non-reponse", "settings_load_failed", { error })
    return apiError(500, "auto_ack_settings_fetch_failed", "Impossible de charger le paramétrage")
  }
})

export const PATCH = withAuthorizationLogging(
  "PARAMETRES_GERER",
  async (req: NextRequest, ctx: HandlerContext) => {
    try {
      const payload = updateSchema.parse(await req.json())
      const requestedIds = new Set(payload.locationIds)
      const currentRows = (await readLocations()).filter((row) => requestedIds.has(Number(row.Id_Lieu)))

      if (currentRows.length !== requestedIds.size) {
        return apiError(404, "location_not_found", "Un ou plusieurs lieux sont introuvables")
      }

      const changedRows = currentRows.filter(
        (row) => isEnabled(row.Est_Acq_Auto_Alarme_NR) !== payload.enabled,
      )

      // Keep transactions reasonably small on large installations.
      for (let offset = 0; offset < changedRows.length; offset += 200) {
        const chunk = changedRows.slice(offset, offset + 200)
        await prisma.$transaction(async (tx) => {
          for (const row of chunk) {
            await tx.$executeRaw`
              UPDATE t_lieu
              SET Est_Acq_Auto_Alarme_NR = ${payload.enabled ? 1 : 0}
              WHERE Id_Lieu = ${Number(row.Id_Lieu)}
            `
          }
        })
      }

      const { ip } = getRequestContext(req)
      for (const row of changedRows) {
        const locationId = Number(row.Id_Lieu)
        log.audit("CC", {
          user: ctx.user.username,
          userId: ctx.user.userId,
          userProfile: ctx.user.profile,
          ip,
          resource: `Lieu ${row.Nom_Lieu?.trim() || `#${locationId}`} (Modification)`,
          resourceId: locationId,
          lieuId: locationId,
          changes: {
            action: "update",
            acquittementAutomatiqueNonReponse: {
              from: isEnabled(row.Est_Acq_Auto_Alarme_NR),
              to: payload.enabled,
            },
          },
        })
      }

      return apiOk({ updated: changedRows.length, enabled: payload.enabled })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Paramètres invalides")
      }

      log.error("parametres/acquittement-auto-non-reponse", "settings_update_failed", { error })
      return apiError(500, "auto_ack_settings_update_failed", "Impossible de mettre à jour le paramétrage")
    }
  },
)
