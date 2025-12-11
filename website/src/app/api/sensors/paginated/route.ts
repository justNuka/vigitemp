import { NextRequest, NextResponse } from "next/server";
import { prisma, prismaMesure } from "@/lib/prisma";

interface SensorWithLatestMeasurement {
  id: number;
  name: string;
  location: {
    id: number;
    name: string;
  };
  latestMeasurement: {
    value: number;
    date: Date;
  } | null;
}

/**
 * API Route optimisée pour le chargement des sensors avec pagination
 * Supporte:
 * - Pagination via offset/limit
 * - Filtrage par site/groupe
 * - Récupération des dernières mesures de manière efficace
 * 
 * Requête:
 * GET /api/sensors/paginated?offset=0&limit=8&siteId=1&groupIds=1,2
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const offset = parseInt(searchParams.get("offset") || "0");
    const limit = parseInt(searchParams.get("limit") || "8");
    const siteId = searchParams.get("siteId");
    const groupIdsStr = searchParams.get("groupIds");
    const groupIds = groupIdsStr?.split(",").map(Number) || [];

    // Validation
    if (offset < 0 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    // Construire la requête Prisma avec filtres
    let whereCondition: any = {};

    if (siteId) {
      whereCondition.IdSite = parseInt(siteId);
    }

    if (groupIds.length > 0) {
      whereCondition.OR = [
        { IdGroupe1: { in: groupIds } },
        { IdGroupe2: { in: groupIds } },
      ];
    }

    // Récupérer les locations filtrées avec pagination
    const locations = await prisma.t_lieu.findMany({
      where: whereCondition,
      include: {
        t_sonde: true, // Inclure les informations de sonde
        t_site: true,
      },
      skip: offset,
      take: limit,
      orderBy: {
        IdLieu: "desc", // Ordonner par défaut
      },
    });

    // Récupérer le total pour savoir s'il y a plus de données
    const total = await prisma.t_lieu.count({
      where: whereCondition,
    });

    // Récupérer les dernières mesures pour chaque location
    // OPTIMISATION: Faire une seule requête par location plutôt que N requêtes
    const locationsWithMeasurements = await Promise.all(
      locations.map(async (location) => {
        // Récupérer la dernière mesure
        const lastMeasurement = await prismaMesure.ts_mesure.findFirst({
          where: {
            IdLieu: location.IdLieu,
          },
          orderBy: {
            DateHeureMesure: "desc",
          },
          take: 1,
          select: {
            Valeur: true,
            DateHeureMesure: true,
          },
        });

        return {
          id: location.IdLieu,
          name: location.Nom_Lieu,
          location: {
            id: location.IdLieu,
            name: location.Nom_Lieu,
            siteId: location.IdSite,
            groupId1: location.IdGroupe1,
            groupId2: location.IdGroupe2,
          },
          sonde: location.t_sonde ? {
            numeroSerie: location.t_sonde.SondeNumeroSerie,
            status: location.t_sonde.Etat_Sonde,
          } : null,
          latestMeasurement: lastMeasurement ? {
            value: lastMeasurement.Valeur,
            date: lastMeasurement.DateHeureMesure,
          } : null,
        };
      })
    );

    // Retourner avec les headers de pagination
    return NextResponse.json(
      {
        data: locationsWithMeasurements,
        pagination: {
          offset,
          limit,
          total,
          hasMore: offset + limit < total,
          count: locationsWithMeasurements.length,
        },
      },
      {
        headers: {
          "Cache-Control": "private, max-age=30", // Cache 30 secondes
        },
      }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des sensors:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}
