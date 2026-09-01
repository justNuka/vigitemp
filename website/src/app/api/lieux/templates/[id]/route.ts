import { NextRequest } from "next/server"
import { z } from "zod"

import { getAuthenticatedUser } from "@/lib/auth"
import { getClientIp, withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"

const updateTemplateSchema = z.object({
  Nom_Template: z.string().trim().min(1).max(80).optional(),
  Description: z.string().trim().max(255).nullable().optional(),
  Lieu_Etat: z.string().trim().length(1).optional(),
  Frequence: z.number().int().positive().nullable().optional(),
  Retard_Alarme_Haut: z.number().int().positive().nullable().optional(),
  Retard_Alarme_Bas: z.number().int().positive().nullable().optional(),
  Retard_Non_Reponse: z.number().int().positive().nullable().optional(),
  Retard_Alarme_Changement_Consigne: z.number().int().positive().nullable().optional(),
  Consigne: z.number().nullable().optional(),
  Consigne_Sup: z.number().nullable().optional(),
  Consigne_Inf: z.number().nullable().optional(),
  Tolerance_Surveillance_Sup: z.number().nullable().optional(),
  Tolerance_Surveillance_Inf: z.number().nullable().optional(),
  Consigne_Sup_Pre_Alarme: z.number().nullable().optional(),
  Consigne_Inf_Pre_Alarme: z.number().nullable().optional(),
  Est_Consigne_Sup_Active: z.boolean().optional(),
  Est_Consigne_Inf_Active: z.boolean().optional(),
  Est_Consigne_Sup_Pre_Alarme_Active: z.boolean().optional(),
  Est_Consigne_Inf_Pre_Alarme_Active: z.boolean().optional(),
  Est_Son_Alarme_Active: z.boolean().optional(),
  Est_Redeclenchement_Immediat: z.boolean().optional(),
  Nb_Mesures_Temporisation_Redeclenchement: z.number().int().min(0).nullable().optional(),
  Observations_Info: z.string().nullable().optional(),
  Est_Archive: z.boolean().optional(),
})

function parseTemplateId(value: string) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export const PATCH = withLogging(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = getAuthenticatedUser(req)
  if (!user) return apiError(401, "unauthenticated", "Non authentifié")

  try {
    const resolved = await params
    const templateId = parseTemplateId(resolved.id)
    if (!templateId) return apiError(400, "invalid_id", "ID template invalide")

    const body = await req.json()
    const validated = updateTemplateSchema.parse(body)

    const updated = await prisma.t_lieu_template.update({
      where: { Id_Lieu_Template: templateId },
      data: {
        ...validated,
        Date_Maj: new Date(),
        Id_Utilisateur_Maj: user.userId,
      },
    })

    log.data.update("LieuTemplate", templateId, user.username, user.userId, getClientIp(req), validated as Record<string, unknown>)
    const serialized = JSON.parse(
      JSON.stringify(updated, (_, value) => (typeof value === "bigint" ? value.toString() : value)),
    )
    return apiOk(serialized)
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return apiError(400, "validation_error", "Validation impossible", { issues: error.issues })
    }
    if (typeof error === "object" && error !== null && "code" in error) {
      const code = (error as { code?: string }).code
      if (code === "P2025") return apiError(404, "template_not_found", "Template introuvable")
      if (code === "P2002") return apiError(409, "template_name_exists", "Un template avec ce nom existe déjà")
    }
    log.error("lieux_templates", "template_patch_error", { error })
    return apiError(500, "template_patch_failed", "Erreur lors de la mise à jour du template")
  }
})

export const DELETE = withLogging(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = getAuthenticatedUser(req)
  if (!user) return apiError(401, "unauthenticated", "Non authentifié")

  try {
    const resolved = await params
    const templateId = parseTemplateId(resolved.id)
    if (!templateId) return apiError(400, "invalid_id", "ID template invalide")

    await prisma.t_lieu_template.delete({
      where: { Id_Lieu_Template: templateId },
    })

    log.data.delete("LieuTemplate", templateId, user.username, user.userId, getClientIp(req))
    return apiOk({ deleted: true })
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2025") {
      return apiError(404, "template_not_found", "Template introuvable")
    }
    log.error("lieux_templates", "template_delete_error", { error })
    return apiError(500, "template_delete_failed", "Erreur lors de la suppression du template")
  }
})

