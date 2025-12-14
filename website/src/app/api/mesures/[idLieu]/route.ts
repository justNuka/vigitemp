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
      IdLieu: idLieuInt,
    };

    // Add date range filter if provided
    if (startDate && endDate) {
      whereClause.DateHeureMesure = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Get measurements from ts_mesure (time-series database)
    // Filter out null values for chart plotting
    const measurements = await prismaMesure.tm_mesure.findMany({
      where: {
        ...whereClause,
        Valeur: { not: null }, // Exclude null values from graph
      },
      take: rowNumber,
      orderBy: { DateHeureMesure: "desc" },
      select: {
        IdMesure: true,
        DateHeureMesure: true,
        Valeur: true,
        Unite: true,
        Consigne: true,
        Consigne_Sup: true,
        Consigne_Inf: true,
        SondeNumeroSerie: true,
        Frequence: true,
        Etat_Alarme: true,
      },
    });

    // Reverse to get chronological order (oldest first)
    const chronologicalMeasurements = measurements.reverse();

    // Transform to API format
    const formattedMeasurements = chronologicalMeasurements.map((m: any) => {
      const dateHeure = m.DateHeureMesure 
        ? new Date(m.DateHeureMesure) 
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
        id: m.IdMesure?.toString() || "",
        Valeur: m.Valeur !== null ? parseFloat(m.Valeur.toString()) : 0,
        Unite: m.Unite || "°C",
        DateHeureMesure: dateDisplay,
        DateHeureMesureXaxis: dateXaxis,
        Consigne: m.Consigne !== null ? parseFloat(m.Consigne.toString()) : null,
        Consigne_Sup: m.Consigne_Sup !== null ? parseFloat(m.Consigne_Sup.toString()) : null,
        Consigne_Inf: m.Consigne_Inf !== null ? parseFloat(m.Consigne_Inf.toString()) : null,
        SondeNumeroSerie: m.SondeNumeroSerie || "",
        Frequence: m.Frequence || 15,
        Etat_Alarme: m.Etat_Alarme || 0,
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
