import { NextRequest } from "next/server"
import { z } from "zod"

import { getClientIp } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { auditRouteCreate } from "@/lib/audit-route"
import { withOneOrHigherAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { getPermissionAliases } from "@/lib/permissions"
import { ModuleRepository } from "@/lib/repositories/module.repository"

const MODULE_ACCESS_CODES = getPermissionAliases("HARDWARE_CONFIG_ACCESS")

const createModuleSchema = z.object({
  Module_Numero_Serie: z.string().min(1).max(50),
  Type_Module: z.number(),
  Port_Serie: z.string().min(1).max(10),
  Emplacement: z.string().min(1).max(50),
  Adresse_IP: z.string().optional().nullable(),
  Id_Worker: z.number().optional().nullable(),
  Delai_Reseau: z.number().optional().nullable(),
  Est_Module_GSO: z.boolean().optional(),
})

export const GET = withOneOrHigherAnyAuthorizationLogging(MODULE_ACCESS_CODES, async (_req: NextRequest) => {
  try {
    const modulesWithDetails = await ModuleRepository.findAllWithDetails()
    return apiOk(modulesWithDetails)
  } catch (error) {
    log.error("modules", "modules_fetch_error", { error })
    return apiError(500, "modules_fetch_failed", "Erreur lors de la recuperation des modules")
  }
})

export const POST = withOneOrHigherAnyAuthorizationLogging(MODULE_ACCESS_CODES, async (req: NextRequest, ctx) => {
  try {
    const body = await req.json()
    const validData = createModuleSchema.parse(body)

    const isDuplicate = await ModuleRepository.isDuplicateSerialNumber(validData.Module_Numero_Serie)
    if (isDuplicate) {
      return apiError(400, "duplicate", "Ce numero de serie existe deja")
    }

    const newModule = await ModuleRepository.create({
      Module_Numero_Serie: validData.Module_Numero_Serie,
      Type_Module: validData.Type_Module,
      Port_Serie: validData.Port_Serie,
      Emplacement: validData.Emplacement,
      Adresse_IP: validData.Adresse_IP,
      Id_Worker: validData.Id_Worker ?? null,
      Delai_Reseau: validData.Delai_Reseau,
      Est_Module_GSO: validData.Est_Module_GSO,
    })

    log.data.create("Module", newModule.Id_Module, ctx.user.username, ctx.user.userId, getClientIp(req), validData)

    auditRouteCreate(req, ctx.user, {
      resource: "Module",
      resourceId: newModule.Id_Module,
      data: {
        Module_Numero_Serie: newModule.Module_Numero_Serie,
        Type_Module: newModule.Type_Module,
        Port_Serie: newModule.Port_Serie,
        Emplacement: newModule.Emplacement,
        Adresse_IP: newModule.Adresse_IP,
        Id_Worker: newModule.Id_Worker,
        Delai_Reseau: newModule.Delai_Reseau,
        Est_Module_GSO: newModule.Est_Module_GSO,
      },
      reason: `Creation module ${newModule.Module_Numero_Serie}`,
    })

    return apiOk(newModule, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "validation_error", "Donnees invalides", { details: error.issues })
    }

    log.error("modules", "module_creation_error", { error })
    return apiError(500, "module_create_failed", "Erreur lors de la creation du module")
  }
})
