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

    const { searchParams } = new URL(req.url);
    const serieNum = searchParams.get("serie");

    if (!serieNum) {
      return NextResponse.json(
        { error: "Numéro de série requis" },
        { status: 400 }
      );
    }

    const etalonnages = await prisma.t_etalonnage.findMany({
      where: {
        Sonde_Numero_Serie: serieNum,
      },
      select: {
        Id_Etalonnage: true,
        Date_Heure_Etalonnage: true,
        Date_Validite: true,
        Sonde_Numero_Serie: true,
        Operateur: true,
        Incertitude: true,
      },
      orderBy: {
        Date_Heure_Etalonnage: "desc",
      },
    });

    return NextResponse.json(etalonnages);
  } catch (error) {
    console.error("Etalonnages fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des étalonnages" },
      { status: 500 }
    );
  }
});
