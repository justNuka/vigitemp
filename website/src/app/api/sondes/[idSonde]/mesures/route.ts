import { prismaMesure } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/sondes/[idSonde]/mesures
 * 
 * Récupère les 125 dernières mesures pour une sonde depuis ts_graphique
 * ts_graphique est maintenu à jour par le serveur C# en temps quasi-réel
 * 
 * Response: 
 * {
 *   "mesures": [
 *     { "dateHeureMesure": "2024-12-11T10:30:00Z", "valeur": 3.5, "unite": "°C", ... },
 *     { "dateHeureMesure": "2024-12-11T10:15:00Z", "valeur": 3.6, "unite": "°C", ... }
 *   ],
 *   "derniereMaj": "2024-12-11T10:30:00Z"
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ idSonde: string }> }
) {
  try {
    const { idSonde } = await params;
    const sondeId = parseInt(idSonde, 10);

    if (isNaN(sondeId)) {
      return NextResponse.json(
        { error: "Invalid sonde ID" },
        { status: 400 }
      );
    }

    // Récupérer les 125 dernières mesures depuis ts_graphique
    const mesures = await prismaMesure.tm_graphique.findMany({
      where: { IdSonde: sondeId },
      select: {
        DateHeureMesure: true,
        Valeur: true,
        Unite: true,
        Resistance: true,
        Consigne: true,
        Consigne_Sup: true,
        Consigne_Inf: true,
        Frequence: true,
        IdLieu: true,
        Etat_Alarme: true,
      },
      orderBy: {
        DateHeureMesure: "desc",
      },
      take: 125,
    });

    // Récupérer le timestamp de la dernière mesure
    const derniereMaj =
      mesures.length > 0
        ? mesures[0].DateHeureMesure.toISOString()
        : new Date().toISOString();

    // Inverser l'ordre pour que le plus ancien soit en premier (pour les graphs)
    mesures.reverse();

    return NextResponse.json(
      {
        mesures,
        derniereMaj,
      },
      {
        headers: {
          // Cache 30 secondes côté client/CDN
          "Cache-Control": "public, max-age=30",
        },
      }
    );
  } catch (error) {
    console.error("(GET /api/sondes/[idSonde]/mesures) Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
