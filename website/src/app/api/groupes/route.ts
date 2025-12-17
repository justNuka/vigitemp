import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { withLogging } from "@/lib/api-logger";

export const GET = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const groups = await prisma.t_groupe.findMany({
    where: {
      Est_Archive: false,
    },
    select: {
      Id_Groupe: true,
      Nom_Groupe: true,
      Est_Archive: true,
    },
    orderBy: {
      Nom_Groupe: "asc",
    },
  });

  return NextResponse.json(groups);
});
