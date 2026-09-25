import { NextRequest } from "next/server"
import { Prisma } from "@/generated/@prisma-db-main"

import { apiError, apiOk } from "@/lib/api-response"
import { withAdminLogging } from "@/lib/api-wrappers"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import {
  DEFAULT_CALIBRATION_WARNING_DAYS,
  getCalibrationWarningParameterCandidates,
  normalizeCalibrationWarningDays,
} from "@/lib/calibration-warning-window"

type DueCountRow = {
  dueCount: bigint | number
}

export const GET = withAdminLogging(async (_req: NextRequest) => {
  try {
    const warningSetting = await prisma.t_parametre.findFirst({
      where: {
        OR: getCalibrationWarningParameterCandidates().map((candidate) => ({
          Section: candidate.Section,
          Mot_Cle: candidate.Mot_Cle,
        })),
      },
      select: { Valeur: true },
    })
    const days = normalizeCalibrationWarningDays(
      warningSetting?.Valeur,
      DEFAULT_CALIBRATION_WARNING_DAYS,
    )

    const from = new Date()
    from.setHours(0, 0, 0, 0)

    const to = new Date(from)
    to.setDate(to.getDate() + days)
    to.setHours(23, 59, 59, 999)

    const rows = await prisma.$queryRaw<DueCountRow[]>(Prisma.sql`
      WITH latest_calibration AS (
        SELECT
          Sonde_Numero_Serie,
          Date_Validite,
          ROW_NUMBER() OVER (
            PARTITION BY Sonde_Numero_Serie
            ORDER BY Date_Heure_Etalonnage DESC, Id_Etalonnage DESC
          ) AS rn
        FROM t_etalonnage
        WHERE Sonde_Numero_Serie IS NOT NULL
      )
      SELECT COUNT(*) AS dueCount
      FROM t_sonde s
      INNER JOIN latest_calibration e
        ON e.Sonde_Numero_Serie = s.Sonde_Numero_Serie
       AND e.rn = 1
      WHERE s.Sonde_Numero_Serie IS NOT NULL
        AND COALESCE(s.Est_Sonde_Reformee, 0) = 0
        AND e.Date_Validite IS NOT NULL
        AND e.Date_Validite >= ${from}
        AND e.Date_Validite <= ${to}
    `)

    return apiOk({
      count: Number(rows[0]?.dueCount ?? 0),
      days,
      source: warningSetting ? "database" : "fallback",
      from: from.toISOString(),
      to: to.toISOString(),
    })
  } catch (error) {
    log.error("admin/metrologie/etalonnages-a-prevoir", "calibration_due_count_failed", { error })
    return apiError(
      500,
      "calibration_due_count_failed",
      "Erreur lors du calcul des étalonnages à prévoir",
    )
  }
})
