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

    const modules = await prisma.t_module.findMany({
      select: {
        Id_Module: true,
        Module_Numero_Serie: true,
      },
      orderBy: {
        Id_Module: "asc",
      },
    });

    return NextResponse.json(modules);
  } catch (error) {
    console.error("Modules fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des modules" },
      { status: 500 }
    );
  }
});
