import { NextRequest } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { getClientIp, withLogging } from "@/lib/api-logger"
import { log } from "@/lib/logger"
import { z } from "zod"
import { apiError, apiOk } from "@/lib/api-response"
import { ModuleRepository } from "@/lib/repositories/module.repository"

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

export const GET = withLogging(async (req: NextRequest) => {
  try {
    const user = getAuthenticatedUser(req)
    if (!user) {
      return apiError(401, "unauthenticated", "Non authentifié")
    }

    const modulesWithDetails = await ModuleRepository.findAllWithDetails()
    return apiOk(modulesWithDetails)
  } catch (error) {
    log.error("modules", "modules_fetch_error", { error: error });
    return apiError(500, "modules_fetch_failed", "Erreur lors de la récupération des modules")
  }
})

export const POST = withLogging(async (req: NextRequest) => {
  try {
    const user = getAuthenticatedUser(req)
    if (!user) {
      return apiError(401, "unauthenticated", "Non authentifié")
    }

    const body = await req.json()
    const validData = createModuleSchema.parse(body)

    const isDuplicate = await ModuleRepository.isDuplicateSerialNumber(validData.Module_Numero_Serie)
    if (isDuplicate) {
      return apiError(400, "duplicate", "Ce numéro de série existe déjà")
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

    log.data.create(
      "Module",
      newModule.Id_Module,
      user.username,
      user.userId,
      getClientIp(req),
      validData,
    )

    return apiOk(newModule, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "validation_error", "Données invalides", { details: error.issues })
    }

    log.error("modules", "module_creation_error", { error: error });
    return apiError(500, "module_create_failed", "Erreur lors de la création du module")
  }
})

