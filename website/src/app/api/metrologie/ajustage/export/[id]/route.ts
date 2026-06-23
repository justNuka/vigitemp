import { NextRequest, NextResponse } from "next/server"

import { apiError } from "@/lib/api-response"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { getPermissionAliases } from "@/lib/permissions"
import { prisma } from "@/lib/prisma"
import { buildAdjustmentExportFileName, buildAdjustmentXml } from "@/lib/adjustment-export"
import { extractProbeAddressFromSerial } from "@/lib/sensor-naming"
import { inferStandardTypeCode } from "@/lib/standard-types"

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
            select: { Adresse_Sonde: true },
          })
        : null

      const standard = adjustment.SE_Numero
        ? await prisma.t_etalon.findFirst({
            where: { Etalon_Numero_Serie: adjustment.SE_Numero },
            select: {
              Est_Sonde_Externe: true,
              Port_Serie: true,
              Nb_Decimale: true,
              Incertitude_Max: true,
            },
          })
        : null

      const standardTypeRows = await prisma.t_etalon_type.findMany({
        select: { Type_Etalon: true },
      })
      const standardType = inferStandardTypeCode(adjustment.SE_Numero, standardTypeRows)
      const typeInfo = standardType
        ? await prisma.t_etalon_type.findFirst({
            where: { Type_Etalon: standardType },
            select: { Resolution: true },
          })
        : null

      const xmlBuffer = buildAdjustmentXml({
        adjustedAt: adjustment.Date_Heure_Ajustage,
        operator: adjustment.Operateur,
        displayDecimals: adjustment.Nb_Decimale,
        standardSerial: adjustment.SE_Numero,
        standardOrganization: adjustment.SE_Organisme,
        standardCertificateDate: adjustment.SE_Date_Certif,
        standardCertificateNumber: adjustment.SE_Numero_Certif,
        standardUnit: adjustment.Unite,
        standardPort: standard?.Port_Serie ?? null,
        standardIsExternal: Boolean(standard?.Est_Sonde_Externe),
        standardUncertainty:
          standard?.Incertitude_Max == null ? null : Number(String(standard.Incertitude_Max).replace(",", ".")),
        standardResolution: typeInfo?.Resolution ?? null,
        standardDecimals: standard?.Nb_Decimale ?? null,
        sensorSerial: adjustment.Sonde_Numero_Serie,
        sensorAddress:
          sensor?.Adresse_Sonde?.trim() ||
          extractProbeAddressFromSerial(adjustment.Sonde_Numero_Serie?.trim() || ""),
        standardMeasure1: adjustment.Mesure_Etalon1,
        standardMeasure2: adjustment.Mesure_Etalon2,
        sensorRawValue1: adjustment.Valeur_Brute1,
        sensorRawValue2: adjustment.Valeur_Brute2,
        coeffX: adjustment.Coeff_X,
        coeffConstant: adjustment.Coeff_Constant,
        correctedValue1: adjustment.Nouvelle_Mesure1,
        correctedValue2: adjustment.Nouvelle_Mesure2,
      })

      const fileName = buildAdjustmentExportFileName(adjustment.Sonde_Numero_Serie, adjustment.Date_Heure_Ajustage)

      return new NextResponse(xmlBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/xml; charset=ISO-8859-1",
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Cache-Control": "no-store",
        },
      })
    } catch (error) {
      log.error("METROLOGY_ADJUSTMENT", "adjustment_export_failed", {
        userId: ctx.user.userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(500, "adjustment_export_failed", "Erreur lors de l'export de l'ajustage")
    }
  },
)
