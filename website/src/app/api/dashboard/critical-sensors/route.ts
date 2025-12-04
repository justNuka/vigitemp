import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const criticalLocations = await prisma.t_lieu.findMany({
      where: {
        Archive: false,
        Lieu_Etat: "A", // A = Alarme (critical)
      },
      orderBy: { DernierDateHeure: "desc" },
      take: 10,
      include: {
        t_site: {
          select: {
            IdSite: true,
            LibelleSite: true,
          },
        },
      },
    });

    // Transform to API format
    const formatted = criticalLocations.map((location: any) => ({
      id: location.IdLieu,
      name: location.Nom_Lieu || "Lieu sans nom",
      status: "critical" as const,
      value: location.DernierValeur !== null ? parseFloat(location.DernierValeur.toString()) : null,
      unit: location.DernierUnite || "°C",
      lastUpdate: location.DernierDateHeure?.toISOString() || new Date().toISOString(),
      location: {
        id: location.IdLieu,
        name: location.Nom_Lieu || "Unknown",
      },
      minThreshold: location.Consigne_Inf,
      maxThreshold: location.Consigne_Sup,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Get critical sensors error:", error);
    return NextResponse.json(
      { error: "Failed to fetch critical sensors" },
      { status: 500 }
    );
  }
}
