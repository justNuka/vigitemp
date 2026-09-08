import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { apiError } from "@/lib/api-response"
import {
  buildCalibrationReportFileName,
  buildCalibrationReportPdf,
  loadCalibrationReportInputs,
} from "@/lib/calibration-report"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { getPermissionAliases } from "@/lib/permissions"
import { buildStoredZip } from "@/lib/zip-archive"

const METROLOGY_OPERATION_CODES = getPermissionAliases("METROLOGY_OPERATION_ACCESS")

const requestSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(200),
})

function archiveFileName() {
  const now = new Date()
  const pad = (value: number, size = 2) => String(value).padStart(size, "0")
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  return `Etalonnages_${stamp}.zip`
}

export const POST = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (req: NextRequest, ctx) => {
    try {
      const parsed = requestSchema.safeParse(await req.json())
      if (!parsed.success) {
        return apiError(400, "invalid_calibration_ids", "Sélection d'étalonnages invalide")
      }

      const ids = Array.from(new Set(parsed.data.ids))
      const reports = await loadCalibrationReportInputs(ids)
      const reportById = new Map(reports.map((report) => [report.calibrationId, report]))
      const missingIds = ids.filter((id) => !reportById.has(id))
      if (missingIds.length > 0) {
        return apiError(404, "calibrations_not_found", "Certains étalonnages sont introuvables", { missingIds })
      }

      const usedNames = new Set<string>()
      const entries = ids.map((id) => {
        const report = reportById.get(id)!
        const pdf = buildCalibrationReportPdf(report)
        const baseName = buildCalibrationReportFileName(report.sensorSerial, report.calibratedAt)
        const name = usedNames.has(baseName) ? baseName.replace(/\.pdf$/i, `_${id}.pdf`) : baseName
        usedNames.add(name)
        return { name, data: pdf }
      })

      const zip = buildStoredZip(entries)
      log.info("METROLOGY_CALIBRATION", "bulk_calibration_report_completed", {
        userId: ctx.user.userId,
        count: entries.length,
        ids: ids.slice(0, 20),
      })

      return new NextResponse(zip, {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${archiveFileName()}"`,
          "Cache-Control": "no-store",
        },
      })
    } catch (error) {
      log.error("METROLOGY_CALIBRATION", "bulk_calibration_report_failed", {
        userId: ctx.user.userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(500, "bulk_calibration_report_failed", "Erreur lors de l'export des rapports d'étalonnage")
    }
  },
)
