import { NextRequest } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { isRegleActive } from "@/lib/planning-regle-schema"

type ConsignesAttendues = {
  consigne: number | null
  consigneSup: number | null
  consigneInf: number | null
  toleranceSup: number | null
  toleranceInf: number | null
  retardChangementConsigne: number | null
}

type PreviewResponse = {
  regleActive: {
    Id_Regle: number
    Id_Lieu: number
    Actif: boolean
    Jour_Debut: number
    Heure_Debut: string
    Jour_Fin: number
    Heure_Fin: string
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Priorite: number
    Tolerance_Sup_Calc: number | null
    Tolerance_Inf_Calc: number | null
    Retard_Alarme_Changement_Consigne: number | null
    Date_Creation: string
    Date_Maj: string | null
  } | null
  consignesAttendues: ConsignesAttendues
}

export const GET = withLogging(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = getAuthenticatedUser(req)
    if (!user) return apiError(401, "unauthenticated", "Non authentifie")

    try {
      const { id } = await params
      const idLieu = parseInt(id)
      if (isNaN(idLieu)) return apiError(400, "invalid_id", "ID lieu invalide")

      // Parse ?at= query param (defaults to now)
      const atParam = req.nextUrl.searchParams.get("at")
      const atDate = atParam ? new Date(atParam) : new Date()
      if (isNaN(atDate.getTime())) {
        return apiError(400, "invalid_at", "Parametre 'at' invalide (format ISO attendu)")
      }

      // Convert JS getDay() (0=Sun..6=Sat) to DB convention (1=Mon..7=Sun)
      const jsDay = atDate.getDay()
      const ourDay = jsDay === 0 ? 7 : jsDay

      // Format time as "HH:MM"
      const hours = atDate.getHours().toString().padStart(2, "0")
      const minutes = atDate.getMinutes().toString().padStart(2, "0")
      const timeStr = `${hours}:${minutes}`

      // Load all active rules sorted by priority DESC
      const regles = await prisma.t_lieu_planning_regle.findMany({
        where: { Id_Lieu: idLieu, Actif: true },
        orderBy: { Priorite: "desc" },
        select: {
          Id_Regle: true,
          Id_Lieu: true,
          Actif: true,
          Jour_Debut: true,
          Heure_Debut: true,
          Jour_Fin: true,
          Heure_Fin: true,
          Consigne: true,
          Consigne_Sup: true,
          Consigne_Inf: true,
          Priorite: true,
          Tolerance_Sup_Calc: true,
          Tolerance_Inf_Calc: true,
          Retard_Alarme_Changement_Consigne: true,
          Date_Creation: true,
          Date_Maj: true,
        },
      })

      // Find first matching rule
      const matchedRegle = regles.find((regle) => {
        const heureDebut = regle.Heure_Debut.toISOString().slice(11, 16)
        const heureFin = regle.Heure_Fin.toISOString().slice(11, 16)
        return isRegleActive(
          {
            Jour_Debut: regle.Jour_Debut,
            Heure_Debut: heureDebut,
            Jour_Fin: regle.Jour_Fin,
            Heure_Fin: heureFin,
          },
          ourDay,
          timeStr,
        )
      })

      // Load lieu Base columns
      const lieu = await prisma.t_lieu.findUnique({
        where: { Id_Lieu: idLieu },
        select: {
          Consigne_Base: true,
          Consigne_Sup_Base: true,
          Tolerance_Surveillance_Sup_Base: true,
          Consigne_Inf_Base: true,
          Tolerance_Surveillance_Inf_Base: true,
          Retard_Alarme_Changement_Consigne: true,
        },
      })
      if (!lieu) return apiError(404, "lieu_not_found", "Lieu introuvable")

      // Build consignesAttendues
      let consignesAttendues: ConsignesAttendues
      if (matchedRegle !== undefined) {
        consignesAttendues = {
          consigne: matchedRegle.Consigne,
          consigneSup: matchedRegle.Consigne_Sup,
          consigneInf: matchedRegle.Consigne_Inf,
          toleranceSup: matchedRegle.Tolerance_Sup_Calc,
          toleranceInf: matchedRegle.Tolerance_Inf_Calc,
          retardChangementConsigne: matchedRegle.Retard_Alarme_Changement_Consigne,
        }
      } else {
        consignesAttendues = {
          consigne: lieu.Consigne_Base,
          consigneSup: lieu.Consigne_Sup_Base,
          consigneInf: lieu.Consigne_Inf_Base,
          toleranceSup: lieu.Tolerance_Surveillance_Sup_Base,
          toleranceInf: lieu.Tolerance_Surveillance_Inf_Base,
          retardChangementConsigne: lieu.Retard_Alarme_Changement_Consigne ?? null,
        }
      }

      const regleActive =
        matchedRegle !== undefined
          ? {
              Id_Regle: matchedRegle.Id_Regle,
              Id_Lieu: matchedRegle.Id_Lieu,
              Actif: matchedRegle.Actif,
              Jour_Debut: matchedRegle.Jour_Debut,
              Heure_Debut: matchedRegle.Heure_Debut.toISOString().slice(11, 16),
              Jour_Fin: matchedRegle.Jour_Fin,
              Heure_Fin: matchedRegle.Heure_Fin.toISOString().slice(11, 16),
              Consigne: matchedRegle.Consigne,
              Consigne_Sup: matchedRegle.Consigne_Sup,
              Consigne_Inf: matchedRegle.Consigne_Inf,
              Priorite: matchedRegle.Priorite,
              Tolerance_Sup_Calc: matchedRegle.Tolerance_Sup_Calc,
              Tolerance_Inf_Calc: matchedRegle.Tolerance_Inf_Calc,
              Retard_Alarme_Changement_Consigne: matchedRegle.Retard_Alarme_Changement_Consigne,
              Date_Creation: matchedRegle.Date_Creation.toISOString(),
              Date_Maj: matchedRegle.Date_Maj?.toISOString() ?? null,
            }
          : null

      const response: PreviewResponse = {
        regleActive,
        consignesAttendues,
      }

      return apiOk(response)
    } catch (error) {
      console.error("[GET /api/lieux/[id]/planning/preview]", error)
      return apiError(500, "planning_preview_failed", "Erreur lors du calcul du preview de planning")
    }
  },
)
