import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAdminLogging } from "@/lib/api-wrappers"
import { apiOk } from "@/lib/api-response"

/**
 * GET /api/modules/types
 * Récupère tous les types de modules
 */
export const GET = withAdminLogging(async (_req: NextRequest) => {
  const types = await prisma.t_module_type.findMany({
    select: {
      Id_Module_Type: true,
      Libelle_Type_Module: true,
      Libelle_Module: true,
    },
    orderBy: {
      Libelle_Type_Module: "asc",
    },
  })

  return apiOk(types)
})
