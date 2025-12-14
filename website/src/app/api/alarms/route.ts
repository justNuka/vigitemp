import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");

    const where: any = {};

    if (status === "active") {
      where.Acquite = false;
    } else if (status === "acknowledged") {
      where.Acquite = true;
    } else if (status === "resolved") {
      // Pour l'instant, pas d'alarmes résolues - tout est basé sur Acquite
      where.Acquite = null; // Aucune alarme ne correspondra
    }

    const alarms = await prisma.t_alarme.findMany({
      where,
      include: {
        t_lieu: {
          select: {
            Id_Lieu: true,
            Nom_Lieu: true,
          },
        },
      },
      orderBy: { Date_Heure_Debut: "desc" },
      take: 100,
    });

    // Transform to API format
    const formatted = alarms.map((alarm: any) => ({
      id: alarm.IdAlarme,
      sensorId: alarm.IdLieu || 0,
      sensorName: alarm.t_lieu?.Nom_Lieu || "Unknown",
      locationId: alarm.IdLieu || 0,
      locationName: alarm.t_lieu?.Nom_Lieu || "Unknown",
      type: alarm.Type === "H" ? "high" : alarm.Type === "B" ? "low" : "temperature",
      severity: alarm.Type === "H" || alarm.Type === "B" ? "critical" : "warning",
      status: alarm.DateHeureFin ? "resolved" : alarm.Acquite ? "acknowledged" : "active",
      message: `Alarme ${alarm.Type === "H" ? "haute" : "basse"} - ${alarm.Valeur}°C`,
      timestamp: alarm.DateHeureDebut?.toISOString() || new Date().toISOString(),
      acknowledgedAt: alarm.Acquite ? alarm.DateHeureDebut?.toISOString() : null,
      acknowledgedBy: null,
      resolvedAt: alarm.DateHeureFin?.toISOString() || null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Get alarms error:", error);
    return NextResponse.json(
      { error: "Failed to fetch alarms" },
      { status: 500 }
    );
  }
}
