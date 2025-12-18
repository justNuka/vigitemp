import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

    const { id: idParam } = await params;
    const groupeId = parseInt(idParam);

    if (!groupeId) {
      return NextResponse.json(
        { error: "ID groupe invalide" },
        { status: 400 }
      );
    }

    // Récupérer les lieux pour le regroupement 1
    const lieux1 = await prisma.t_lieu.findMany({
      where: {
        Id_Groupe1: groupeId,
        Est_Archive: false,
      },
      select: {
        Id_Lieu: true,
        Nom_Lieu: true,
      },
      orderBy: {
        Nom_Lieu: "asc",
      },
    });

    // Récupérer les lieux pour le regroupement 2
    const lieux2 = await prisma.t_lieu.findMany({
      where: {
        Id_Groupe2: groupeId,
        Est_Archive: false,
      },
      select: {
        Id_Lieu: true,
        Nom_Lieu: true,
      },
      orderBy: {
        Nom_Lieu: "asc",
      },
    });

    const lieux = [...lieux1, ...lieux2];

    return NextResponse.json(lieux);
  } catch (error) {
    console.error("Lieux fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des lieux" },
      { status: 500 }
    );
  }
});
