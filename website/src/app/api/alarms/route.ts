import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");

    const where: any = {};

    if (status === "active") {
      where.Est_Acquittee = false;
    } else if (status === "acknowledged") {
      where.Est_Acquittee = true;
    } else if (status === "resolved") {
      // Pour l'instant, pas d'alarmes résolues - tout est basé sur Est_Acquittee
      where.Est_Acquittee = null; // Aucune alarme ne correspondra
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
      id: alarm.Id_Alarme,
      sensorId: alarm.Id_Lieu || 0,
      sensorName: alarm.t_lieu?.Nom_Lieu || "Unknown",
      locationId: alarm.Id_Lieu || 0,
      locationName: alarm.t_lieu?.Nom_Lieu || "Unknown",
      type: alarm.Type === "H" ? "high" : alarm.Type === "B" ? "low" : "temperature",
      severity: alarm.Type === "H" || alarm.Type === "B" ? "critical" : "warning",
      status: alarm.Date_Heure_Fin ? "resolved" : alarm.Est_Acquitee ? "acknowledged" : "active",
      message: `Alarme ${alarm.Type === "H" ? "haute" : "basse"} - ${alarm.Valeur}°C`,
      timestamp: alarm.Date_Heure_Debut?.toISOString() || new Date().toISOString(),
      acknowledgedAt: alarm.Est_Acquitee ? alarm.Date_Heure_Debut?.toISOString() : null,
      acknowledgedBy: null,
      resolvedAt: alarm.Date_Heure_Fin?.toISOString() || null,
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
