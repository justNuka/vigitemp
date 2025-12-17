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

    const calibrages = await prisma.t_calibrage.findMany({
      where: {
        Sonde_Numero_Serie: serieNum,
      },
      select: {
        Id_Calibrage: true,
        Date_Heure_Calibrage: true,
        Sonde_Numero_Serie: true,
        Operateur: true,
        Unite: true,
        Nb_Decimale: true,
      },
      orderBy: {
        Date_Heure_Calibrage: "desc",
      },
    });

    return NextResponse.json(calibrages);
  } catch (error) {
    console.error("Calibrages fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des calibrages" },
      { status: 500 }
    );
  }
});
