import { NextRequest } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withLogging } from "@/lib/api-logger"
import { z } from "zod"
import { apiError, apiOk } from "@/lib/api-response"

const createLieuSchema = z.object({
  Nom_Lieu: z.string().min(1, "Nom du lieu requis").max(20),
  Lieu_Etat: z.string().max(1).nullable().optional(),
  Commentaire: z.string().nullable().optional(),
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
})

export const GET = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req)
  if (!user) return apiError(401, "unauthenticated", "Non authentifié")

  try {
    const lieux = await prisma.t_lieu.findMany({
      where: { Est_Archive: false },
      include: {
        t_lieu_groupe: {
          include: {
            t_groupe: { select: { Id_Groupe: true, Nom_Groupe: true, Numero_Regroupement: true } },
          },
        },
        t_groupe1: { select: { Nom_Groupe: true } },
        t_groupe2: { select: { Nom_Groupe: true } },
        t_site: { select: { Libelle_Site: true } },
        t_sonde: { select: { Sonde_Numero_Serie: true } },
      },
      orderBy: { Nom_Lieu: "asc" },
    })

    const serialized = JSON.parse(
      JSON.stringify(lieux, (_, value) => (typeof value === "bigint" ? value.toString() : value)),
    )

    return apiOk(serialized)
  } catch (error) {
    console.error("[GET /api/lieux]", error)
    return apiError(500, "lieux_fetch_failed", "Erreur lors de la récupération des lieux")
  }
})

export const POST = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req)
  if (!user) return apiError(401, "unauthenticated", "Non authentifié")

  try {
    const body = await req.json()
    const validated = createLieuSchema.parse(body)

    const groupIds = Array.from(
      new Set(
        [
          ...(validated.GroupIds ?? []),
          validated.Id_Groupe1 ?? undefined,
          validated.Id_Groupe2 ?? undefined,
        ].filter((v): v is number => typeof v === "number" && !Number.isNaN(v)),
      ),
    )

    const lieuEtat = validated.Lieu_Etat ?? "D"
    const sondeNumeroSerie = validated.Sonde_Numero_Serie?.trim() || null

    const group1Id = groupIds[0] ?? validated.Id_Groupe1 ?? null
    const group2Id = groupIds[1] ?? validated.Id_Groupe2 ?? null

    const lieu = await prisma.t_lieu.create({
      data: {
        Nom_Lieu: validated.Nom_Lieu,
        Commentaire: validated.Commentaire ?? null,
        Consigne: validated.Consigne,
        Frequence: validated.Frequence,
        Consigne_Sup: validated.Consigne_Sup,
        Est_Consigne_Sup_Active: validated.Est_Consigne_Sup_Active ?? false,
        Consigne_Sup_Pre_Alarme: validated.Consigne_Sup_Pre_Alarme,
        Est_Consigne_Sup_Pre_Alarme_Active: validated.Est_Consigne_Sup_Pre_Alarme_Active ?? false,
        Retard_Alarme_Haut: validated.Retard_Alarme_Haut,
        Consigne_Inf: validated.Consigne_Inf,
        Est_Consigne_Inf_Active: validated.Est_Consigne_Inf_Active ?? false,
        Consigne_Inf_Pre_Alarme: validated.Consigne_Inf_Pre_Alarme,
        Est_Consigne_Inf_Pre_Alarme_Active: validated.Est_Consigne_Inf_Pre_Alarme_Active ?? false,
        Retard_Alarme_Bas: validated.Retard_Alarme_Bas,
        Est_Archive: false,
        t_etat_surveillance_lieu: {
          connect: { Surveillance_Etat: lieuEtat },
        },
        ...(validated.Id_Site
          ? {
              t_site: {
                connect: { Id_Site: validated.Id_Site },
              },
            }
          : {}),
        ...(sondeNumeroSerie
          ? {
              t_sonde: {
                connect: { Sonde_Numero_Serie: sondeNumeroSerie },
              },
            }
          : {}),
        ...(group1Id
          ? {
              t_groupe1: {
                connect: { Id_Groupe: group1Id },
              },
            }
          : {}),
        ...(group2Id
          ? {
              t_groupe2: {
                connect: { Id_Groupe: group2Id },
              },
            }
          : {}),
        ...(groupIds.length > 0
          ? {
              t_lieu_groupe: {
                createMany: {
                  data: groupIds.map((Id_Groupe) => ({ Id_Groupe })),
                  skipDuplicates: true,
                },
              },
            }
          : {}),
      },
    })

    if (sondeNumeroSerie && Object.prototype.hasOwnProperty.call(validated, "Lieu_Etat")) {
      await prisma.t_sonde.updateMany({
        where: { Sonde_Numero_Serie: sondeNumeroSerie },
        data: { Surveillance_Etat: lieuEtat },
      })
    }

    return apiOk(lieu, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "validation_error", "Invalid input", { issues: error.issues })
    }
    console.error("[POST /api/lieux]", error)
    return apiError(500, "lieu_create_failed", "Erreur lors de la création du lieu")
  }
})
