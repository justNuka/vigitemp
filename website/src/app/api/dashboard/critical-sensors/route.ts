import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const criticalLocations = await prisma.t_lieu.findMany({
      where: {
        Est_Archive: false,
        Lieu_Etat: "A", // A = Alarme (critical)
      },
      orderBy: { Derniere_Date_Heure: "desc" },
      take: 10,
      include: {
        t_site: {
          select: {
            Id_Site: true,
            Code_Site: true,
            Libelle_Site: true,
          },
        },
      },
    });

    // Transform to API format
    const formatted = criticalLocations.map((location: any) => ({
      id: location.Id_Lieu,
      name: location.Nom_Lieu || "Lieu sans nom",
      status: "critical" as const,
      value: location.Derniere_Valeur !== null ? parseFloat(location.Derniere_Valeur?.toString() ?? "") : null,
      unit: location.Derniere_Unite || "°C",
      lastUpdate: location.Derniere_Date_Heure?.toISOString() || new Date().toISOString(),
      location: {
        id: location.Id_Lieu,
        name: location.t_site?.Code_Site && location.t_site?.Libelle_Site
          ? `${location.t_site.Code_Site} - ${location.t_site.Libelle_Site}`
          : location.t_site?.Code_Site || location.t_site?.Libelle_Site || "Unknown",
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
