import { NextRequest } from "next/server"
import { z } from "zod"

import { apiError, apiOk } from "@/lib/api-response"
import { withLogging } from "@/lib/api-logger"

import { broadcastSurveillanceEvent, getSurveillanceClientCount } from "../_stream"

const dispatchSchema = z.object({
  idLieu: z.number().int().positive(),
  currentValue: z.number().nullable().optional(),
  lastMeasurement: z.string().datetime().optional(),
  status: z.enum(["ok", "warning", "critical"]).optional(),
})

function isAuthorized(req: NextRequest) {
  const secret = process.env.VIGITEMP_SURVEILLANCE_DISPATCH_SECRET
  if (!secret) return false
  return req.headers.get("x-vigitemp-secret") === secret
}

export const POST = withLogging(async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return apiError(401, "unauthorized", "Non autorisé")
  }

  const body = await req.json().catch(() => null)
  const validated = dispatchSchema.safeParse(body)
  if (!validated.success) {
    return apiError(400, "invalid_payload", "Payload invalide", {
      details: validated.error.flatten(),
    })
  }

  broadcastSurveillanceEvent("measurement", {
    ...validated.data,
    lastMeasurement: validated.data.lastMeasurement ?? new Date().toISOString(),
  })

  return apiOk({ delivered: getSurveillanceClientCount() })
})

