import { NextRequest } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withLogging } from "@/lib/api-logger"
import { z } from "zod"
import { apiError, apiOk } from "@/lib/api-response"

const updateLieuSchema = z.object({
  Nom_Lieu: z.string().min(1, "Nom du lieu requis").max(20).optional(),
  Lieu_Etat: z.string().max(100).nullable().optional(),
  Id_Site: z.number().nullable().optional(),
  GroupIds: z.array(z.number()).optional(),
  Id_Groupe1: z.number().nullable().optional(),
  Id_Groupe2: z.number().nullable().optional(),
  Sonde_Numero_Serie: z.string().nullable().optional(),
  Consigne: z.number().nullable().optional(),
  Frequence: z.number().nullable().optional(),
  Consigne_Sup: z.number().nullable().optional(),
  Est_Consigne_Sup_Active: z.boolean().optional(),
  Consigne_Sup_Pre_Alarme: z.number().nullable().optional(),
  Est_Consigne_Sup_Pre_Alarme_Active: z.boolean().optional(),
  Retard_Alarme_Haut: z.number().nullable().optional(),
  Consigne_Inf: z.number().nullable().optional(),
  Est_Consigne_Inf_Active: z.boolean().optional(),
  Consigne_Inf_Pre_Alarme: z.number().nullable().optional(),
  Est_Consigne_Inf_Pre_Alarme_Active: z.boolean().optional(),
  Retard_Alarme_Bas: z.number().nullable().optional(),
  Est_Archive: z.boolean().optional(),
})

export const PATCH = withLogging(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = getAuthenticatedUser(req)
    if (!user) return apiError(401, "unauthenticated", "Non authentifié")

    try {
      const { id: idParam } = await params
      const lieuId = parseInt(idParam)

      if (!lieuId) {
        return apiError(400, "invalid_id", "ID lieu requis")
      }

      const body = await req.json()
      const validated = updateLieuSchema.parse(body)

      const shouldUpdateGroups =
        Object.prototype.hasOwnProperty.call(body, "GroupIds") ||
        Object.prototype.hasOwnProperty.call(body, "Id_Groupe1") ||
        Object.prototype.hasOwnProperty.call(body, "Id_Groupe2")

      const groupIds = shouldUpdateGroups
        ? Array.from(
            new Set(
              [
                ...(validated.GroupIds ?? []),
                validated.Id_Groupe1 ?? undefined,
                validated.Id_Groupe2 ?? undefined,
              ].filter((v): v is number => typeof v === "number" && !Number.isNaN(v)),
            ),
          )
        : undefined

      const { GroupIds, ...lieuPatch } = validated as any

      const lieu = await prisma.$transaction(async (tx) => {
        const updated = await tx.t_lieu.update({
          where: { Id_Lieu: lieuId },
          data: {
            ...lieuPatch,
            ...(groupIds !== undefined
              ? {
                  Id_Groupe1: groupIds[0] ?? null,
                  Id_Groupe2: groupIds[1] ?? null,
                }
              : {}),
          },
        })

        if (groupIds !== undefined) {
          await tx.t_lieu_groupe.deleteMany({ where: { Id_Lieu: lieuId } })
          if (groupIds.length > 0) {
            await tx.t_lieu_groupe.createMany({
              data: groupIds.map((Id_Groupe) => ({ Id_Lieu: lieuId, Id_Groupe })),
              skipDuplicates: true,
            })
          }
        }

        return updated
      })

      const serialized = JSON.parse(
        JSON.stringify(lieu, (_, value) => (typeof value === "bigint" ? value.toString() : value)),
      )

      return apiOk(serialized)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Invalid input", { issues: error.issues })
      }
      console.error("[PATCH /api/lieux/[id]]", error)
      return apiError(500, "lieu_update_failed", "Erreur lors de la modification du lieu")
    }
  },
)
