import { NextRequest } from "next/server"

import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const GET = withAuthLogging(async (_req: NextRequest) => {
  try {
    const sondes = await prisma.t_sonde.findMany({
      include: {
        t_etat_surveillance: true,
        t_lieu: {
          select: {
            Nom_Lieu: true,
            Id_Lieu: true,
          },
        },
      },
      orderBy: {
        Sonde_Numero_Serie: "asc",
      },
    })

    const formatted = sondes.map((sonde) => ({
      Id_Sonde: sonde.Id_Sonde,
      Adresse_Sonde: sonde.Adresse_Sonde,
      Sonde_Numero_Serie: sonde.Sonde_Numero_Serie,
      Port_Serie: sonde.Port_Serie,
      Sonde_Type: (sonde as any).Sonde_Type ?? null,
      Surveillance_Etat: sonde.Surveillance_Etat,
      Surveillance_Etat_Libelle:
        sonde.t_etat_surveillance?.Surveillance_Etat_Libelle || sonde.Surveillance_Etat,
      Id_Module: sonde.Id_Module,
      Lieu: sonde.t_lieu[0]?.Nom_Lieu || null,
    }))

    return apiOk(formatted)
  } catch (error) {
    console.error("Sondes fetch error:", error)
    return apiError(500, "internal_error", "Erreur lors de la récupération des sondes")
  }
})

const createProbeSchema = z.object({
  sondeType: z.string().min(1),
  serieNum: z.string().regex(/^\d+(?:-?[TH])?$/i, "Numéro de série invalide"),
  moduleId: z.number().int().positive().nullable().optional(),
})

export const POST = withAuthLogging(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const data = createProbeSchema.parse(body)

    const normalizedType = data.sondeType.toUpperCase()
    const serial =
      normalizedType === "GSO"
        ? data.serieNum
        : `${normalizedType}${data.serieNum}`
    const adresseSonde = data.serieNum

    const existing = await prisma.t_sonde.findUnique({
      where: { Sonde_Numero_Serie: serial },
    })

    if (existing) {
      return apiError(409, "conflict", "Une sonde avec ce numéro de série existe déjà")
    }

    const created = await prisma.t_sonde.create({
      data: {
        Adresse_Sonde: adresseSonde,
        Sonde_Numero_Serie: serial,
        Id_Module: data.moduleId ?? null,
        Surveillance_Etat: "D",
      },
    })

    return apiOk(
      {
        message: "Sonde créée avec succès",
        probe: { Id_Sonde: created.Id_Sonde, Sonde_Numero_Serie: created.Sonde_Numero_Serie },
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "validation_error", "Données invalides", { details: error.issues })
    }

    console.error("Sonde create error:", error)
    return apiError(500, "internal_error", "Erreur lors de la création de la sonde")
  }
})
