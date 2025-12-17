import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { withLogging } from "@/lib/api-logger";

export const GET = withLogging(async (req: NextRequest) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const alarmes = await prisma.t_alarme.findMany({
      include: {
        t_lieu: {
          select: {
            Nom_Lieu: true,
          },
        },
      },
      orderBy: {
        Date_Heure_Debut: "desc",
      },
    });

    const formatted = alarmes.map((alarm) => ({
      Id_Alarme: alarm.Id_Alarme,
      Id_Lieu: alarm.Id_Lieu,
      Libelle_Lieu: alarm.t_lieu?.Nom_Lieu || null,
      Date_Heure_Debut: alarm.Date_Heure_Debut,
      Date_Heure_Fin: alarm.Date_Heure_Fin,
      Est_Alarme_Vrai: alarm.Est_Alarme_Vrai,
      Est_Acquittee: alarm.Est_Acquittee,
      Valeur: alarm.Valeur,
      Unite: alarm.Unite,
      Type: alarm.Type,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Alarms fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des alarmes" },
      { status: 500 }
    );
  }
});
