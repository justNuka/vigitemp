import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getClientIp, withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { planningRegleUpdateSchema, type PlanningRegleResponse } from "@/lib/planning-regle-schema"
import { computeEmt, emtModeFromDb } from "@/lib/emt"
import { log } from "@/lib/logger"

// Helper to format a Prisma TIME field (Date with date 1970-01-01) to "HH:MM"
function formatTime(d: Date | null | undefined): string {
  if (!d) return "00:00"
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

type RouteParams = Promise<{ id: string; regleId: string }>

export const PATCH = withLogging(
  async (req: NextRequest, { params }: { params: RouteParams }) => {
    const user = getAuthenticatedUser(req)
    if (!user) return apiError(401, "unauthenticated", "Non authentifie")

    try {
      const { id, regleId } = await params
      const idLieu = parseInt(id)
      const idRegle = parseInt(regleId)

      if (isNaN(idLieu)) return apiError(400, "invalid_id", "ID lieu invalide")
      if (isNaN(idRegle)) return apiError(400, "invalid_regle_id", "ID regle invalide")

      const body: unknown = await req.json()
      const parsed = planningRegleUpdateSchema.safeParse(body)
      if (!parsed.success) {
        return apiError(422, "validation_error", "Donnees invalides", { issues: parsed.error.flatten() })
      }

      const validated = parsed.data

      // Load existing rule to verify ownership
      const existing = await prisma.t_lieu_planning_regle.findUnique({
        where: { Id_Regle: idRegle },
      })

      if (!existing) return apiError(404, "regle_not_found", "Regle introuvable")
      if ((existing as PrismaRegle).Id_Lieu !== idLieu) {
        return apiError(403, "regle_not_owned", "Cette regle n'appartient pas a ce lieu")
      }

      // Build tolerance patch: only recalculate if Consigne_Sup or Consigne_Inf are being changed
      let tolerancePatch: { Tolerance_Sup_Calc: number | null; Tolerance_Inf_Calc: number | null } | Record<string, never> = {}

      if (validated.Consigne_Sup !== undefined || validated.Consigne_Inf !== undefined) {
        // Load lieu EMT parameters
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

        const existingRegle = existing as PrismaRegle

        // Merge: use patch value if provided, otherwise fall back to existing rule value
        const mergedConsigne =
          validated.Consigne !== undefined ? validated.Consigne : (existingRegle.Consigne ?? null)
        const mergedConsigneSup =
          validated.Consigne_Sup !== undefined ? validated.Consigne_Sup : existingRegle.Consigne_Sup
        const mergedConsigneInf =
          validated.Consigne_Inf !== undefined ? validated.Consigne_Inf : existingRegle.Consigne_Inf

        const emtMode = emtModeFromDb(lieu.EMT_Choix_Mode)

        const emt = computeEmt({
          mode: emtMode,
          emtValue: lieu.EMT,
          consigne: mergedConsigne,
          consigneSup: mergedConsigneSup ?? null,
          consigneInf: mergedConsigneInf ?? null,
          isConsigneSupActive: lieu.Est_Consigne_Sup_Active ?? false,
          isConsigneInfActive: lieu.Est_Consigne_Inf_Active ?? false,
          incertitude: lieu.Derniere_Incertitude,
          erreurJustesse: lieu.Derniere_Erreur_Justesse,
          derive: lieu.Derive,
          includeDeriveInUncertainty: lieu.Est_Correction_derive ?? false,
          correctAccuracyError: lieu.Est_Correction_Ej === 1,
        })

        tolerancePatch = {
          Tolerance_Sup_Calc: emt.toleranceSup,
          Tolerance_Inf_Calc: emt.toleranceInf,
        }
      }

      // Build the update data: convert Heure_Debut/Heure_Fin strings to Date
      const updateData = {
        ...validated,
        ...(validated.Heure_Debut !== undefined && {
          Heure_Debut: new Date(`1970-01-01T${validated.Heure_Debut}:00Z`),
        }),
        ...(validated.Heure_Fin !== undefined && {
          Heure_Fin: new Date(`1970-01-01T${validated.Heure_Fin}:00Z`),
        }),
        ...tolerancePatch,
      }

      const updated = await prisma.t_lieu_planning_regle.update({
        where: { Id_Regle: idRegle },
        data: updateData,
      })

      log.data.update("Planning consigne", idRegle, user.username, user.userId, getClientIp(req), {
        lieuId: idLieu,
        patch: validated,
        tolerancePatch: tolerancePatch,
      })

      return apiOk(toRegleResponse(updated as PrismaRegle))
    } catch (error) {
      log.error("lieux/planning", "planning_update_error", { error: error });
      return apiError(500, "planning_update_failed", "Erreur lors de la mise a jour de la regle de planning")
    }
  },
)

export const DELETE = withLogging(
  async (req: NextRequest, { params }: { params: RouteParams }) => {
    const user = getAuthenticatedUser(req)
    if (!user) return apiError(401, "unauthenticated", "Non authentifie")

    try {
      const { id, regleId } = await params
      const idLieu = parseInt(id)
      const idRegle = parseInt(regleId)

      if (isNaN(idLieu)) return apiError(400, "invalid_id", "ID lieu invalide")
      if (isNaN(idRegle)) return apiError(400, "invalid_regle_id", "ID regle invalide")

      const retainMode = req.nextUrl.searchParams.get("retainMode") ?? "base"

      if (retainMode !== "base" && retainMode !== "regle") {
        return apiError(400, "invalid_retain_mode", "retainMode doit etre 'base' ou 'regle'")
      }

      // Load existing rule to verify ownership
      const existing = await prisma.t_lieu_planning_regle.findUnique({
        where: { Id_Regle: idRegle },
      })

      if (!existing) return apiError(404, "regle_not_found", "Regle introuvable")
      if ((existing as PrismaRegle).Id_Lieu !== idLieu) {
        return apiError(403, "regle_not_owned", "Cette regle n'appartient pas a ce lieu")
      }

      if (retainMode === "regle") {
        const regle = existing as PrismaRegle
        await prisma.$transaction([
          prisma.t_lieu.update({
            where: { Id_Lieu: idLieu },
            data: {
              Consigne: regle.Consigne,
              Consigne_Sup: regle.Consigne_Sup,
              Consigne_Inf: regle.Consigne_Inf,
              Tolerance_Surveillance_Sup: regle.Tolerance_Sup_Calc,
              Tolerance_Surveillance_Inf: regle.Tolerance_Inf_Calc,
              Consigne_Base: regle.Consigne,
              Consigne_Sup_Base: regle.Consigne_Sup,
              Consigne_Inf_Base: regle.Consigne_Inf,
              Tolerance_Surveillance_Sup_Base: regle.Tolerance_Sup_Calc,
              Tolerance_Surveillance_Inf_Base: regle.Tolerance_Inf_Calc,
              Retard_Alarme_Changement_Consigne: regle.Retard_Alarme_Changement_Consigne,
              Planning_Actif: false,
              Planning_Source_Regle_Id: null,
              Planning_Derniere_Maj: new Date(),
            },
          }),
          prisma.t_lieu_planning_regle.delete({
            where: { Id_Regle: idRegle },
          }),
        ])
      } else {
        await prisma.t_lieu_planning_regle.delete({
          where: { Id_Regle: idRegle },
        })
      }

      const [remainingRules] = await prisma.$queryRaw<Array<{ count: bigint | number }>>`
        SELECT COUNT(*) AS count
        FROM t_lieu_planning_regle
        WHERE Id_Lieu = ${idLieu}
      `

      const hasAtLeastOneRule = Number(remainingRules?.count ?? 0) > 0

      await prisma.$executeRaw`
        UPDATE t_lieu
        SET Planning_Regle_Existe = ${hasAtLeastOneRule ? 1 : 0}
        WHERE Id_Lieu = ${idLieu}
      `

      log.data.delete("Planning consigne", idRegle, user.username, user.userId, getClientIp(req),
        retainMode === "regle" ? "Suppression avec conservation des valeurs de la regle" : "Suppression simple")

      return new NextResponse(null, { status: 204 })
    } catch (error) {
      log.error("lieux/planning", "planning_delete_error", { error: error });
      return apiError(500, "planning_delete_failed", "Erreur lors de la suppression de la regle de planning")
    }
  },
)
