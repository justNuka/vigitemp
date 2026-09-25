import { NextRequest } from "next/server"
import { z } from "zod"

import { getAuthenticatedUser } from "@/lib/auth"
import { getClientIp, withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"

const templatePayloadSchema = z.object({
  Nom_Template: z.string().trim().min(1, "Nom du template requis").max(80),
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
  Seuil_Critique_Haut: z.number().nullable().optional(),
  Seuil_Critique_Bas: z.number().nullable().optional(),
  Est_Consigne_Sup_Active: z.boolean().optional(),
  Est_Consigne_Inf_Active: z.boolean().optional(),
  Est_Consigne_Sup_Pre_Alarme_Active: z.boolean().optional(),
  Est_Consigne_Inf_Pre_Alarme_Active: z.boolean().optional(),
  Est_Seuil_Critique_Haut_Active: z.boolean().optional(),
  Est_Seuil_Critique_Bas_Active: z.boolean().optional(),
  Est_Son_Alarme_Active: z.boolean().optional(),
  Est_Redeclenchement_Immediat: z.boolean().optional(),
  Nb_Mesures_Temporisation_Redeclenchement: z.number().int().min(0).nullable().optional(),
  Observations_Info: z.string().nullable().optional(),
})

const APPLY_FIELDS = [
  "Lieu_Etat",
  "Frequence",
  "Retard_Alarme_Haut",
  "Retard_Alarme_Bas",
  "Retard_Non_Reponse",
  "Retard_Alarme_Changement_Consigne",
  "Consigne",
  "Consigne_Sup",
  "Consigne_Inf",
  "Tolerance_Surveillance_Sup",
  "Tolerance_Surveillance_Inf",
  "Consigne_Sup_Pre_Alarme",
  "Consigne_Inf_Pre_Alarme",
  "Seuil_Critique_Haut",
  "Seuil_Critique_Bas",
  "Est_Consigne_Sup_Active",
  "Est_Consigne_Inf_Active",
  "Est_Consigne_Sup_Pre_Alarme_Active",
  "Est_Consigne_Inf_Pre_Alarme_Active",
  "Est_Seuil_Critique_Haut_Active",
  "Est_Seuil_Critique_Bas_Active",
  "Est_Son_Alarme_Active",
  "Est_Redeclenchement_Immediat",
  "Nb_Mesures_Temporisation_Redeclenchement",
  "Observations_Info",
] as const

export const GET = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req)
  if (!user) return apiError(401, "unauthenticated", "Non authentifié")

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const where =
      status === "archived"
        ? { Est_Archive: true }
        : status === "all"
        ? {}
        : { Est_Archive: false }

    const templates = await prisma.t_lieu_template.findMany({
      where,
      orderBy: [{ Nom_Template: "asc" }],
    })

    const serialized = JSON.parse(
      JSON.stringify(templates, (_, value) => (typeof value === "bigint" ? value.toString() : value)),
    )
    return apiOk(serialized)
  } catch (error) {
    log.error("lieux_templates", "templates_fetch_error", { error })
    return apiError(500, "templates_fetch_failed", "Erreur lors du chargement des templates de lieu")
  }
})

export const POST = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req)
  if (!user) return apiError(401, "unauthenticated", "Non authentifié")

  try {
    const body = await req.json()
    const validated = templatePayloadSchema.parse(body)

    const data: Record<string, unknown> = {
      Nom_Template: validated.Nom_Template,
      Description: validated.Description ?? null,
      Lieu_Etat: validated.Lieu_Etat ?? "D",
      Id_Utilisateur_Creation: user.userId,
      Id_Utilisateur_Maj: user.userId,
      Date_Creation: new Date(),
      Date_Maj: new Date(),
      Est_Archive: false,
    }

    for (const field of APPLY_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(validated, field)) {
        data[field] = validated[field]
      }
    }

    const created = await prisma.t_lieu_template.create({ data: data as any })

    log.data.create("LieuTemplate", created.Id_Lieu_Template, user.username, user.userId, getClientIp(req), {
      Nom_Template: created.Nom_Template,
    })

    const serialized = JSON.parse(
      JSON.stringify(created, (_, value) => (typeof value === "bigint" ? value.toString() : value)),
    )
    return apiOk(serialized, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return apiError(400, "validation_error", "Validation impossible", { issues: error.issues })
    }
    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002") {
      return apiError(409, "template_name_exists", "Un template avec ce nom existe déjà")
    }
    log.error("lieux_templates", "template_create_error", { error })
    return apiError(500, "template_create_failed", "Erreur lors de la création du template")
  }
})
