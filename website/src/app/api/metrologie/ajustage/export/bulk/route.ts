import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { apiError } from "@/lib/api-response"
import { buildAdjustmentExportFileName, buildAdjustmentXml } from "@/lib/adjustment-export"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { getPermissionAliases } from "@/lib/permissions"
import { prisma } from "@/lib/prisma"
import { extractProbeAddressFromSerial } from "@/lib/sensor-naming"
import { inferStandardTypeCode } from "@/lib/standard-types"
import { buildStoredZip } from "@/lib/zip-archive"

const METROLOGY_OPERATION_CODES = getPermissionAliases("METROLOGY_OPERATION_ACCESS")

const requestSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(200),
})

function archiveFileName() {
  const now = new Date()
  const pad = (value: number, size = 2) => String(value).padStart(size, "0")
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  return `Ajustages_${stamp}.zip`
}

export const POST = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (req: NextRequest, ctx) => {
    try {
      const parsed = requestSchema.safeParse(await req.json())
      if (!parsed.success) {
        return apiError(400, "invalid_adjustment_ids", "Sélection d'ajustages invalide")
      }

      const ids = Array.from(new Set(parsed.data.ids))
      const adjustments = await prisma.t_ajustage.findMany({
        where: { Id_Ajustage: { in: ids } },
      })
      const adjustmentById = new Map(adjustments.map((adjustment) => [adjustment.Id_Ajustage, adjustment]))
      const missingIds = ids.filter((id) => !adjustmentById.has(id))
      if (missingIds.length > 0) {
        return apiError(404, "adjustments_not_found", "Certains ajustages sont introuvables", { missingIds })
      }

      const sensorSerials = Array.from(
        new Set(
          adjustments
            .map((adjustment) => adjustment.Sonde_Numero_Serie?.trim())
            .filter((serial): serial is string => Boolean(serial)),
        ),
      )
      const standardSerials = Array.from(
        new Set(
          adjustments
            .map((adjustment) => adjustment.SE_Numero?.trim())
            .filter((serial): serial is string => Boolean(serial)),
        ),
      )

      const [sensors, standards, standardTypes] = await Promise.all([
        sensorSerials.length
          ? prisma.t_sonde.findMany({
              where: { Sonde_Numero_Serie: { in: sensorSerials } },
              select: { Sonde_Numero_Serie: true, Adresse_Sonde: true },
            })
          : Promise.resolve([]),
        standardSerials.length
          ? prisma.t_etalon.findMany({
              where: { Etalon_Numero_Serie: { in: standardSerials } },
              select: {
                Etalon_Numero_Serie: true,
                Est_Sonde_Externe: true,
                Port_Serie: true,
                Nb_Decimale: true,
                Incertitude_Max: true,
              },
            })
          : Promise.resolve([]),
        prisma.t_etalon_type.findMany({
          select: { Type_Etalon: true, Resolution: true },
        }),
      ])

      const sensorBySerial = new Map(
        sensors
          .filter((sensor) => sensor.Sonde_Numero_Serie)
          .map((sensor) => [sensor.Sonde_Numero_Serie as string, sensor]),
      )
      const standardBySerial = new Map(
        standards
          .filter((standard) => standard.Etalon_Numero_Serie)
          .map((standard) => [standard.Etalon_Numero_Serie as string, standard]),
      )
      const resolutionByType = new Map(
        standardTypes
          .filter((row) => row.Type_Etalon)
          .map((row) => [row.Type_Etalon as string, row.Resolution]),
      )

      const usedNames = new Set<string>()
      const entries = ids.map((id) => {
        const adjustment = adjustmentById.get(id)!
        const sensorSerial = adjustment.Sonde_Numero_Serie?.trim() || ""
        const sensor = sensorSerial ? sensorBySerial.get(sensorSerial) : null
        const standardSerial = adjustment.SE_Numero?.trim() || ""
        const standard = standardSerial ? standardBySerial.get(standardSerial) : null
        const standardType = inferStandardTypeCode(adjustment.SE_Numero, standardTypes)

        const xml = buildAdjustmentXml({
          adjustedAt: adjustment.Date_Heure_Ajustage,
          operator: adjustment.Operateur,
          displayDecimals: adjustment.Nb_Decimale,
          standardSerial: adjustment.SE_Numero,
          standardOrganization: adjustment.SE_Organisme,
          standardCertificateDate: adjustment.SE_Date_Certif,
          standardCertificateNumber: adjustment.SE_Numero_Certif,
          standardUnit: adjustment.Unite,
          standardPort: standard?.Port_Serie ?? null,
          standardIsExternal: Boolean(standard?.Est_Sonde_Externe),
          standardUncertainty:
            standard?.Incertitude_Max == null ? null : Number(String(standard.Incertitude_Max).replace(",", ".")),
          standardResolution: standardType ? resolutionByType.get(standardType) ?? null : null,
          standardDecimals: standard?.Nb_Decimale ?? null,
          sensorSerial: adjustment.Sonde_Numero_Serie,
          sensorAddress:
            sensor?.Adresse_Sonde?.trim() || extractProbeAddressFromSerial(adjustment.Sonde_Numero_Serie?.trim() || ""),
          standardMeasure1: adjustment.Mesure_Etalon1,
          standardMeasure2: adjustment.Mesure_Etalon2,
          sensorRawValue1: adjustment.Valeur_Brute1,
          sensorRawValue2: adjustment.Valeur_Brute2,
          coeffX: adjustment.Coeff_X,
          coeffConstant: adjustment.Coeff_Constant,
          correctedValue1: adjustment.Nouvelle_Mesure1,
          correctedValue2: adjustment.Nouvelle_Mesure2,
        })

        const baseName = buildAdjustmentExportFileName(
          adjustment.Sonde_Numero_Serie,
          adjustment.Date_Heure_Ajustage,
        )
        const name = usedNames.has(baseName) ? baseName.replace(/\.xml$/i, `_${id}.xml`) : baseName
        usedNames.add(name)
        return { name, data: xml }
      })

      const zip = buildStoredZip(entries)
      const fileName = archiveFileName()

      log.info("METROLOGY_ADJUSTMENT", "bulk_adjustment_export_completed", {
        userId: ctx.user.userId,
        count: entries.length,
        ids: ids.slice(0, 20),
      })

      return new NextResponse(zip, {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Cache-Control": "no-store",
        },
      })
    } catch (error) {
      log.error("METROLOGY_ADJUSTMENT", "bulk_adjustment_export_failed", {
        userId: ctx.user.userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(500, "bulk_adjustment_export_failed", "Erreur lors de l'export multiple des ajustages")
    }
  },
)
