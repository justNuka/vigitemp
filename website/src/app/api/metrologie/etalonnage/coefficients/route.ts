import { NextRequest } from "next/server"
import { z } from "zod"

import { apiError, apiOk } from "@/lib/api-response"
import { getClientIp } from "@/lib/api-logger"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { fetchEtalonById, fetchIntercomparisonMediaRows } from "@/lib/metrology-db"
import { requireMetrologyReadingPreviewSession } from "@/lib/metrology-reading-preview-session"
import { getPermissionAliases } from "@/lib/permissions"
import { prisma } from "@/lib/prisma"

const METROLOGY_OPERATION_CODES = getPermissionAliases("METROLOGY_OPERATION_ACCESS")
const COEFFICIENT_EPSILON = 1e-12

const schema = z.object({
  operator: z.string().trim().max(255).default(""),
  standardId: z.number().int().positive(),
  mediumId: z.number().int().positive(),
  coefficients: z
    .array(
      z.object({
        sensorId: z.number().int().positive(),
        coeffA: z.number().finite(),
        coeffB: z.number().finite(),
        coeffC: z.number().finite(),
      }),
    )
    .min(1),
})

function safeErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback
  const message = error.message?.trim() ?? ""
  if (!message || message.includes("\n") || /prisma|sql|column|invocation|p20\d\d/i.test(message)) {
    return fallback
  }
  return message
}

function asBoolean(value: unknown) {
  if (typeof value === "boolean") return value
  if (typeof value === "number" || typeof value === "bigint") return Number(value) !== 0
  const normalized = String(value ?? "").trim().toLowerCase()
  return normalized === "1" || normalized === "true"
}

