import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth"
import { withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"

export const GET = withLogging(async (req: NextRequest) => {
  try {
    const user = getAuthenticatedUser(req)
    if (!user) {
      return apiError(401, "unauthenticated", "Non authentifié")
    }

    const { searchParams } = new URL(req.url)
    const regroupement = searchParams.get("regroupement")

    const where: any = {
      Est_Archive: false,
    }

    if (regroupement) {
      where.Numero_Regroupement = regroupement
    }

    const groupes = await prisma.t_groupe.findMany({
      where,
      select: {
        Id_Groupe: true,
        Nom_Groupe: true,
        Numero_Regroupement: true,
        Est_Archive: true,
        t_lieu_groupe: {
          where: { t_lieu: { Est_Archive: false } },
          select: { Id_Lieu: true },
        },
      },
      orderBy: {
        Nom_Groupe: "asc",
      },
    })

    const groupesWithCounts = groupes.map((groupe) => ({
      Id_Groupe: groupe.Id_Groupe,
      Nom_Groupe: groupe.Nom_Groupe,
      Numero_Regroupement: groupe.Numero_Regroupement,
      Est_Archive: groupe.Est_Archive,
      nombre_lieux: groupe.t_lieu_groupe.length,
    }))

    return apiOk(groupesWithCounts)
  } catch (error) {
    console.error("Groupes fetch error:", error)
    return apiError(500, "groupes_fetch_failed", "Erreur lors de la récupération des groupes")
  }
})

export const POST = withLogging(async (req: NextRequest) => {
  try {
    const user = getAuthenticatedUser(req)
    if (!user) {
      return apiError(401, "unauthenticated", "Non authentifié")
    }

    const body = await req.json()
    const { nom, regroupement } = body

    if (!nom || !regroupement) {
      return apiError(400, "missing_fields", "Nom et regroupement sont obligatoires")
    }

    const groupe = await prisma.t_groupe.create({
      data: {
        Nom_Groupe: nom,
        Numero_Regroupement: regroupement,
      },
    })

    return apiOk({
      Id_Groupe: groupe.Id_Groupe,
      Nom_Groupe: groupe.Nom_Groupe,
      Numero_Regroupement: groupe.Numero_Regroupement,
      Est_Archive: groupe.Est_Archive,
      nombre_lieux: 0,
    })
  } catch (error) {
    console.error("Groupe creation error:", error)
    return apiError(500, "groupe_create_failed", "Erreur lors de la création du groupe")
  }
})
