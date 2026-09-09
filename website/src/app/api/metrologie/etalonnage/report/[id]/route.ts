import { NextRequest, NextResponse } from "next/server"

import { apiError } from "@/lib/api-response"
import {
  buildCalibrationReportFileName,
  buildCalibrationReportPdf,
  loadCalibrationReportInputs,
} from "@/lib/calibration-report"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { getPermissionAliases } from "@/lib/permissions"

const METROLOGY_OPERATION_CODES = getPermissionAliases("METROLOGY_OPERATION_ACCESS")

export const GET = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (_req: NextRequest, ctx, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params
      const calibrationId = Number(id)
      if (!Number.isInteger(calibrationId) || calibrationId <= 0) {
        return apiError(400, "invalid_calibration_id", "Identifiant d'étalonnage invalide")
      }

      const [report] = await loadCalibrationReportInputs([calibrationId])
      if (!report) {
        return apiError(404, "calibration_not_found", "Étalonnage introuvable")
      }

      const pdf = buildCalibrationReportPdf(report)
      const fileName = buildCalibrationReportFileName(report.sensorSerial, report.calibratedAt)
      return new NextResponse(pdf, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Cache-Control": "no-store",
        },
      })
    } catch (error) {
      log.error("METROLOGY_CALIBRATION", "calibration_report_failed", {
        userId: ctx.user.userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(500, "calibration_report_failed", "Erreur lors de la génération du rapport d'étalonnage")
    }
  },
)
