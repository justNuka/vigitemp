import { NextRequest } from "next/server"
import { z } from "zod"

import { apiError, apiOk } from "@/lib/api-response"
import { auditRouteDelete, auditRouteUpdate } from "@/lib/audit-route"
import { getPermissionAliases } from "@/lib/permissions"
import { prisma } from "@/lib/prisma"
import { log } from "@/lib/logger"
import { withStandardOrExpertAnyAuthorizationLogging, type HandlerContext } from "@/lib/license-guards"
import { updateEtalonExtendedFields, fetchEtalonById, updateEtalonBase, archiveEtalonById } from "@/lib/metrology-db"

const ETALON_WRITE_CODES = getPermissionAliases("METROLOGY_OPERATION_ACCESS")

const nullableNumberField = z.union([z.number(), z.string(), z.null(), z.undefined()]).transform((value) => {
  if (value === null || value === undefined || value === "") return null
  const parsed = typeof value === "number" ? value : Number(String(value).replace(",", "."))
  return Number.isFinite(parsed) ? parsed : null
})

const updateEtalonSchema = z.object({
  Etalon_Numero_Serie: z.string().min(1, "Numero de serie requis"),
  Etat_Etalon: z.string().optional(),
  Id_Module: z.number().nullable().optional(),
  Est_Sonde_Externe: z.boolean().optional(),
  Coeff_A: nullableNumberField,
  Coeff_B: nullableNumberField,
  Coeff_C: nullableNumberField,
  Incertitude_Max: nullableNumberField,
  Pdf_Id: z.number().nullable().optional(),
})

export const PATCH = withStandardOrExpertAnyAuthorizationLogging(
  ETALON_WRITE_CODES,
  async (req: NextRequest, ctx: HandlerContext, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const body = await req.json()
      const data = updateEtalonSchema.parse(body)
      const resolvedParams = await params
      const etalonId = Number.parseInt(resolvedParams.id, 10)

      if (Number.isNaN(etalonId)) {
        return apiError(400, "invalid_id", "ID invalide")
      }

      const existingEtalon = await fetchEtalonById(etalonId)

      if (!existingEtalon) {
        return apiError(404, "not_found", "Etalon introuvable")
      }

      const selectedModule = data.Id_Module
        ? await prisma.t_module.findUnique({
            where: { Id_Module: data.Id_Module },
            select: { Id_Module: true, Port_Serie: true, Id_Worker: true },
          })
        : null

      await updateEtalonBase(etalonId, {
        serial: data.Etalon_Numero_Serie,
        state: data.Etat_Etalon || String(existingEtalon.Etat_Etalon ?? "1"),
        portSerie: selectedModule?.Port_Serie ? String(selectedModule.Port_Serie) : null,
        idWorker: selectedModule?.Id_Worker ?? null,
        idModule: selectedModule?.Id_Module ?? null,
        estSondeExterne: data.Est_Sonde_Externe ?? Boolean(Number(existingEtalon.Est_Sonde_Externe ?? 0)),
      })

      await updateEtalonExtendedFields(etalonId, {
        coeffA: data.Coeff_A,
        coeffB: data.Coeff_B,
        coeffC: data.Coeff_C,
        uncertaintyMax: data.Incertitude_Max,
      })

      const updatedEtalon = await fetchEtalonById(etalonId)

      const existingCertif = await prisma.t_certif.findFirst({
        where: { Etalon_Numero_Serie: existingEtalon.Etalon_Numero_Serie == null ? null : String(existingEtalon.Etalon_Numero_Serie) },
        orderBy: [{ Date: "desc" }, { Id_Certif: "desc" }],
      })

      if (existingCertif) {
        await prisma.t_certif.update({
          where: { Id_Certif: existingCertif.Id_Certif },
          data: {
            Etalon_Numero_Serie: data.Etalon_Numero_Serie,
            Id_PDF: data.Pdf_Id ?? null,
          },
        })
      } else if (data.Pdf_Id) {
        await prisma.t_certif.create({
          data: {
            Etalon_Numero_Serie: data.Etalon_Numero_Serie,
            Id_PDF: data.Pdf_Id,
          },
        })
      }

      auditRouteUpdate(req, ctx.user, {
        resource: "Etalon",
        resourceId: etalonId,
        before: {
          Etalon_Numero_Serie: existingEtalon.Etalon_Numero_Serie,
          Etat_Etalon: existingEtalon.Etat_Etalon,
          Id_Module: existingEtalon.Id_Module,
          Port_Serie: existingEtalon.Port_Serie,
          Id_Worker: existingEtalon.Id_Worker,
        },
        after: {
          Etalon_Numero_Serie: data.Etalon_Numero_Serie,
          Etat_Etalon: updatedEtalon?.Etat_Etalon ?? data.Etat_Etalon ?? existingEtalon.Etat_Etalon,
          Id_Module: updatedEtalon?.Id_Module ?? selectedModule?.Id_Module ?? null,
          Port_Serie: updatedEtalon?.Port_Serie ?? (selectedModule?.Port_Serie ? String(selectedModule.Port_Serie) : null),
          Id_Worker: updatedEtalon?.Id_Worker ?? selectedModule?.Id_Worker ?? null,
          Coeff_A: data.Coeff_A,
          Coeff_B: data.Coeff_B,
          Coeff_C: data.Coeff_C,
          Incertitude_Max: data.Incertitude_Max,
          Pdf_Id: data.Pdf_Id ?? null,
        },
        reason: `Modification etalon ${existingEtalon.Etalon_Numero_Serie}`,
      })

      return apiOk({
        message: "Etalon mis a jour avec succes",
        etalon: updatedEtalon,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Donnees invalides", { details: error.issues })
      }

      if (error instanceof Error && /Unknown column 'Coeff_|Unknown column 'Incertitude_Max'/.test(error.message)) {
        return apiError(500, "metrology_sql_missing", "La base de donnees doit etre mise a jour pour gerer les coefficients et l'incertitude max des etalons")
      }

      log.error("etalons", "etalon_update_error", { error })
      return apiError(500, "etalon_update_failed", "Erreur lors de la mise a jour de l'etalon")
    }
  },
)

export const DELETE = withStandardOrExpertAnyAuthorizationLogging(
  ETALON_WRITE_CODES,
  async (req: NextRequest, ctx: HandlerContext, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const resolvedParams = await params
      const etalonId = Number.parseInt(resolvedParams.id, 10)

      if (Number.isNaN(etalonId)) {
        return apiError(400, "invalid_id", "ID invalide")
      }

      const existingEtalon = await fetchEtalonById(etalonId)

      if (!existingEtalon) {
        return apiError(404, "not_found", "Etalon introuvable")
      }

      await archiveEtalonById(etalonId)

      auditRouteDelete(req, ctx.user, {
        resource: "Etalon",
        resourceId: etalonId,
        reason: `Archivage etalon ${existingEtalon.Etalon_Numero_Serie}`,
        data: { Etalon_Numero_Serie: existingEtalon.Etalon_Numero_Serie },
      })

      return apiOk({ Id_Etalon: etalonId, Est_Archive: true })
    } catch (error) {
      log.error("etalons", "etalon_archive_error", { error })
      return apiError(500, "etalon_archive_failed", "Erreur lors de l'archivage de l'etalon")
    }
  },
)
