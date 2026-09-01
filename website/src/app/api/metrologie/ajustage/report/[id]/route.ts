import { NextRequest, NextResponse } from "next/server"

import { apiError } from "@/lib/api-response"
import {
  buildAdjustmentReportFileName,
  buildAdjustmentReportPdf,
} from "@/lib/adjustment-report"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { getPermissionAliases } from "@/lib/permissions"
import { prisma } from "@/lib/prisma"

const METROLOGY_OPERATION_CODES = getPermissionAliases("METROLOGY_OPERATION_ACCESS")

export const GET = withStandardOrExpertAnyAuthorizationLogging(
  METROLOGY_OPERATION_CODES,
  async (_req: NextRequest, ctx, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params
      const adjustmentId = Number(id)
      if (!Number.isFinite(adjustmentId) || adjustmentId <= 0) {
        return apiError(400, "invalid_adjustment_id", "Identifiant d'ajustage invalide")
      }

      const adjustment = await prisma.t_ajustage.findUnique({
        where: { Id_Ajustage: adjustmentId },
      })
      if (!adjustment) {
        return apiError(404, "adjustment_not_found", "Ajustage introuvable")
      }

      const sensor = adjustment.Sonde_Numero_Serie
        ? await prisma.t_sonde.findFirst({
            where: { Sonde_Numero_Serie: adjustment.Sonde_Numero_Serie },
            select: { Sonde_Type: true },
          })
        : null
      const sensorType = sensor?.Sonde_Type
        ? await prisma.t_sonde_type.findFirst({
            where: { Sonde_Type: sensor.Sonde_Type },
            select: { Libelle_Sonde_Type: true, Sonde_Type: true },
          })
        : null

      const pdf = buildAdjustmentReportPdf({
        adjustmentId: adjustment.Id_Ajustage,
        adjustedAt: adjustment.Date_Heure_Ajustage,
        sensorSerial: adjustment.Sonde_Numero_Serie,
        sensorType: sensorType?.Libelle_Sonde_Type || sensorType?.Sonde_Type || sensor?.Sonde_Type || null,
        operator: adjustment.Operateur,
        displayDecimals: adjustment.Nb_Decimale,
        unit: adjustment.Unite,
        standardSerial: adjustment.SE_Numero,
        standardOrganization: adjustment.SE_Organisme,
        standardCertificateNumber: adjustment.SE_Numero_Certif,
        standardCertificateDate: adjustment.SE_Date_Certif,
        standardMeasure1: adjustment.Mesure_Etalon1,
        standardMeasure2: adjustment.Mesure_Etalon2,
        previousMeasure1: adjustment.Ancienne_Mesure1,
        previousMeasure2: adjustment.Ancienne_Mesure2,
        correctedMeasure1: adjustment.Nouvelle_Mesure1,
        correctedMeasure2: adjustment.Nouvelle_Mesure2,
        rawValue1: adjustment.Valeur_Brute1,
        rawValue2: adjustment.Valeur_Brute2,
        coeffX2: adjustment.Coeff_X2,
        coeffX: adjustment.Coeff_X,
        coeffConstant: adjustment.Coeff_Constant,
      })
      const fileName = buildAdjustmentReportFileName(
        adjustment.Sonde_Numero_Serie,
        adjustment.Date_Heure_Ajustage,
      )

      return new NextResponse(pdf, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Cache-Control": "no-store",
        },
      })
    } catch (error) {
      log.error("METROLOGY_ADJUSTMENT", "adjustment_report_failed", {
        userId: ctx.user.userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(500, "adjustment_report_failed", "Erreur lors de la generation du rapport")
    }
  },
)