export const PATCH = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (req: NextRequest, ctx) => {
    try {
      const input = schema.parse(await req.json())
      const updateBySensorId = new Map<number, (typeof input.coefficients)[number]>()

      for (const update of input.coefficients) {
        if (Math.abs(update.coeffC) > COEFFICIENT_EPSILON && Math.abs(update.coeffA) <= COEFFICIENT_EPSILON) {
          return apiError(
            400,
            "invalid_coefficients",
            "Le coefficient a ne peut pas etre nul lorsque c est utilise.",
          )
        }
        if (updateBySensorId.has(update.sensorId)) {
          return apiError(400, "duplicate_sensor", "Une sonde ne peut apparaitre qu'une fois dans la validation.")
        }
        updateBySensorId.set(update.sensorId, update)
      }

      const sensorIds = [...updateBySensorId.keys()]
      requireMetrologyReadingPreviewSession(ctx.user.userId, "ETALONNAGE", sensorIds)

      const [sensors, standardRow, mediumRows] = await Promise.all([
        prisma.t_sonde.findMany({
          where: { Id_Sonde: { in: sensorIds }, Sonde_Numero_Serie: { not: null } },
          select: {
            Id_Sonde: true,
            Sonde_Numero_Serie: true,
            t_sonde_type: { select: { Unite: true } },
            t_lieu: {
              where: { Est_Archive: false },
              select: { Id_Lieu: true },
            },
          },
        }),
        fetchEtalonById(input.standardId),
        fetchIntercomparisonMediaRows("active"),
      ])

      if (sensors.length !== sensorIds.length) {
        return apiError(400, "sensor_not_found", "Une ou plusieurs sondes sont introuvables.")
      }

      const standardSerial = String(standardRow?.Etalon_Numero_Serie ?? "").trim()
      if (!standardSerial || asBoolean(standardRow?.Est_Archive)) {
        return apiError(400, "standard_not_found", "L'etalon selectionne est introuvable ou archive.")
      }

      const medium = mediumRows.find((row) => Number(row.Id_Milieu) === input.mediumId)
      if (!medium || asBoolean(medium.Est_Archive)) {
        return apiError(400, "medium_not_found", "Le milieu selectionne est introuvable ou archive.")
      }

      const serials = sensors
        .map((sensor) => sensor.Sonde_Numero_Serie?.trim())
        .filter((serial): serial is string => Boolean(serial))

      const [latestAdjustments, certificate] = await Promise.all([
        prisma.t_ajustage.findMany({
          where: { Sonde_Numero_Serie: { in: serials } },
          orderBy: [
            { Sonde_Numero_Serie: "asc" },
            { Date_Heure_Ajustage: "desc" },
            { Id_Ajustage: "desc" },
          ],
          select: {
            Sonde_Numero_Serie: true,
            Unite: true,
            Nb_Decimale: true,
          },
        }),
        prisma.t_certif.findFirst({
          where: { Etalon_Numero_Serie: standardSerial },
          orderBy: [{ Date: "desc" }, { Id_Certif: "desc" }],
          select: {
            Organisme: true,
            Date: true,
            Numero: true,
            Unite: true,
          },
        }),
      ])

      const latestAdjustmentBySerial = new Map<string, (typeof latestAdjustments)[number]>()
      for (const adjustment of latestAdjustments) {
        const serial = adjustment.Sonde_Numero_Serie?.trim()
        if (serial && !latestAdjustmentBySerial.has(serial)) {
          latestAdjustmentBySerial.set(serial, adjustment)
        }
      }

      const adjustedAt = new Date()
      const operator = input.operator || ctx.user.username
      const locationIds = new Set<number>()

      await prisma.$transaction(async (tx) => {
        for (const sensor of sensors) {
          const serial = sensor.Sonde_Numero_Serie?.trim()
          if (!serial) throw new Error("Une sonde ne possede pas de numero de serie.")
          const update = updateBySensorId.get(sensor.Id_Sonde)
          if (!update) continue
          const previousAdjustment = latestAdjustmentBySerial.get(serial)
          const usesThreeCoefficients = Math.abs(update.coeffC) > COEFFICIENT_EPSILON

          await tx.t_ajustage.create({
            data: {
              Date_Heure_Ajustage: adjustedAt,
              Sonde_Numero_Serie: serial,
              Coeff_X2: usesThreeCoefficients ? update.coeffA : 0,
              Coeff_X: usesThreeCoefficients ? update.coeffB : update.coeffA,
              Coeff_Constant: usesThreeCoefficients ? update.coeffC : update.coeffB,
              Unite:
                previousAdjustment?.Unite?.trim() ||
                sensor.t_sonde_type?.Unite?.trim() ||
                certificate?.Unite?.trim() ||
                null,
              Nb_Decimale: previousAdjustment?.Nb_Decimale ?? null,
              Operateur: operator,
              SE_Numero: standardSerial,
              SE_Organisme: certificate?.Organisme ?? null,
              SE_Date_Certif: certificate?.Date ?? null,
              SE_Numero_Certif: certificate?.Numero ?? null,
              Id_Milieu: input.mediumId,
            },
          })

          for (const location of sensor.t_lieu) locationIds.add(location.Id_Lieu)
        }

        if (locationIds.size > 0) {
          await tx.t_lieu.updateMany({
            where: { Id_Lieu: { in: [...locationIds] } },
            data: { Infos_Modifiees_Depuis_Derniere_Mesure: true },
          })
        }
      })

      log.audit("CA", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        userProfile: ctx.user.profile,
        ip: getClientIp(req),
        resource: "Étalonnage (Coefficients)",
        changes: {
          coefficients: input.coefficients,
          standardId: input.standardId,
          mediumId: input.mediumId,
          appliedOnCalibrationStart: true,
        },
        success: true,
      })

      return apiOk({
        coefficients: input.coefficients,
        message: "Coefficients enregistres. Ils seront appliques au demarrage de l'etalonnage.",
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Donnees invalides", { details: error.issues })
      }
      log.error("METROLOGY_CALIBRATION", "coefficient_update_failed", {
        userId: ctx.user.userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(
        400,
        "calibration_coefficients_update_failed",
        safeErrorMessage(error, "Impossible de valider les coefficients."),
      )
    }
  },
)
