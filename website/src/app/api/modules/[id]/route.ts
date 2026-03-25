import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth"
import { getClientIp, withLogging } from "@/lib/api-logger"
import { z } from "zod"
import { auditRouteDelete, auditRouteUpdate } from "@/lib/audit-route"
import { log } from "@/lib/logger"
import { apiError, apiOk } from "@/lib/api-response"

const updateModuleSchema = z.object({
  Module_Numero_Serie: z
    .string()
    .min(1, "Le numéro de série est requis")
    .max(50, "Le numéro de série ne peut pas dépasser 50 caractères"),
  Type_Module: z.number().int("Le type doit être un nombre entier").min(1, "Le type est requis"),
  Port_Serie: z.string().max(10, "Le port ne peut pas dépasser 10 caractères").optional().nullable(),
  Emplacement: z.string().max(50, "L'emplacement ne peut pas dépasser 50 caractères").optional().nullable(),
  Adresse_IP: z.string().max(50, "L'adresse IP ne peut pas dépasser 50 caractères").optional().nullable(),
  Id_Serveur: z.number().int().optional().nullable(),
  Delai_Reseau: z.number().int().optional().nullable(),
  Est_Module_GSO: z.boolean().optional(),
})

export const PATCH = withLogging(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = getAuthenticatedUser(req)
    if (!user) {
      return apiError(401, "unauthenticated", "Non authentifié")
    }

    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return apiError(400, "invalid_id", "ID invalide")
    }

    try {
      const body = await req.json()
      const validatedData = updateModuleSchema.parse(body)

      const existingModule = await prisma.t_module.findUnique({
        where: { Id_Module: id },
      })

      if (!existingModule) {
        return apiError(404, "not_found", "Module non trouvé")
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
          return apiError(400, "duplicate", "Un module avec ce type et ce numéro de série existe déjà")
        }
      }

      const updatedModule = await prisma.t_module.update({
        where: { Id_Module: id },
        data: ({
          ...validatedData,
          Port_Serie: validatedData.Port_Serie || null,
          Emplacement: validatedData.Emplacement || null,
          Adresse_IP: validatedData.Adresse_IP || null,
          Id_Serveur: validatedData.Id_Serveur || null,
          Delai_Reseau: validatedData.Delai_Reseau || null,
        }) as any,
      })

      const sondesCount = await prisma.t_sonde.count({
        where: { Id_Module: id },
      })

      auditRouteUpdate(req, user, {
        resource: "Module",
        resourceId: id.toString(),
        before: {
          Module_Numero_Serie: existingModule.Module_Numero_Serie,
          Type_Module: existingModule.Type_Module,
          Port_Serie: existingModule.Port_Serie,
          Emplacement: existingModule.Emplacement,
          Adresse_IP: existingModule.Adresse_IP,
          Id_Serveur: existingModule.Id_Serveur,
          Delai_Reseau: existingModule.Delai_Reseau,
          Est_Module_GSO: existingModule.Est_Module_GSO,
        },
        after: {
          Module_Numero_Serie: updatedModule.Module_Numero_Serie,
          Type_Module: updatedModule.Type_Module,
          Port_Serie: updatedModule.Port_Serie,
          Emplacement: updatedModule.Emplacement,
          Adresse_IP: updatedModule.Adresse_IP,
          Id_Serveur: updatedModule.Id_Serveur,
          Delai_Reseau: updatedModule.Delai_Reseau,
          Est_Module_GSO: updatedModule.Est_Module_GSO,
        },
      })

      const moduleType = await prisma.t_module_type.findUnique({
        where: { Id_Module_Type: validatedData.Type_Module },
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
        return apiError(400, "validation_error", "Données invalides", { issues: error.issues })
      }

      log.error("modules", "module_update_error", { error: error });
      return apiError(500, "module_update_failed", "Erreur lors de la modification du module")
    }
  },
)

export const DELETE = withLogging(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = getAuthenticatedUser(req)
    if (!user) {
      return apiError(401, "unauthenticated", "Non authentifié")
    }

    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return apiError(400, "invalid_id", "ID invalide")
    }

    try {
      const existingModule = await prisma.t_module.findUnique({
        where: { Id_Module: id },
      })

      if (!existingModule) {
        return apiError(404, "not_found", "Module non trouvé")
      }

      const sondesCount = await prisma.t_sonde.count({
        where: { Id_Module: id },
      })

      if (sondesCount > 0) {
        return apiError(400, "has_dependencies", "Impossible de supprimer un module avec du matériel associé")
      }

      await prisma.t_module.update({
        where: { Id_Module: id },
        data: { Archive: 1 },
      })

      log.data.delete(
        "Module",
        id.toString(),
        user.username,
        user.userId,
        getClientIp(req),
        `Module supprimé: ${existingModule.Module_Numero_Serie}`,
      )

      return apiOk({ success: true, message: "Module supprimé avec succès" }, { status: 200 })
    } catch (error) {
      log.error("modules", "module_delete_error", { error: error });
      return apiError(500, "module_delete_failed", "Erreur lors de la suppression du module")
    }
  },
)
