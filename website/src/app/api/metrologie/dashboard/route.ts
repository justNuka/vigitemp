import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { computeEmt, emtModeFromDb } from "@/lib/emt"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { getPermissionAliases } from "@/lib/permissions"
import { prisma } from "@/lib/prisma"
import { buildMetrologyLookupSerials } from "@/lib/sensor-naming"
import { parseDbDateTime, serializeDbDateTime } from "@/lib/date-display"

const METROLOGY_READ_CODES = getPermissionAliases("METROLOGY_ACCESS")

type CalibrationRow = {
  Sonde_Numero_Serie: string | null
  Date_Heure_Etalonnage: Date | null
  Date_Validite: Date | null
  Incertitude: number | null
  Err_Justesse: number | null
}

function asNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function asDate(value: unknown): Date | null {
  return parseDbDateTime(value as string | number | Date | null | undefined)
}

function getConformity(dateValidite: Date | null, dateEtalonnage: Date | null, emtMode: ReturnType<typeof emtModeFromDb>) {
  if (dateValidite) {
    const now = new Date()
    return dateValidite.getTime() >= now.getTime() ? "ok" : "alert"
  }

  if (emtMode !== "sans-objet" && dateEtalonnage) {
    return "ok"
  }

  return "na"
}

export const GET = withStandardOrExpertAnyAuthorizationLogging(METROLOGY_READ_CODES, async (_req: NextRequest) => {
  try {
    const lieux = await prisma.t_lieu.findMany({
      where: { Est_Archive: false },
      select: {
        Id_Lieu: true,
        Nom_Lieu: true,
        Sonde_Numero_Serie: true,
        Tolerance_Surveillance_Inf: true,
        Consigne: true,
        Tolerance_Surveillance_Sup: true,
        Derniere_Date_Etalonnage: true,
        Derniere_Erreur_Justesse: true,
        Derniere_Incertitude: true,
        Est_Correction_Ej: true,
        Est_Correction_derive: true,
        Derive: true,
        EMT_Choix_Mode: true,
        EMT_Sonde: true,
      },
      orderBy: [{ Nom_Lieu: "asc" }],
    })

    const serialCandidates = new Set<string>()
    const candidatesByLieu = new Map<number, string[]>()

    for (const lieu of lieux) {
      const candidates = buildMetrologyLookupSerials(lieu.Sonde_Numero_Serie)
      candidatesByLieu.set(lieu.Id_Lieu, candidates)
      for (const candidate of candidates) serialCandidates.add(candidate)
    }

    const candidateArray = Array.from(serialCandidates)
    const calibrationRows = candidateArray.length
      ? await prisma.$queryRawUnsafe<CalibrationRow[]>(
          `SELECT Sonde_Numero_Serie, Date_Heure_Etalonnage, Date_Validite, Incertitude, Err_Justesse
           FROM t_etalonnage
           WHERE Sonde_Numero_Serie IN (${candidateArray.map(() => "?").join(",")})
           ORDER BY Date_Heure_Etalonnage DESC, Id_Etalonnage DESC`,
          ...candidateArray,
        )
      : []

    const latestCalibrationBySerial = new Map<string, CalibrationRow>()
    for (const row of calibrationRows) {
      const serial = row.Sonde_Numero_Serie?.trim().toUpperCase()
      if (!serial || latestCalibrationBySerial.has(serial)) continue
      latestCalibrationBySerial.set(serial, row)
    }

    const data = lieux.map((lieu) => {
      const candidates = candidatesByLieu.get(lieu.Id_Lieu) ?? []
      const matchedCalibration = candidates
        .map((candidate) => latestCalibrationBySerial.get(candidate))
        .find((row): row is CalibrationRow => Boolean(row)) ?? null

      const dateEtalonnage = matchedCalibration?.Date_Heure_Etalonnage ?? lieu.Derniere_Date_Etalonnage ?? null
      const dateValidite = matchedCalibration?.Date_Validite ?? null
      const erreurJustesse = asNumber(matchedCalibration?.Err_Justesse) ?? asNumber(lieu.Derniere_Erreur_Justesse)
      const incertitudeEtalonnage = asNumber(matchedCalibration?.Incertitude) ?? asNumber(lieu.Derniere_Incertitude)
      const emtMode = emtModeFromDb(lieu.EMT_Choix_Mode)
      const incertitudeMesure =
        emtMode === "uncertainties"
          ? computeEmt({
              mode: emtMode,
              emtValue: lieu.EMT_Sonde,
              consigne: lieu.Consigne,
              consigneSup: lieu.Tolerance_Surveillance_Sup,
              consigneInf: lieu.Tolerance_Surveillance_Inf,
              isConsigneSupActive: lieu.Tolerance_Surveillance_Sup != null,
              isConsigneInfActive: lieu.Tolerance_Surveillance_Inf != null,
              incertitude: incertitudeEtalonnage,
              erreurJustesse,
              derive: lieu.Derive,
              includeDeriveInUncertainty: Boolean(lieu.Est_Correction_derive),
              correctAccuracyError: Boolean(lieu.Est_Correction_Ej),
            }).emtSonde
          : null

      return {
        id: lieu.Id_Lieu,
        nomLieu: lieu.Nom_Lieu ?? `Lieu ${lieu.Id_Lieu}`,
        sondeAssociee: lieu.Sonde_Numero_Serie ?? "-",
        conformity: getConformity(asDate(dateValidite), asDate(dateEtalonnage), emtMode),
        toleranceInf: asNumber(lieu.Tolerance_Surveillance_Inf),
        consigne: asNumber(lieu.Consigne),
        toleranceSup: asNumber(lieu.Tolerance_Surveillance_Sup),
        dateEtalonnage: serializeDbDateTime(asDate(dateEtalonnage)),
        erreurJustesse,
        incertitudeEtalonnage,
        correctionErreurJustesseActive: Boolean(lieu.Est_Correction_Ej),
        correctionDeriveActive: Boolean(lieu.Est_Correction_derive),
        derive: asNumber(lieu.Derive),
        incertitudeMesure,
        dateProchainEtalonnage: serializeDbDateTime(asDate(dateValidite)),
      }
    })

    return apiOk(data)
  } catch (error) {
    log.error("metrologie", "metrology_dashboard_fetch_error", { error })
    return apiError(500, "metrology_dashboard_fetch_failed", "Erreur lors de la recuperation du tableau de bord metrologie")
  }
})
