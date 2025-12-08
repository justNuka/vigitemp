import { NextRequest, NextResponse } from "next/server";
import { prismaMesure } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ idLieu: string }> }
) {
  try {
    const { idLieu } = await params;
    const searchParams = req.nextUrl.searchParams;
    const rowNumber = parseInt(searchParams.get("rowNumber") || "125");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const idLieuInt = parseInt(idLieu);
    if (isNaN(idLieuInt)) {
      return NextResponse.json(
        { error: "Invalid idLieu parameter" },
        { status: 400 }
      );
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

    // Get measurements from ts_graphique (time-series database)
    const measurements = await prismaMesure.ts_graphique.findMany({
      where: whereClause,
      take: rowNumber,
      orderBy: { DateHeureMesure: "desc" },
      select: {
        IdGraphique: true,
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
        id: m.IdGraphique?.toString() || "",
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

    return NextResponse.json(formattedMeasurements);
  } catch (error) {
    console.error("Get measurements error:", error);
    return NextResponse.json(
      { error: "Failed to fetch measurements" },
      { status: 500 }
    );
  }
}
