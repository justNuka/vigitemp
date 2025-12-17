import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/active-alarms
 * Retourne les alarmes actives (non acquittées ou récemment ouvertes)
 */
export async function GET(req: NextRequest) {
  try {
    const activeAlarms = await prisma.t_alarme.findMany({
      where: {
        OR: [
          {
            Est_Acquittee: false,
            Date_Heure_Fin: null,
          },
          {
            Date_Heure_Debut: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Dernières 7 jours
            },
          },
        ],
      },
      include: {
        t_lieu: {
          select: {
            Id_Lieu: true,
            Nom_Lieu: true,
          },
        },
      },
      orderBy: {
        Date_Heure_Debut: "desc",
      },
      take: 50,
    });

    // Formater les données
    const formatted = activeAlarms.map((alarm) => ({
      id: alarm.Id_Alarme,
      sonde: alarm.Sonde_Numero_Serie || "Unknown",
      lieu: alarm.t_lieu?.Nom_Lieu || "Unknown",
      valeur: alarm.Valeur ? `${alarm.Valeur}` : "N/A",
      seuil: `${alarm.Type === "S" ? "Sup" : "Inf"}`,
      duree: formatDuration(alarm.Date_Heure_Debut),
      statut: alarm.Est_Acquittee ? "Acquittée" : "Active",
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching active alarms:", error);
    return NextResponse.json(
      { error: "Failed to fetch active alarms" },
      { status: 500 }
    );
  }
}

function formatDuration(startDate: Date | null): string {
  if (!startDate) return "N/A";
  const now = new Date();
  const diff = now.getTime() - startDate.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
}
