import { NextRequest } from "next/server"

import { withAdminLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"

/**
 * GET /api/admin/sauvegardes
 * Retourne l'historique des sauvegardes
 */
export const GET = withAdminLogging(async (_req: NextRequest) => {
  try {
    const backups = [
      {
        id: "1",
        etat: "Réussi" as const,
        dateHeure: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        details: "Backup complet - 2.5GB",
      },
      {
        id: "2",
        etat: "Réussi" as const,
        dateHeure: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        details: "Backup complet - 2.3GB",
      },
      {
        id: "3",
        etat: "En cours" as const,
        dateHeure: new Date().toISOString(),
        details: "Backup incrémental en cours...",
      },
    ]

    return apiOk(backups)
  } catch (error) {
    log.error("admin/sauvegardes", "error_fetching_backups", { error: error });
    return apiError(500, "internal_error", "Failed to fetch backups")
  }
})
