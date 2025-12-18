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

    const types = await prisma.t_etalon_type.findMany({
      select: {
        Type_Etalon: true,
        Nom: true,
        Descriptif: true,
        Resolution: true,
      },
      orderBy: {
        Type_Etalon: "asc",
      },
    });

    return NextResponse.json(types);
  } catch (error) {
    console.error("Etalon types fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des types d'étalons" },
      { status: 500 }
    );
  }
});
