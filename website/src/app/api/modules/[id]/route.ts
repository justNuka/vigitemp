import { NextRequest } from "next/server"
import { z } from "zod"

import { getClientIp } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { auditRouteDelete, auditRouteUpdate } from "@/lib/audit-route"
import { withOneOrHigherAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { getPermissionAliases } from "@/lib/permissions"
import { prisma } from "@/lib/prisma"

const MODULE_ACCESS_CODES = getPermissionAliases("HARDWARE_CONFIG_ACCESS")

const updateModuleSchema = z.object({
  Module_Numero_Serie: z.string().min(1, "Le numero de serie est requis").max(50, "Le numero de serie ne peut pas depasser 50 caracteres"),
  Type_Module: z.number().int("Le type doit etre un nombre entier").min(1, "Le type est requis"),
  Port_Serie: z.string().max(10, "Le port ne peut pas depasser 10 caracteres").optional().nullable(),
  Emplacement: z.string().max(50, "L'emplacement ne peut pas depasser 50 caracteres").optional().nullable(),
  Adresse_IP: z.string().max(50, "L'adresse IP ne peut pas depasser 50 caracteres").optional().nullable(),
  Id_Worker: z.number().int().optional().nullable(),
  Delai_Reseau: z.number().int().optional().nullable(),
  Est_Module_GSO: z.boolean().optional(),
})

export const PATCH = withOneOrHigherAnyAuthorizationLogging(
  MODULE_ACCESS_CODES,
  async (req: NextRequest, ctx, { params }: { params: Promise<{ id: string }> }) => {
    const { id: idParam } = await params
    const id = parseInt(idParam, 10)

    if (Number.isNaN(id)) {
      return apiError(400, "invalid_id", "ID invalide")
    }

    try {
      const body = await req.json()
      const validatedData = updateModuleSchema.parse(body)
      const idWorker = validatedData.Id_Worker ?? null

      const existingModule = await prisma.t_module.findUnique({
        where: { Id_Module: id },
      })

      if (!existingModule) {
        return apiError(404, "not_found", "Module non trouve")
      }

      if (
        validatedData.Type_Module !== existingModule.Type_Module ||
        validatedData.Module_Numero_Serie !== existingModule.Module_Numero_Serie
      ) {
        const duplicate = await prisma.t_module.findFirst({
          where: {
            Type_Module: validatedData.Type_Module,
            Module_Numero_Serie: validatedData.Module_Numero_Serie,
            Id_Module: { not: id },
          },
        })

        if (duplicate) {
          return apiError(400, "duplicate", "Un module avec ce type et ce numero de serie existe deja")
        }
      }

      const moduleType = await prisma.t_module_type.findUnique({
        where: { Id_Module_Type: validatedData.Type_Module },
      })
      const normalizedSerial = String(validatedData.Module_Numero_Serie ?? "").trim().toUpperCase()
      const normalizedTypeLabel = String(moduleType?.Libelle_Type_Module ?? "").trim().toUpperCase()
      const normalizedModuleLabel = String(moduleType?.Libelle_Module ?? "").trim().toUpperCase()
      const estModuleGso =
        validatedData.Est_Module_GSO === true ||
        normalizedSerial.startsWith("GSO") ||
        normalizedTypeLabel.includes("GSO") ||
        normalizedModuleLabel.includes("GSO")

      const updatedModule = await prisma.t_module.update({
        where: { Id_Module: id },
        data: {
          Module_Numero_Serie: validatedData.Module_Numero_Serie,
          Type_Module: validatedData.Type_Module,
          Port_Serie: validatedData.Port_Serie || null,
          Emplacement: validatedData.Emplacement || null,
          Adresse_IP: validatedData.Adresse_IP || null,
          Id_Worker: idWorker,
          Delai_Reseau: validatedData.Delai_Reseau || null,
          Est_Module_GSO: estModuleGso,
        },
      })

      const sondesCount = await prisma.t_sonde.count({
        where: { Id_Module: id },
      })

      auditRouteUpdate(req, ctx.user, {
        resource: "Module",
        resourceId: id,
        before: {
          Module_Numero_Serie: existingModule.Module_Numero_Serie,
          Type_Module: existingModule.Type_Module,
          Port_Serie: existingModule.Port_Serie,
          Emplacement: existingModule.Emplacement,
          Adresse_IP: existingModule.Adresse_IP,
          Id_Worker: existingModule.Id_Worker,
          Delai_Reseau: existingModule.Delai_Reseau,
          Est_Module_GSO: existingModule.Est_Module_GSO,
        },
        after: {
          Module_Numero_Serie: updatedModule.Module_Numero_Serie,
          Type_Module: updatedModule.Type_Module,
          Port_Serie: updatedModule.Port_Serie,
          Emplacement: updatedModule.Emplacement,
          Adresse_IP: updatedModule.Adresse_IP,
          Id_Worker: updatedModule.Id_Worker,
          Delai_Reseau: updatedModule.Delai_Reseau,
          Est_Module_GSO: updatedModule.Est_Module_GSO,
        },
        reason: `Modification module ${existingModule.Module_Numero_Serie}`,
      })

      return apiOk(
        {
          ...updatedModule,
          type_label: moduleType?.Libelle_Type_Module || "",
          sondes_count: sondesCount,
        },
        { status: 200 },
      )
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Donnees invalides", { issues: error.issues })
      }

      log.error("modules", "module_update_error", { error })
      return apiError(500, "module_update_failed", "Erreur lors de la modification du module")
    }
  },
)

export const DELETE = withOneOrHigherAnyAuthorizationLogging(
  MODULE_ACCESS_CODES,
  async (req: NextRequest, ctx, { params }: { params: Promise<{ id: string }> }) => {
    const { id: idParam } = await params
    const id = parseInt(idParam, 10)

    if (Number.isNaN(id)) {
      return apiError(400, "invalid_id", "ID invalide")
    }

    try {
      const existingModule = await prisma.t_module.findUnique({
        where: { Id_Module: id },
      })

      if (!existingModule) {
        return apiError(404, "not_found", "Module non trouve")
      }

      const sondesCount = await prisma.t_sonde.count({
        where: { Id_Module: id },
      })

      if (sondesCount > 0) {
        return apiError(400, "has_dependencies", "Impossible de supprimer un module avec du materiel associe")
      }

      await prisma.t_module.update({
        where: { Id_Module: id },
        data: { Archive: 1 },
      })

      log.data.delete("Module", id.toString(), ctx.user.username, ctx.user.userId, getClientIp(req), `Module supprime: ${existingModule.Module_Numero_Serie}`)

      auditRouteDelete(req, ctx.user, {
        resource: "Module",
        resourceId: id,
        reason: `Archivage module ${existingModule.Module_Numero_Serie}`,
        data: { Module_Numero_Serie: existingModule.Module_Numero_Serie },
      })

      return apiOk({ success: true, message: "Module supprime avec succes" }, { status: 200 })
    } catch (error) {
      log.error("modules", "module_delete_error", { error })
      return apiError(500, "module_delete_failed", "Erreur lors de la suppression du module")
    }
  },
)
