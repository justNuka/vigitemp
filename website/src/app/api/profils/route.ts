import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { log } from "@/lib/logger"
import { getRequestContext } from "@/lib/api-logger"
import { auditRouteCreate } from "@/lib/audit-route"
import { withAuthorizationLogging, type HandlerContext } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import {
  isAdminDomainCode,
  isMetrologieDomainCode,
  isSurveillanceDomainCode,
  isVigiLogDomainCode,
} from "@/lib/authorization-domain"

const createProfileSchema = z.object({
  name: z.string().min(1, "Le nom du profil est requis"),
  description: z.string().optional(),
  mc2: z.boolean().optional().default(false),
  authorizations: z.array(z.number()).optional().default([]),
  assignedUserIds: z.array(z.number()).optional().default([]),
})

/**
 * GET /api/profils
 * Récupère la liste de tous les profils avec leurs autorisations (GERER_PROFIL).
 */
export const GET = withAuthorizationLogging("GERER_PROFIL", async (req: NextRequest) => {
  try {
    const status = new URL(req.url).searchParams.get("status")
    const archiveWhere = status === "all"
      ? {}
      : { Est_Archive: status === "archived" }

    const profiles = await prisma.t_profil.findMany({
      where: archiveWhere,
      select: {
        Id_Profil: true,
        Profil_Utilisateur: true,
        Commentaire: true,
        Est_Archive: true,
        t_liaison_profil_autorisation: {
          select: {
            t_autorisation: true,
          },
        },
      },
      orderBy: { Profil_Utilisateur: "asc" },
    })

    const formatted = await Promise.all(
      profiles.map(async (profile) => {
        const userCount = await prisma.t_utilisateur.count({
          where: { Profil_Utilisateur: profile.Profil_Utilisateur },
        })

        return {
          id: profile.Id_Profil,
          name: profile.Profil_Utilisateur,
          description: profile.Commentaire,
          estArchive: Boolean(profile.Est_Archive),
          userCount,
          authorizations: profile.t_liaison_profil_autorisation.map((liaison) => ({
            id: liaison.t_autorisation.Id_Autorisation,
            code: liaison.t_autorisation.Code_Autorisation,
            label: liaison.t_autorisation.Libelle_Autorisation,
            description: liaison.t_autorisation.Commentaire,
            fenAdmin: isAdminDomainCode(liaison.t_autorisation.Code_Autorisation),
            fenMetrologie: isMetrologieDomainCode(liaison.t_autorisation.Code_Autorisation),
            fenSurveillance: isSurveillanceDomainCode(liaison.t_autorisation.Code_Autorisation),
            fenVigiLog: isVigiLogDomainCode(liaison.t_autorisation.Code_Autorisation),
          })),
        }
      }),
    )

    return apiOk(formatted)
  } catch (error) {
    log.error("profils", "get_profiles_error", { error: error });
    return apiError(500, "profiles_fetch_failed", "Echec de récupération des profils")
  }
})

/**
 * POST /api/profils
 * Crée un nouveau profil (GERER_PROFIL).
 */
export const POST = withAuthorizationLogging("GERER_PROFIL", async (req: NextRequest, ctx: HandlerContext) => {
  try {
    const { ip } = getRequestContext(req)

    const body = await req.json()
    const data = createProfileSchema.parse(body)

    const existing = await prisma.t_profil.findUnique({
      where: { Profil_Utilisateur: data.name },
      select: { Id_Profil: true },
    })
    if (existing) {
      return apiError(400, "duplicate", "Un profil avec ce nom existe déjà")
    }

    const profile = await prisma.t_profil.create({
      data: { Profil_Utilisateur: data.name, Commentaire: data.description || null },
    })

    if (data.authorizations.length > 0) {
      await prisma.t_liaison_profil_autorisation.createMany({
        data: data.authorizations.map((authId) => ({
          Id_Profil: profile.Id_Profil,
          Id_Autorisation: authId,
        })),
      })
    }

    if (data.assignedUserIds.length > 0) {
      await prisma.t_utilisateur.updateMany({
        where: { Id_Utilisateur: { in: data.assignedUserIds } },
        data: { Profil_Utilisateur: data.name },
      })
    }

    const completeProfile = await prisma.t_profil.findUnique({
      where: { Id_Profil: profile.Id_Profil },
      select: {
        Id_Profil: true,
        Profil_Utilisateur: true,
        Commentaire: true,
        t_liaison_profil_autorisation: {
          select: {
            t_autorisation: true,
          },
        },
      },
    })

    log.data.create("Profil", profile.Id_Profil, ctx.user.username, ctx.user.userId, ip, {
      name: data.name,
      authorizationCount: data.authorizations.length,
      assignedUserCount: data.assignedUserIds.length,
      mc2: data.mc2,
    })

    auditRouteCreate(req, ctx.user, {
      resource: "Profil",
      resourceId: profile.Id_Profil,
      data: {
        Profil_Utilisateur: data.name,
        Commentaire: data.description || null,
        authorizations: data.authorizations,
        assignedUserIds: data.assignedUserIds,
        Est_MC2: data.mc2,
      },
      reason: `Creation profil ${data.name}`,
    })

    return apiOk(
      {
        id: completeProfile!.Id_Profil,
        name: completeProfile!.Profil_Utilisateur,
        description: completeProfile!.Commentaire,
        estArchive: false,
        authorizations: completeProfile!.t_liaison_profil_autorisation.map((liaison) => ({
          id: liaison.t_autorisation.Id_Autorisation,
          code: liaison.t_autorisation.Code_Autorisation,
          label: liaison.t_autorisation.Libelle_Autorisation,
        })),
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "validation_error", "Données invalides", { details: error.issues })
    }

    log.error("profils", "create_profile_error", { error: error });
    return apiError(500, "profile_create_failed", "Echec de création du profil")
  }
})
