import { NextRequest } from "next/server"
import { z } from "zod"

import { apiError, apiOk } from "@/lib/api-response"
import { getRequestContext, withLogging } from "@/lib/api-logger"
import { log } from "@/lib/logger"
import { getCompatEnv, getCompatHeader } from "@/lib/vigisensys-compat"

import { broadcastSurveillanceEvent, getSurveillanceClientCount } from "../_stream"

const dispatchSchema = z.object({
  idLieu: z.number().int().positive(),
  currentValue: z.number().nullable().optional(),
  lastMeasurement: z.string().datetime().optional(),
  status: z.enum(["ok", "warning", "critical"]).optional(),
})

function isAuthorized(req: NextRequest) {
  const secret = getCompatEnv("VIGISENSYS_SURVEILLANCE_DISPATCH_SECRET", "VIGITEMP_SURVEILLANCE_DISPATCH_SECRET")
  if (!secret) return false
  return getCompatHeader(req, "x-vigisensys-secret", "x-vigitemp-secret") === secret
}

export const POST = withLogging(async (req: NextRequest) => {
  const { ip } = getRequestContext(req)

  if (!isAuthorized(req)) {
    log.warn("SURVEILLANCE_DISPATCH", "Rejected surveillance dispatch: invalid secret", { ip })
    return apiError(401, "unauthorized", "Non autorisé")
  }

  const body = await req.json().catch(() => null)
  const validated = dispatchSchema.safeParse(body)
  if (!validated.success) {
    log.warn("SURVEILLANCE_DISPATCH", "Rejected surveillance dispatch: invalid payload", {
      ip,
      issues: validated.error.issues.length,
      firstIssues: validated.error.issues.slice(0, 5).map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    })
    return apiError(400, "invalid_payload", "Payload invalide", {
      details: validated.error.flatten(),
    })
  }

  log.info("SURVEILLANCE_DISPATCH", "Dispatching surveillance measurement event", {
    ip,
    idLieu: validated.data.idLieu,
    status: validated.data.status ?? null,
    hasValue: validated.data.currentValue !== undefined,
    lastMeasurement: validated.data.lastMeasurement ?? null,
    subscribers: getSurveillanceClientCount(),
  })

  broadcastSurveillanceEvent("measurement", {
    ...validated.data,
    lastMeasurement: validated.data.lastMeasurement ?? new Date().toISOString(),
  })

  const delivered = getSurveillanceClientCount()

  return apiOk({ delivered })
})

