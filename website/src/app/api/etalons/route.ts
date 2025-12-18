import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { withLogging } from "@/lib/api-logger";

export const GET = withLogging(async (req: NextRequest) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const etalons = await prisma.t_etalon.findMany({
      select: {
        Id_Etalon: true,
        Etalon_Numero_Serie: true,
        Etat_Etalon: true,
        Port_Serie: true,
        Id_Serveur: true,
        Id_Module: true,
        Resolution: true,
        Incertitude: true,
        Nb_Decimale: true,
        Est_Archive: true,
      },
      where: {
        Est_Archive: false,
      },
      orderBy: {
        Etalon_Numero_Serie: "asc",
      },
    });

    // Récupérer les infos de certificat et mesures pour chaque étalon
    const etalonsWithDetails = await Promise.all(
      etalons.map(async (etalon) => {
        const etalonnage = await prisma.t_etalonnage.findFirst({
          where: {
            Etalon_Numero_Serie: etalon.Etalon_Numero_Serie,
          },
          select: {
            Date_Certif: true,
            Organisme: true,
            Num_Certif: true,
            Unite: true,
          },
          orderBy: {
            Date_Heure_Etalonnage: "desc",
          },
        });

        // Récupérer les mesures associées
        const mesures = etalonnage
          ? await prisma.t_etalonnage_mesure.findMany({
              where: {
                // Pas de relation directe, donc on doit faire une requête séparée
              },
              select: {
                Numero_Ordre: true,
                Mesure_Sonde: true,
                Mesure_Etalon: true,
              },
            })
          : [];

        return {
          ...etalon,
          Date_Certif: etalonnage?.Date_Certif || null,
          Organisme: etalonnage?.Organisme || null,
          Num_Certif: etalonnage?.Num_Certif || null,
          Unite: etalonnage?.Unite || null,
        };
      })
    );

    return NextResponse.json(etalonsWithDetails);
  } catch (error) {
    console.error("Etalons fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des étalons" },
      { status: 500 }
    );
  }
});
