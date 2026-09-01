import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withOneOrHigherAnyAuthorizationLogging } from "@/lib/license-guards"
import { apiOk } from "@/lib/api-response"
import { getPermissionAliases } from "@/lib/permissions"

const MODULE_ACCESS_CODES = getPermissionAliases("HARDWARE_CONFIG_ACCESS")

/**
 * GET /api/modules/types
 * Récupère tous les types de modules
 */
export const GET = withOneOrHigherAnyAuthorizationLogging(MODULE_ACCESS_CODES, async (_req: NextRequest) => {
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
