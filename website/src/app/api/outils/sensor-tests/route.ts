import { NextRequest } from "next/server"
import { z } from "zod"

import { apiError, apiOk } from "@/lib/api-response"
import { serializeStoredDbDateTime } from "@/lib/date-display"
import { withOneOrHigherAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { getPermissionAliases } from "@/lib/permissions"
import { prisma, prismaMesure } from "@/lib/prisma"
import { getSensorFamilyFromTypeCode } from "@/lib/sensor-naming"
import {
  aggregateToolsSensorTestMeasurements,
  buildToolsSensorTestLookupValues,
  type ToolsSensorTestCatalogEntry,
  type ToolsSensorTestMeasurementRow,
} from "@/lib/tools-sensor-test"

const TOOLS_SENSOR_TEST_ACCESS_CODES = Array.from(
  new Set([
    "PARAMETRES_GERER",
    ...getPermissionAliases("HARDWARE_CONFIG_ACCESS"),
    ...getPermissionAliases("METROLOGY_OPERATION_ACCESS"),
  ]),
)

const snapshotSchema = z.object({
  sensorIds: z.array(z.number().int().positive()).min(1).max(500),
  startedAt: z.string().datetime({ offset: true }),
})

function chunkValues<T>(values: T[], size: number) {
  const chunks: T[][] = []
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size))
  }
  return chunks
}

/**
 * MySQL/MSSQL DATETIME values are timezone-less and Prisma exposes their stored
 * wall-clock components as UTC-backed Date objects. Build the filter with the
 * server-local wall-clock components encoded as UTC so the comparison targets
 * the same representation without applying a timezone offset.
 */
function toStoredDbDateTimeFilter(value: Date) {
  return new Date(Date.UTC(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
    value.getHours(),
    value.getMinutes(),
    value.getSeconds(),
    value.getMilliseconds(),
  ))
}

async function loadCatalog(sensorIds?: number[]): Promise<ToolsSensorTestCatalogEntry[]> {
  const sensors = await prisma.t_sonde.findMany({
    where: {
      ...(sensorIds ? { Id_Sonde: { in: sensorIds } } : {}),
      AND: [
        { Sonde_Numero_Serie: { not: null } },
        { OR: [{ Est_Sonde_Reformee: false }, { Est_Sonde_Reformee: null }] },
      ],
    },
    select: {
      Id_Sonde: true,
      Sonde_Numero_Serie: true,
      Adresse_Sonde: true,
      Sonde_Type: true,
      Id_Module: true,
      Port_Serie: true,
      Surveillance_Etat: true,
      Frequence_Mesure: true,
      Frequence_Recup: true,
      t_lieu: {
        select: { Nom_Lieu: true },
      },
    },
    orderBy: { Sonde_Numero_Serie: "asc" },
  })

  const moduleIds = Array.from(
    new Set(sensors.map((sensor) => sensor.Id_Module).filter((value): value is number => typeof value === "number")),
  )
  const modules = moduleIds.length
    ? await prisma.t_module.findMany({
        where: { Id_Module: { in: moduleIds } },
        select: {
          Id_Module: true,
          Module_Numero_Serie: true,
          Emplacement: true,
          Port_Serie: true,
        },
      })
    : []
  const modulesById = new Map(modules.map((moduleRow) => [moduleRow.Id_Module, moduleRow]))

  return sensors.flatMap((sensor) => {
    const serialNumber = sensor.Sonde_Numero_Serie?.trim()
    if (!serialNumber) return []
    const moduleRow = sensor.Id_Module == null ? null : modulesById.get(sensor.Id_Module)
    return [{
      id: sensor.Id_Sonde,
      serialNumber,
      address: sensor.Adresse_Sonde?.trim() || null,
      sensorType: sensor.Sonde_Type?.trim() || null,
      family: getSensorFamilyFromTypeCode(sensor.Sonde_Type),
      location: sensor.t_lieu[0]?.Nom_Lieu ?? null,
      module: moduleRow?.Module_Numero_Serie ?? moduleRow?.Emplacement ?? null,
      modulePort: moduleRow?.Port_Serie ?? sensor.Port_Serie ?? null,
      surveillanceState: sensor.Surveillance_Etat ?? null,
      frequencyMeasure: sensor.Frequence_Mesure ?? null,
      frequencyRecovery: sensor.Frequence_Recup ?? null,
    }]
  })
}

