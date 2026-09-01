import { NextRequest } from "next/server"
import { z } from "zod"

import { apiError, apiOk } from "@/lib/api-response"
import { getRequestContext, withLogging } from "@/lib/api-logger"
import { log } from "@/lib/logger"
import { getCompatEnv, getCompatHeader } from "@/lib/vigisensys-compat"

import { buildAlarmRealtimePayload } from "../_realtime"
import { broadcastAlarmEvent, getAlarmClientCount } from "../_stream"

const dispatchRealtimeSchema = z.object({
  alarmId: z.number().int().positive().optional(),
  idLieu: z.number().int().positive().optional(),
  eventType: z.enum(["triggered", "ended"]).default("triggered"),
})

function isAuthorized(req: NextRequest) {
  const secret = getCompatEnv("VIGISENSYS_ALARM_DISPATCH_SECRET", "VIGITEMP_ALARM_DISPATCH_SECRET")
  if (!secret) return false
  return getCompatHeader(req, "x-vigisensys-secret", "x-vigitemp-secret") === secret
}

export const POST = withLogging(async (req: NextRequest) => {
  const { ip } = getRequestContext(req)

  if (!isAuthorized(req)) {
    log.warn("ALARM_REALTIME", "Rejected realtime alarm dispatch: invalid secret", { ip })
    return apiError(401, "unauthorized", "Non autorisé")
  }

  const body = await req.json().catch(() => null)
  const validated = dispatchRealtimeSchema.safeParse(body)
  if (!validated.success) {
    log.warn("ALARM_REALTIME", "Rejected realtime alarm dispatch: invalid payload", {
      ip,
      issues: validated.error.issues.length,
    })
    return apiError(400, "invalid_payload", "Payload invalide", {
      details: validated.error.flatten(),
    })
  }

  const payload = await buildAlarmRealtimePayload(validated.data)
  if (!payload) {
    return apiError(404, "alarm_not_found", "Alarme introuvable")
  }

  const eventName = payload.eventType === "ended" ? "alarm-ended" : "alarm"
  broadcastAlarmEvent(eventName, payload)

  log.info("ALARM_REALTIME", "Alarm realtime event broadcasted", {
    ip,
    eventType: payload.eventType,
    alarmId: "id" in payload ? payload.id : payload.alarmId ?? null,
    idLieu: "idLieu" in payload ? payload.idLieu : null,
    subscribers: getAlarmClientCount(),
  })

  return apiOk({ delivered: getAlarmClientCount(), eventType: payload.eventType })
})
