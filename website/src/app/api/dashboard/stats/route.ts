import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get total locations
    const totalLocations = await prisma.t_lieu.count({
      where: { Est_Archive: false },
    });

    // Get active alarms (not acknowledged = Est_Acquittee false, regardless of DateHeureFin)
    const activeAlarms = await prisma.t_alarme.count({
      where: {
        Est_Acquittee: false,
      },
    });

    // Get location status counts from t_lieu (Lieu_Etat: O=ok, A=alarme, P=prealarm)
    const locations = await prisma.t_lieu.findMany({
      where: { Est_Archive: false },
      select: { Lieu_Etat: true },
    });

    const okSensors = locations.filter((l: { Lieu_Etat: string | null }) => l.Lieu_Etat === "O").length;
    const warningSensors = locations.filter((l: { Lieu_Etat: string | null }) => l.Lieu_Etat === "P").length;
    const criticalSensors = locations.filter((l: { Lieu_Etat: string | null }) => l.Lieu_Etat === "A").length;
    const alertSensors = warningSensors + criticalSensors;

    return NextResponse.json({
      totalLocations,
      activeAlarms,
      okSensors,
      alertSensors,
      warningSensors,
      criticalSensors,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
