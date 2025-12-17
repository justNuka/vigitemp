import { NextRequest, NextResponse } from "next/server";
import { prismaMesure } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    // Limit maximum to 125 measurements for performance (with 49M records, limiting is crucial)
    const limitParam = parseInt(searchParams.get("limit") || "100");
    const limit = Math.min(limitParam, 125); // Cap at 125

    // Get recent measurements from time-series database
    const measurements = await prismaMesure.tm_mesures.findMany({
      take: limit,
      orderBy: { Date_Heure_Mesure: "desc" },
      select: {
        Id_Mesure: true,
        Id_Lieu: true,
        Date_Heure_Mesure: true,
        Valeur: true,
      },
    });

    // Transform to API format
    const formattedMeasurements = measurements.map((m: any) => ({
      id: m.Id_Mesure,
      sensorId: m.Id_Lieu, // In vigitemp, measurements are per location not per sonde
      timestamp: m.Date_Heure_Mesure?.toISOString() || new Date().toISOString(),
      value: m.Valeur !== null ? parseFloat(m.Valeur.toString()) : 0,
    }));

    const response = NextResponse.json(formattedMeasurements);
    // Cache for 5 minutes on client side, revalidate from server every 1 minute
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return response;
  } catch (error) {
    console.error("Get measurements error:", error);
    return NextResponse.json(
      { error: "Failed to fetch measurements" },
      { status: 500 }
    );
  }
}
