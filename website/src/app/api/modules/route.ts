import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth"
import { withLogging } from "@/lib/api-logger"
import { log } from "@/lib/logger"
import { z } from "zod"
import { apiError, apiOk } from "@/lib/api-response"

const createModuleSchema = z.object({
  Module_Numero_Serie: z.string().min(1).max(50),
  Type_Module: z.number(),
  Port_Serie: z.string().min(1).max(10),
  Emplacement: z.string().min(1).max(50),
  Adresse_IP: z.string().optional().nullable(),
  Id_Serveur: z.number().optional().nullable(),
  Delai_Reseau: z.number().optional().nullable(),
})

export const GET = withLogging(async (req: NextRequest) => {
  try {
    const user = getAuthenticatedUser(req)
    if (!user) {
      return apiError(401, "unauthenticated", "Non authentifié")
    }

    const modules = await prisma.t_module.findMany({
      select: {
        Id_Module: true,
        Module_Numero_Serie: true,
        Type_Module: true,
        Port_Serie: true,
        Emplacement: true,
        Id_Serveur: true,
        Archive: true,
      },
      where: {
        Archive: 0,
      },
      orderBy: {
        Module_Numero_Serie: "asc",
      },
    })

    const modulesWithDetails = await Promise.all(
      modules.map(async (module) => {
        const sondesCount = await prisma.t_sonde.count({
          where: {
            Id_Module: module.Id_Module,
          },
        })

        let typeLabel = null
        if (module.Type_Module) {
          const moduleType = await prisma.t_module_type.findUnique({
            where: { Id_Module_Type: module.Type_Module },
            select: { Libelle_Type_Module: true },
          })
          typeLabel = moduleType?.Libelle_Type_Module || null
        }

        return {
          Id_Module: module.Id_Module,
          Module_Numero_Serie: module.Module_Numero_Serie,
          Type_Module: module.Type_Module,
          Libelle_Type_Module: typeLabel,
          Port_Serie: module.Port_Serie,
          Emplacement: module.Emplacement,
          Id_Serveur: module.Id_Serveur,
          sondes_count: sondesCount,
        }
      }),
    )

    return apiOk(modulesWithDetails)
  } catch (error) {
    console.error("Modules fetch error:", error)
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

    const existing = await prisma.t_module.findFirst({
      where: {
        Module_Numero_Serie: validData.Module_Numero_Serie,
      },
    })

    if (existing) {
      return apiError(400, "duplicate", "Ce numéro de série existe déjà")
    }

    const newModule = await prisma.t_module.create({
      data: {
        Module_Numero_Serie: validData.Module_Numero_Serie,
        Type_Module: validData.Type_Module,
        Port_Serie: validData.Port_Serie,
        Emplacement: validData.Emplacement,
        Adresse_IP: validData.Adresse_IP,
        Id_Serveur: validData.Id_Serveur,
        Delai_Reseau: validData.Delai_Reseau,
        Archive: 0,
      },
    })

    log.data.create(
      "Module",
      newModule.Id_Module,
      user.username,
      user.userId,
      req.headers.get("x-forwarded-for") || "unknown",
      validData,
    )

    return apiOk(newModule, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "validation_error", "Données invalides", { details: error.issues })
    }

    console.error("Module creation error:", error)
    return apiError(500, "module_create_failed", "Erreur lors de la création du module")
  }
})
