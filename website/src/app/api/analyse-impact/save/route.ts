import { NextRequest } from "next/server"
import { z } from "zod"
import { log } from "@/lib/logger"
import { getRequestContext } from "@/lib/api-logger"
import { withAnyAuthorizationLogging, type HandlerContext } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { getPermissionAliases } from "@/lib/permissions"

const saveSchema = z.object({
  lieuId: z.number().int().positive(),
  lieuNom: z.string(),
  dateFrom: z.string(),
  dateTo: z.string(),
  newToleranceSup: z.number().nullable(),
  newToleranceInf: z.number().nullable(),
  simAlarmCount: z.number().int(),
  realAlarmCount: z.number().int(),
  commentaireUtilisateur: z.string().min(1).max(2000),
})

export const POST = withAnyAuthorizationLogging(
  getPermissionAliases("METROLOGY_WORK_ACCESS"),
  async (req: NextRequest, ctx: HandlerContext) => {
    try {
      const { ip } = getRequestContext(req)
      const body = await req.json()
      const {
        lieuId,
        lieuNom,
        dateFrom,
        dateTo,
        newToleranceSup,
        newToleranceInf,
        simAlarmCount,
        realAlarmCount,
        commentaireUtilisateur,
      } = saveSchema.parse(body)

      log.impactAnalysis.save(
        lieuNom,
        lieuId,
        ctx.user.username,
        ctx.user.userId,
        ip,
        {
          newSup: newToleranceSup,
          newInf: newToleranceInf,
          simCount: simAlarmCount,
          realCount: realAlarmCount,
          dateRange: `${dateFrom} → ${dateTo}`,
        },
        commentaireUtilisateur,
      )

      return apiOk({ ok: true })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "invalid_input", "Invalid input")
      }
      log.error("IMPACT_ANALYSIS_SAVE", "Failed to save impact analysis", {
        error: error instanceof Error ? error.message : String(error),
      })
      return apiError(500, "save_failed", "Failed to save impact analysis")
    }
  },
)
