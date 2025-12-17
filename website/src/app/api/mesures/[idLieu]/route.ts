import { NextRequest, NextResponse } from "next/server";
import { prismaMesure } from "@/lib/prisma";
import {
  getCachedMeasurements,
  setCachedMeasurements,
  shouldRefreshCache,
} from "@/lib/measurement-cache";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ idLieu: string }> }
) {
  try {
    const { idLieu } = await params;
    const searchParams = req.nextUrl.searchParams;
    // Limit maximum to 125 measurements for performance
    const rowNumberParam = parseInt(searchParams.get("rowNumber") || "125");
    const rowNumber = Math.min(rowNumberParam, 125); // Cap at 125
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const forceFresh = searchParams.get("fresh") === "true"; // Allow forcing a fresh fetch

    const idLieuInt = parseInt(idLieu);
    if (isNaN(idLieuInt)) {
      return NextResponse.json(
        { error: "Invalid idLieu parameter" },
        { status: 400 }
      );
    }

    // Check cache first (unless forcing fresh data or using date range)
    if (!forceFresh && !startDate && !endDate) {
      const cached = getCachedMeasurements(idLieuInt);
      if (cached) {
        // Return cached data with cache headers
        const response = NextResponse.json(cached);
        // Use short cache for "fresh" requests, longer for client-side cache
        response.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=900");
        response.headers.set("X-Cache", "HIT");
        return response;
      }
    }

    // Build where clause
    const whereClause: any = {
      Id_Lieu: idLieuInt,
    };

    // Add date range filter if provided
    if (startDate && endDate) {
      whereClause.Date_Heure_Mesure = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Get measurements from tm_graphique (aggregated time-series data)
    // tm_graphique has much fewer rows than tm_mesures (50M+) and gets populated via triggers
    const measurements = await prismaMesure.tm_graphique.findMany({
      where: {
        ...whereClause,
        Est_Valeur_Null: false, // Exclude null values from graph
      },
      take: rowNumber,
      orderBy: { Date_Heure_Mesure: "desc" },
      select: {
        Id_Graphique: true,
        Date_Heure_Mesure: true,
        Valeur: true,
        Unite: true,
        Consigne: true,
        Consigne_Sup: true,
        Consigne_Inf: true,
        Sonde_Numero_Serie: true,
        Frequence: true,
        Est_Etat_Alarme: true,
      },
    });

    // Reverse to get chronological order (oldest first)
    const chronologicalMeasurements = measurements.reverse();

    // Transform to API format
    const formattedMeasurements = chronologicalMeasurements.map((m: any) => {
      const dateHeure = m.Date_Heure_Mesure 
        ? new Date(m.Date_Heure_Mesure) 
        : new Date();
      
      // Format for display: DD/MM/YYYY HH:MM
      const dateDisplay = dateHeure.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // Format for X-axis: HH:MM or DD/MM if multiple days
      const dateXaxis = dateHeure.toLocaleString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        id: m.Id_Graphique?.toString() || "",
        Valeur: m.Valeur !== null ? parseFloat(m.Valeur.toString()) : 0,
        Unite: m.Unite || "°C",
        DateHeureMesure: dateDisplay,
        DateHeureMesureXaxis: dateXaxis,
        Consigne: m.Consigne !== null ? parseFloat(m.Consigne.toString()) : null,
        Consigne_Sup: m.Consigne_Sup !== null ? parseFloat(m.Consigne_Sup.toString()) : null,
        Consigne_Inf: m.Consigne_Inf !== null ? parseFloat(m.Consigne_Inf.toString()) : null,
        SondeNumeroSerie: m.Sonde_Numero_Serie || "",
        Frequence: m.Frequence || 15,
        Etat_Alarme: m.Est_Etat_Alarme || 0,
      };
    });

    // Cache the fetched measurements for future requests
    if (!startDate && !endDate) {
      setCachedMeasurements(idLieuInt, formattedMeasurements);
    }

    const response = NextResponse.json(formattedMeasurements);
    // Cache headers: 15 minutes on server, 15 minutes stale-while-revalidate on client
    // This matches the sensor measurement frequency (~15 minutes between readings)
    response.headers.set("Cache-Control", "public, s-maxage=900, stale-while-revalidate=900");
    response.headers.set("X-Cache", "MISS");
    return response;
  } catch (error) {
    console.error("Get measurements error:", error);
    return NextResponse.json(
      { error: "Failed to fetch measurements" },
      { status: 500 }
    );
  }
}
