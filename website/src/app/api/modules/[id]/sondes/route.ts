import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { withLogging } from "@/lib/api-logger";

export const GET = withLogging(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const moduleId = parseInt(id);

    if (isNaN(moduleId)) {
      return NextResponse.json(
        { error: "ID du module invalide" },
        { status: 400 }
      );
    }

    const sondes = await prisma.t_sonde.findMany({
      where: {
        Id_Module: moduleId,
      },
      select: {
        Id_Sonde: true,
        Sonde_Numero_Serie: true,
        Adresse_Sonde: true,
        Port_Serie: true,
        Etat_Sonde: true,
      },
      orderBy: {
        Sonde_Numero_Serie: "asc",
      },
    });

    return NextResponse.json(sondes);
  } catch (error) {
    console.error("Sondes fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des sondes" },
      { status: 500 }
    );
  }
});
