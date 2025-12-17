import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/acknowledgments
 * Retourne l'historique des acquittements d'alarmes
 */
export async function GET(req: NextRequest) {
  try {
    const acknowledgments = await prisma.t_alarme.findMany({
      where: {
        Est_Acquittee: true,
        Date_Heure_Fin: {
          not: null,
        },
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
        Date_Heure_Fin: "desc",
      },
      take: 50,
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

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching acknowledgments:", error);
    return NextResponse.json(
      { error: "Failed to fetch acknowledgments" },
      { status: 500 }
    );
  }
}
