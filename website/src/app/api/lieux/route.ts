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

    const lieux = await prisma.t_lieu.findMany({
      select: {
        Id_Lieu: true,
        Nom_Lieu: true,
        Est_Archive: true,
      },
      where: {
        Est_Archive: false,
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
