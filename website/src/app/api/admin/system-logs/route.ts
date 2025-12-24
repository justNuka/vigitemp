import { NextRequest, NextResponse } from "next/server";
import { prismaMesure } from "@/lib/prisma";

/**
 * GET /api/admin/system-logs?page=1&limit=10
 * Retourne les événements système du journal d'audit avec pagination
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const rawLimit = parseInt(searchParams.get("limit") || "10", 10);
    const limit = Math.min(Math.max(rawLimit, 1), 10);
    const skip = (page - 1) * limit;

    // Récupérer le nombre total
    const totalCount = await prismaMesure.tm_journal.count();
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

    // Récupérer les logs avec pagination
    const logs = await prismaMesure.tm_journal.findMany({
      orderBy: {
        Date_Heure_Journal: "desc",
      },
      skip,
      take: Math.min(limit, 50 - skip),
    });

    // Formater les données sans les codes journaux
    const formatted = logs.map((log) => ({
      id: log.Id_Journal,
      dateTime: log.Date_Heure_Journal?.toISOString() || new Date().toISOString(),
      utilisateur: log.Nom_Utilisateur || "System",
      action: log.Commentaire || "Action système",
      details: log.Commentaire_Utilisateur || log.Profil_Utilisateur || "",
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
    console.error("Error fetching system logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch system logs" },
      { status: 500 }
    );
  }
}
