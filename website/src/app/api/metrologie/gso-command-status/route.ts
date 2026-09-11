import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { hasMainDbColumn } from "@/lib/db-schema"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { getTableReference, quoteIdentifier } from "@/lib/metrology-db"
import { getPermissionAliases } from "@/lib/permissions"
import { prisma } from "@/lib/prisma"

const METROLOGY_OPERATION_CODES = getPermissionAliases("METROLOGY_OPERATION_ACCESS")

type GsoStatusRow = {
  Id_Sonde: number
  Sonde_Numero_Serie: string | null
  Metrologie_en_cours: unknown
  Metrologie_cmd_envoyee: unknown
}

function asBoolean(value: unknown) {
  if (typeof value === "boolean") return value
  if (typeof value === "number" || typeof value === "bigint") return Number(value) !== 0
  const normalized = String(value ?? "").trim().toLowerCase()
  return normalized === "1" || normalized === "true"
}

function parseIds(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("ids") ?? ""
  const ids = Array.from(
    new Set(
      raw
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isInteger(value) && value > 0),
    ),
  )
  return ids.slice(0, 200)
}

export const GET = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (req: NextRequest, ctx) => {
    try {
      const ids = parseIds(req)
      if (ids.length === 0) return apiOk({ statuses: [] })

      const [hasInProgress, hasCommandSent] = await Promise.all([
        hasMainDbColumn("t_sonde", "Metrologie_en_cours"),
        hasMainDbColumn("t_sonde", "Metrologie_cmd_envoyee"),
      ])
      if (!hasInProgress || !hasCommandSent) {
        return apiOk({ statuses: [] })
      }

      // ids ne contient ici que des entiers validés ; l'IN est donc sûr malgré la requête dynamique.
      const sql = `SELECT ${quoteIdentifier("Id_Sonde")} AS ${quoteIdentifier("Id_Sonde")},
                          ${quoteIdentifier("Sonde_Numero_Serie")} AS ${quoteIdentifier("Sonde_Numero_Serie")},
                          ${quoteIdentifier("Metrologie_en_cours")} AS ${quoteIdentifier("Metrologie_en_cours")},
                          ${quoteIdentifier("Metrologie_cmd_envoyee")} AS ${quoteIdentifier("Metrologie_cmd_envoyee")}
                   FROM ${getTableReference("t_sonde")}
                   WHERE ${quoteIdentifier("Id_Sonde")} IN (${ids.join(",")})
                     AND ${quoteIdentifier("Est_Sonde_GSO")} = 1`
      const rows = await prisma.$queryRawUnsafe<GsoStatusRow[]>(sql)

      return apiOk({
        statuses: rows.map((row) => ({
          sensorId: Number(row.Id_Sonde),
          serialNumber: row.Sonde_Numero_Serie?.trim() || `#${row.Id_Sonde}`,
          metrologyInProgress: asBoolean(row.Metrologie_en_cours),
          commandSent: asBoolean(row.Metrologie_cmd_envoyee),
        })),
      })
    } catch (error) {
      log.error("METROLOGY_GSO", "command_status_failed", {
        userId: ctx.user.userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(500, "gso_command_status_failed", "Impossible de lire l'état de la commande métrologie GSO.")
    }
  },
)
