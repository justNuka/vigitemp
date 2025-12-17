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

    const sondes = await prisma.t_sonde.findMany({
      select: {
        Id_Sonde: true,
        Adresse_Sonde: true,
        Sonde_Numero_Serie: true,
        Port_Serie: true,
        Etat_Sonde: true,
        Id_Module: true,
        t_lieu: {
          select: {
            Nom_Lieu: true,
            Id_Lieu: true,
          },
        },
      },
      orderBy: {
        Sonde_Numero_Serie: "asc",
      },
    });

    const formatted = sondes.map((sonde) => ({
      Id_Sonde: sonde.Id_Sonde,
      Adresse_Sonde: sonde.Adresse_Sonde,
      Sonde_Numero_Serie: sonde.Sonde_Numero_Serie,
      Port_Serie: sonde.Port_Serie,
      Etat_Sonde: sonde.Etat_Sonde,
      Id_Module: sonde.Id_Module,
      Lieu: sonde.t_lieu[0]?.Nom_Lieu || null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Sondes fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des sondes" },
      { status: 500 }
    );
  }
});
