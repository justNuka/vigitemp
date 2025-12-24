import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/acknowledgments
 * Retourne l'historique des acquittements d'alarmes
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const rawLimit = parseInt(searchParams.get("limit") || "10", 10);
    const limit = Math.min(Math.max(rawLimit, 1), 10);
    const skip = (page - 1) * limit;

    const where = {
      Est_Acquittee: true,
      Date_Heure_Fin: {
        not: null as any,
      },
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

    const acknowledgments = await prisma.t_alarme.findMany({
      where,
      include: {
        t_lieu: {
          select: {
            Id_Lieu: true,
            Nom_Lieu: true,
          },
        },
      },
      orderBy: {
        Date_Heure_Fin: "desc",
      },
      skip,
      take: Math.min(limit, 50 - skip),
    });

    // Formater les données
    const formatted = acknowledgments.map((ack) => ({
      id: ack.Id_Alarme,
      dateTime: ack.Date_Heure_Fin?.toISOString() || new Date().toISOString(),
      utilisateur: "System", // TODO: Récupérer depuis audit log si disponible
      action: "Acquittement",
      sonde: ack.Sonde_Numero_Serie || "Unknown",
      alarme: ack.t_lieu?.Nom_Lieu || "Unknown",
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
    console.error("Error fetching acknowledgments:", error);
    return NextResponse.json(
      { error: "Failed to fetch acknowledgments" },
      { status: 500 }
    );
  }
}
