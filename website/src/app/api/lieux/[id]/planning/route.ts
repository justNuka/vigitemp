import { NextRequest } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getClientIp, withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { planningRegleCreateSchema, type PlanningRegleResponse } from "@/lib/planning-regle-schema"
import { computeEmt, emtModeFromDb } from "@/lib/emt"
import type { Prisma } from "@/generated/@prisma-db-main/client"
import { log } from "@/lib/logger"

// Helper to format a Prisma TIME field (Date with date 1970-01-01) to "HH:MM"
function formatTime(d: Date | null | undefined): string {
  if (!d) return "00:00"
  // Prisma maps MySQL TIME(0) as a Date object with epoch date 1970-01-01THH:MM:SS.000Z
  return d.toISOString().slice(11, 16)
}

type PrismaRegle = {
  Id_Regle: number
  Id_Lieu: number
  Actif: boolean
  Jour_Debut: number
  Heure_Debut: Date
  Jour_Fin: number
  Heure_Fin: Date
  Consigne: number | null
  Consigne_Sup: number | null
  Consigne_Inf: number | null
  Priorite: number
  Tolerance_Sup_Calc: number | null
  Tolerance_Inf_Calc: number | null
  Retard_Alarme_Changement_Consigne: number | null
  Date_Creation: Date
  Date_Maj: Date | null
}

function toRegleResponse(r: PrismaRegle): PlanningRegleResponse {
  return {
    Id_Regle: r.Id_Regle,
    Id_Lieu: r.Id_Lieu,
    Actif: r.Actif,
    Jour_Debut: r.Jour_Debut,
    Heure_Debut: formatTime(r.Heure_Debut),
    Jour_Fin: r.Jour_Fin,
    Heure_Fin: formatTime(r.Heure_Fin),
    Consigne: r.Consigne,
    Consigne_Sup: r.Consigne_Sup,
    Consigne_Inf: r.Consigne_Inf,
    Priorite: r.Priorite,
    Tolerance_Sup_Calc: r.Tolerance_Sup_Calc,
    Tolerance_Inf_Calc: r.Tolerance_Inf_Calc,
    Retard_Alarme_Changement_Consigne: r.Retard_Alarme_Changement_Consigne,
    Date_Creation: r.Date_Creation.toISOString(),
    Date_Maj: r.Date_Maj?.toISOString() ?? null,
  }
}

export const GET = withLogging(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = getAuthenticatedUser(req)
    if (!user) return apiError(401, "unauthenticated", "Non authentifie")

    try {
      const { id } = await params
      const idLieu = parseInt(id)
      if (isNaN(idLieu)) return apiError(400, "invalid_id", "ID lieu invalide")

      const regles = await prisma.t_lieu_planning_regle.findMany({
        where: { Id_Lieu: idLieu },
        orderBy: { Priorite: "desc" },
      })

      return apiOk(regles.map((r) => toRegleResponse(r as PrismaRegle)))
    } catch (error) {
      console.error("[GET /api/lieux/[id]/planning]", error)
      return apiError(500, "planning_fetch_failed", "Erreur lors de la recuperation des regles de planning")
    }
  },
)

export const POST = withLogging(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = getAuthenticatedUser(req)
    if (!user) return apiError(401, "unauthenticated", "Non authentifie")

    try {
      const { id } = await params
      const idLieu = parseInt(id)
      if (isNaN(idLieu)) return apiError(400, "invalid_id", "ID lieu invalide")

      const body: unknown = await req.json()
      const parsed = planningRegleCreateSchema.safeParse(body)
      if (!parsed.success) {
        return apiError(422, "validation_error", "Donnees invalides", { issues: parsed.error.flatten() })
      }

      const validated = parsed.data

      // Load EMT parameters from the lieu
      const lieu = await prisma.t_lieu.findUnique({
        where: { Id_Lieu: idLieu },
        select: {
          EMT_Choix_Mode: true,
          EMT: true,
          Derniere_Erreur_Justesse: true,
          Derniere_Incertitude: true,
          Derive: true,
          Est_Correction_Ej: true,
          Est_Correction_derive: true,
          Est_Consigne_Sup_Active: true,
          Est_Consigne_Inf_Active: true,
        },
      })
      if (!lieu) return apiError(404, "lieu_not_found", "Lieu introuvable")

      // emtModeFromDb converts the DB Int (1-4) to the string mode expected by computeEmt
      const emtMode = emtModeFromDb(lieu.EMT_Choix_Mode)

      const emt = computeEmt({
        mode: emtMode,
        emtValue: lieu.EMT,
        consigne: validated.Consigne ?? null,
        consigneSup: validated.Consigne_Sup ?? null,
        consigneInf: validated.Consigne_Inf ?? null,
        isConsigneSupActive: lieu.Est_Consigne_Sup_Active ?? false,
        isConsigneInfActive: lieu.Est_Consigne_Inf_Active ?? false,
        incertitude: lieu.Derniere_Incertitude,
        erreurJustesse: lieu.Derniere_Erreur_Justesse,
        derive: lieu.Derive,
        includeDeriveInUncertainty: lieu.Est_Correction_derive ?? false,
        correctAccuracyError: lieu.Est_Correction_Ej === 1,
      })

      const regleData: Prisma.t_lieu_planning_regleUncheckedCreateInput = {
        Id_Lieu: idLieu,
        Actif: validated.Actif,
        Jour_Debut: validated.Jour_Debut,
        Heure_Debut: new Date(`1970-01-01T${validated.Heure_Debut}:00Z`),
        Jour_Fin: validated.Jour_Fin,
        Heure_Fin: new Date(`1970-01-01T${validated.Heure_Fin}:00Z`),
        Consigne: validated.Consigne ?? null,
        Consigne_Sup: validated.Consigne_Sup ?? null,
        Consigne_Inf: validated.Consigne_Inf ?? null,
        Priorite: validated.Priorite,
        Tolerance_Sup_Calc: emt.toleranceSup,
        Tolerance_Inf_Calc: emt.toleranceInf,
        Retard_Alarme_Changement_Consigne: validated.Retard_Alarme_Changement_Consigne ?? null,
      }

      const regle = await prisma.t_lieu_planning_regle.create({
        data: regleData,
      })

      log.data.create("Planning consigne", regle.Id_Regle, user.username, user.userId, getClientIp(req), {
        lieuId: idLieu,
        actif: regle.Actif,
        priorite: regle.Priorite,
        jourDebut: regle.Jour_Debut,
        heureDebut: formatTime(regle.Heure_Debut),
        jourFin: regle.Jour_Fin,
        heureFin: formatTime(regle.Heure_Fin),
        consigne: regle.Consigne,
        consigneSup: regle.Consigne_Sup,
        consigneInf: regle.Consigne_Inf,
        retardChangementConsigne: regle.Retard_Alarme_Changement_Consigne,
      })

      return apiOk(toRegleResponse(regle as PrismaRegle), { status: 201 })
    } catch (error) {
      console.error("[POST /api/lieux/[id]/planning]", error)
      return apiError(500, "planning_create_failed", "Erreur lors de la creation de la regle de planning")
    }
  },
)
