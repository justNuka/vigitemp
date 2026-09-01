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

const METROLOGY_OPERATION_CODES = getPermissionAliases("METROLOGY_OPERATION_ACCESS")

const requestSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(200),
})

function crc32(buffer: Buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function toDosDateTime(date: Date) {
  const year = Math.max(1980, date.getFullYear())
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2)
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  return { dosTime, dosDate }
}

function safeArchiveEntryName(value: string) {
  return value.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
}

function buildStoredZip(entries: Array<{ name: string; data: Buffer }>) {
  const localParts: Buffer[] = []
  const centralParts: Buffer[] = []
  let offset = 0
  const archiveDate = new Date()
  const { dosTime, dosDate } = toDosDateTime(archiveDate)

  for (const entry of entries) {
    const name = Buffer.from(safeArchiveEntryName(entry.name), "utf8")
    const checksum = crc32(entry.data)

    const localHeader = Buffer.alloc(30)
    localHeader.writeUInt32LE(0x04034b50, 0)
    localHeader.writeUInt16LE(20, 4)
    localHeader.writeUInt16LE(0x0800, 6)
    localHeader.writeUInt16LE(0, 8)
    localHeader.writeUInt16LE(dosTime, 10)
    localHeader.writeUInt16LE(dosDate, 12)
    localHeader.writeUInt32LE(checksum, 14)
    localHeader.writeUInt32LE(entry.data.length, 18)
    localHeader.writeUInt32LE(entry.data.length, 22)
    localHeader.writeUInt16LE(name.length, 26)
    localHeader.writeUInt16LE(0, 28)

    localParts.push(localHeader, name, entry.data)

    const centralHeader = Buffer.alloc(46)
    centralHeader.writeUInt32LE(0x02014b50, 0)
    centralHeader.writeUInt16LE(20, 4)
    centralHeader.writeUInt16LE(20, 6)
    centralHeader.writeUInt16LE(0x0800, 8)
    centralHeader.writeUInt16LE(0, 10)
    centralHeader.writeUInt16LE(dosTime, 12)
    centralHeader.writeUInt16LE(dosDate, 14)
    centralHeader.writeUInt32LE(checksum, 16)
    centralHeader.writeUInt32LE(entry.data.length, 20)
    centralHeader.writeUInt32LE(entry.data.length, 24)
    centralHeader.writeUInt16LE(name.length, 28)
    centralHeader.writeUInt16LE(0, 30)
    centralHeader.writeUInt16LE(0, 32)
    centralHeader.writeUInt16LE(0, 34)
    centralHeader.writeUInt16LE(0, 36)
    centralHeader.writeUInt32LE(0, 38)
    centralHeader.writeUInt32LE(offset, 42)

    centralParts.push(centralHeader, name)
    offset += localHeader.length + name.length + entry.data.length
  }

  const centralDirectory = Buffer.concat(centralParts)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(0, 4)
  end.writeUInt16LE(0, 6)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(centralDirectory.length, 12)
  end.writeUInt32LE(offset, 16)
  end.writeUInt16LE(0, 20)

  return Buffer.concat([...localParts, centralDirectory, end])
}

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
