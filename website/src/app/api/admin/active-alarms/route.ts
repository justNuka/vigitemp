import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/active-alarms
 * Retourne les alarmes actives (non acquittées ou récemment ouvertes)
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const rawLimit = parseInt(searchParams.get("limit") || "10", 10);
    const limit = Math.min(Math.max(rawLimit, 1), 10);
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        {
          Est_Acquittee: false,
          Date_Heure_Fin: null as any,
        },
        {
          Date_Heure_Debut: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Derni\u00e8res 7 jours
          },
        },
      ],
    };

    const totalCount = await prisma.t_alarme.count({ where });
    const total = Math.min(totalCount, 50);

    if (skip >= total) {
      return NextResponse.json({
        data: [],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) || 1,
        },
      });
    }
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
      skip,
      take: Math.min(limit, 50 - skip),
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

    return NextResponse.json({
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
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
