import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { getPermissionAliases } from "@/lib/permissions"
import { prisma } from "@/lib/prisma"

const METROLOGY_OPERATION_CODES = getPermissionAliases("METROLOGY_OPERATION_ACCESS")

export const GET = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (_req: NextRequest) => {
    try {
      const sondes = await prisma.t_sonde.findMany({
        where: {
          Sonde_Numero_Serie: {
            not: null,
          },
          OR: [{ Est_Sonde_Reformee: null }, { Est_Sonde_Reformee: false }],
        },
        select: {
          Id_Sonde: true,
          Sonde_Numero_Serie: true,
          Id_Module: true,
          Sonde_Offset: true,
          Est_Sonde_GSO: true,
          t_sonde_type: {
            select: {
              Unite: true,
            },
          },
          t_lieu: {
            where: { Est_Archive: false },
            select: {
              Id_Lieu: true,
              Nom_Lieu: true,
            },
            take: 1,
          },
        },
        orderBy: {
          Sonde_Numero_Serie: "asc",
        },
      })

      const moduleIds = Array.from(
        new Set(sondes.map((sonde) => sonde.Id_Module).filter((value): value is number => typeof value === "number")),
      )

      const modules = moduleIds.length
        ? await prisma.t_module.findMany({
            where: { Id_Module: { in: moduleIds } },
            select: {
              Id_Module: true,
              Module_Numero_Serie: true,
              Port_Serie: true,
              Emplacement: true,
            },
          })
        : []

      const moduleById = new Map(modules.map((module) => [module.Id_Module, module]))
      const serialNumbers = sondes
        .map((sonde) => sonde.Sonde_Numero_Serie)
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0)

      const latestAdjustments = serialNumbers.length
        ? await prisma.t_ajustage.findMany({
            where: {
              Sonde_Numero_Serie: {
                in: serialNumbers,
              },
            },
            select: {
              Sonde_Numero_Serie: true,
              Unite: true,
              Coeff_X2: true,
              Coeff_X: true,
              Coeff_Constant: true,
              Date_Heure_Ajustage: true,
              Id_Ajustage: true,
            },
            orderBy: [
              { Sonde_Numero_Serie: "asc" },
              { Date_Heure_Ajustage: "desc" },
              { Id_Ajustage: "desc" },
            ],
          })
        : []

      const latestAdjustmentBySerial = new Map<
        string,
        {
          unit: string | null
          coeffA: number
          coeffB: number
          coeffC: number
        }
      >()
      for (const adjustment of latestAdjustments) {
        const serial = adjustment.Sonde_Numero_Serie?.trim()
        if (!serial || latestAdjustmentBySerial.has(serial)) continue

        const coeffX2 = typeof adjustment.Coeff_X2 === "number" ? adjustment.Coeff_X2 : 0
        const coeffX = typeof adjustment.Coeff_X === "number" ? adjustment.Coeff_X : 1
        const coeffConstant = typeof adjustment.Coeff_Constant === "number" ? adjustment.Coeff_Constant : 0
        const usesThreeCoefficients = Math.abs(coeffX2) > 1e-12

        latestAdjustmentBySerial.set(serial, {
          unit: adjustment.Unite?.trim() || null,
          coeffA: usesThreeCoefficients ? coeffX2 : coeffX,
          coeffB: usesThreeCoefficients ? coeffX : coeffConstant,
          coeffC: usesThreeCoefficients ? coeffConstant : 0,
        })
      }

      const data = sondes.map((sonde) => {
        const serial = sonde.Sonde_Numero_Serie?.trim() ?? ""
        const previousAdjustment = serial ? latestAdjustmentBySerial.get(serial) : undefined

        return {
          id: sonde.Id_Sonde,
          serialNumber: sonde.Sonde_Numero_Serie ?? "-",
          locationId: sonde.t_lieu[0]?.Id_Lieu ?? null,
          locationName: sonde.t_lieu[0]?.Nom_Lieu ?? null,
          unit: previousAdjustment?.unit || sonde.t_sonde_type?.Unite?.trim() || null,
          moduleId: sonde.Id_Module ?? null,
          moduleName:
            (typeof sonde.Id_Module === "number" ? moduleById.get(sonde.Id_Module)?.Module_Numero_Serie : null) ??
            (typeof sonde.Id_Module === "number" ? moduleById.get(sonde.Id_Module)?.Emplacement : null) ??
            null,
          modulePort:
            (typeof sonde.Id_Module === "number" ? moduleById.get(sonde.Id_Module)?.Port_Serie : null) ?? null,
          currentCalibrationValue: typeof sonde.Sonde_Offset === "number" ? sonde.Sonde_Offset : 0,
          isGso: Boolean(sonde.Est_Sonde_GSO),
          coeffA: previousAdjustment?.coeffA ?? 1,
          coeffB: previousAdjustment?.coeffB ?? 0,
          coeffC: previousAdjustment?.coeffC ?? 0,
        }
      })

      return apiOk(data)
    } catch (error) {
      log.error("metrologie", "adjustment_sensors_fetch_error", { error })
      return apiError(500, "adjustment_sensors_fetch_failed", "Erreur lors de la recuperation des sondes")
    }
  },
)
