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

    const lieux = await prisma.t_lieu.findMany({
      where: {
        Est_Archive: false,
        t_lieu_groupe: {
          some: { Id_Groupe: groupeId },
        },
      },
      select: {
        Id_Lieu: true,
        Nom_Lieu: true,
      },
      orderBy: {
        Nom_Lieu: "asc",
      },
    });

    return NextResponse.json(lieux);
  } catch (error) {
    console.error("Lieux fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des lieux" },
      { status: 500 }
    );
  }
});
