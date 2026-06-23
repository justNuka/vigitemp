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
          t_lieu: {
            where: { Est_Archive: false },
            select: {
              Id_Lieu: true,
              Nom_Lieu: true,
              Derniere_Unite: true,
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
              Date_Heure_Ajustage: true,
            },
            orderBy: [{ Sonde_Numero_Serie: "asc" }, { Date_Heure_Ajustage: "desc" }],
          })
        : []

      const latestAdjustmentUnitBySerial = new Map<string, string | null>()
      for (const adjustment of latestAdjustments) {
        const serial = adjustment.Sonde_Numero_Serie?.trim()
        if (!serial || latestAdjustmentUnitBySerial.has(serial)) continue
        latestAdjustmentUnitBySerial.set(serial, adjustment.Unite?.trim() || null)
      }

      const data = sondes.map((sonde) => ({
        id: sonde.Id_Sonde,
        serialNumber: sonde.Sonde_Numero_Serie ?? "-",
        locationId: sonde.t_lieu[0]?.Id_Lieu ?? null,
        locationName: sonde.t_lieu[0]?.Nom_Lieu ?? null,
        unit: sonde.Sonde_Numero_Serie
          ? latestAdjustmentUnitBySerial.get(sonde.Sonde_Numero_Serie.trim()) ||
            sonde.t_lieu[0]?.Derniere_Unite?.trim() ||
            null
          : sonde.t_lieu[0]?.Derniere_Unite?.trim() || null,
        moduleId: sonde.Id_Module ?? null,
        moduleName:
          (typeof sonde.Id_Module === "number" ? moduleById.get(sonde.Id_Module)?.Module_Numero_Serie : null) ??
          (typeof sonde.Id_Module === "number" ? moduleById.get(sonde.Id_Module)?.Emplacement : null) ??
          null,
        modulePort:
          (typeof sonde.Id_Module === "number" ? moduleById.get(sonde.Id_Module)?.Port_Serie : null) ?? null,
        currentCalibrationValue: typeof sonde.Sonde_Offset === "number" ? sonde.Sonde_Offset : 0,
      }))

      return apiOk(data)
    } catch (error) {
      log.error("metrologie", "adjustment_sensors_fetch_error", { error })
      return apiError(500, "adjustment_sensors_fetch_failed", "Erreur lors de la recuperation des sondes")
    }
  },
)
