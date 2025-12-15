import { NextRequest, NextResponse } from "next/server";
import { prisma, prismaMesure } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { withLogging } from "@/lib/api-logger";

/**
 * API Route optimisée pour le chargement des sensors avec pagination
 * 
 * Requête:
 * GET /api/sensors/paginated?page=1&limit=50&siteId=1&groupIds=1,2
 */
export const GET = withLogging(async (request: NextRequest) => {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const siteId = searchParams.get("siteId");
    const groupIdsStr = searchParams.get("groupIds");
    const groupIds = groupIdsStr?.split(",").map(Number).filter(Boolean) || [];

    const skip = (page - 1) * limit;

    // Construire la requête Prisma avec filtres
    const where: any = {};

    if (siteId) {
      where.Id_Site = parseInt(siteId);
    }

    if (groupIds.length > 0) {
      where.OR = [
        { Id_Groupe1: { in: groupIds } },
        { Id_Groupe2: { in: groupIds } },
      ];
    }

    // Récupérer le total
    const total = await prisma.t_lieu.count({ where });

    // Récupérer les locations filtrées avec pagination
    const locations = await prisma.t_lieu.findMany({
      where,
      include: {
        t_sonde: true,
        t_site: true,
      },
      skip,
      take: limit,
      orderBy: {
        Id_Lieu: "desc",
      },
    });

    // Récupérer les dernières mesures pour chaque location
    const sensorsWithMeasurements = await Promise.all(
      locations.map(async (location) => {
        const lastMeasurement = await prismaMesure.tm_mesures.findFirst({
          where: {
            Id_Lieu: location.Id_Lieu,
          },
          orderBy: {
            Date_Heure_Mesure: "desc",
          },
          select: {
            Valeur: true,
            Date_Heure_Mesure: true,
            Est_Etat_Alarme: true,
          },
        });

        const status: "ok" | "warning" | "critical" =
          lastMeasurement?.Est_Etat_Alarme === true ? "critical" : "ok";

        return {
          id: location.Id_Lieu.toString(),
          name: location.Nom_Lieu,
          type: "temperature",
          unit: "°C",
          currentValue: lastMeasurement?.Valeur ?? null,
          minThreshold: 0,
          maxThreshold: 25,
          lastMeasurement: lastMeasurement?.Date_Heure_Mesure ?? null,
          isActive: location.Lieu_Etat === "A",
          status,
          location: {
            id: location.Id_Lieu.toString(),
            name: location.Nom_Lieu,
            description: null,
            siteGroup: null,
            isActive: location.Lieu_Etat === "A",
            siteId: location.Id_Site,
            groupId1: location.Id_Groupe1,
            groupId2: location.Id_Groupe2,
            site: location.t_site?.Libelle_Site ?? "",
          },
        };
      })
    );

    return NextResponse.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      sensors: sensorsWithMeasurements,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des sensors paginés:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des sondes" },
      { status: 500 }
    );
  }
});
