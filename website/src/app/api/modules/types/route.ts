import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withLogging } from "@/lib/api-logger";

/**
 * GET /api/modules/types
 * Récupère tous les types de modules
 */
export const GET = withLogging(async (req: NextRequest) => {
  const types = await prisma.t_module_type.findMany({
    select: {
      Id_Module_Type: true,
      Libelle_Type_Module: true,
      Libelle_Module: true,
    },
    orderBy: {
      Libelle_Type_Module: "asc",
    },
  });

  return NextResponse.json(types);
});