export const GET = withOneOrHigherAnyAuthorizationLogging(
  TOOLS_SENSOR_TEST_ACCESS_CODES,
  async () => {
    try {
      const sensors = await loadCatalog()
      return apiOk({ sensors })
    } catch (error) {
      log.error("tools", "sensor_test_catalog_failed", { error })
      return apiError(500, "sensor_test_catalog_failed", "Impossible de charger les sondes à tester")
    }
  },
  { label: "tools_sensor_test_catalog" },
)

export const POST = withOneOrHigherAnyAuthorizationLogging(
  TOOLS_SENSOR_TEST_ACCESS_CODES,
  async (req: NextRequest) => {
    try {
      const parsed = snapshotSchema.safeParse(await req.json())
      if (!parsed.success) {
        return apiError(400, "validation_error", "Paramètres de test invalides", {
          issues: parsed.error.issues,
        })
      }

      const sensorIds = Array.from(new Set(parsed.data.sensorIds))
      const requestedStartedAt = new Date(parsed.data.startedAt)
      const now = new Date()
      const oldestAllowed = new Date(now.getTime() - 10 * 60_000)
      const latestAllowed = new Date(now.getTime() + 5_000)
      if (requestedStartedAt < oldestAllowed || requestedStartedAt > latestAllowed) {
        return apiError(400, "invalid_test_window", "La fenêtre de test doit couvrir au maximum les 10 dernières minutes")
      }
      const startedAt = toStoredDbDateTimeFilter(requestedStartedAt)

      const sensors = await loadCatalog(sensorIds)
      if (sensors.length !== sensorIds.length) {
        return apiError(404, "sensor_not_found", "Une ou plusieurs sondes sélectionnées sont introuvables ou réformées")
      }

      const lookupValues = buildToolsSensorTestLookupValues(sensors)
      const uniqueRows = new Map<string, ToolsSensorTestMeasurementRow>()

      for (const values of chunkValues(lookupValues, 400)) {
        const rows = await prismaMesure.tm_mesures.findMany({
          where: {
            Date_Heure_Mesure: { gte: startedAt },
            OR: [
              { Sonde_Numero_Serie: { in: values } },
              { Adresse_Sonde: { in: values } },
            ],
          },
          select: {
            Id_Serveur_BDD: true,
            Id_Mesure: true,
            Id_Lieu: true,
            Date_Heure_Mesure: true,
            Sonde_Numero_Serie: true,
            Adresse_Sonde: true,
            Valeur: true,
            Valeur_Brute: true,
            Unite: true,
            Rssi: true,
            Est_Valeur_Null: true,
          },
        })

        for (const row of rows) {
          const measuredAt = serializeStoredDbDateTime(row.Date_Heure_Mesure)
          if (!measuredAt) continue
          const key = `${row.Id_Serveur_BDD}:${row.Id_Mesure}:${row.Id_Lieu}:${measuredAt}:${row.Est_Valeur_Null}`
          uniqueRows.set(key, {
            serialNumber: row.Sonde_Numero_Serie,
            address: row.Adresse_Sonde,
            value: row.Valeur,
            rawValue: row.Valeur_Brute,
            unit: row.Unite,
            rssi: row.Rssi,
            isNull: Number(row.Est_Valeur_Null ?? 0),
            measuredAt,
          })
        }
      }

      const results = aggregateToolsSensorTestMeasurements(sensors, Array.from(uniqueRows.values()))
      const totalAttempts = results.reduce((sum, result) => sum + result.totalAttempts, 0)
      const receivedAttempts = results.reduce((sum, result) => sum + result.receivedAttempts, 0)

      return apiOk({
        startedAt: requestedStartedAt.toISOString(),
        readAt: now.toISOString(),
        sensors,
        results,
        summary: {
          totalAttempts,
          receivedAttempts,
          responseRate: totalAttempts > 0 ? Math.round((receivedAttempts / totalAttempts) * 1000) / 10 : null,
        },
      })
    } catch (error) {
      log.error("tools", "sensor_test_snapshot_failed", { error })
      return apiError(500, "sensor_test_snapshot_failed", "Impossible de récupérer les mesures du test", {
        details: error instanceof Error ? error.message : String(error),
      })
    }
  },
  { label: "tools_sensor_test_snapshot" },
)
