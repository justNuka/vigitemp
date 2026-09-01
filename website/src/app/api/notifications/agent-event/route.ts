import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getClientIp, withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { requireOneOrHigherLicense } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { getCompatEnv, getCompatHeader } from "@/lib/vigisensys-compat"

const eventSchema = z.object({
  deliveryId: z.number().int().positive().optional(),
  correlationId: z.string().min(1).optional(),
  eventType: z.string().min(1),
  eventData: z.string().optional(),
  alarmId: z.number().int().optional(),
  lieuId: z.number().int().optional(),
  machineName: z.string().optional(),
  ip: z.string().optional(),
})


function isAuthorized(req: NextRequest) {
  const secret = getCompatEnv("VIGISENSYS_AGENT_SECRET", "VIGITEMP_AGENT_SECRET")
  if (!secret) return false
  return getCompatHeader(req, "x-vigisensys-agent-secret", "x-vigitemp-agent-secret") === secret
}

export const POST = withLogging(async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    log.warn("AGENT_EVENT", "Agent non autorise", {
      ip: getClientIp(req),
    })
    return apiError(401, "unauthorized", "Non autorise")
  }

  const licenseError = await requireOneOrHigherLicense()
  if (licenseError) return licenseError

  const body = await req.json().catch(() => null)
  const validated = eventSchema.safeParse(body)
  if (!validated.success) {
    return apiError(400, "invalid_payload", "Payload invalide", {
      details: validated.error.flatten(),
    })
  }

  const { deliveryId, correlationId, eventType, eventData, alarmId, lieuId, machineName, ip } =
    validated.data

  if (!deliveryId && !correlationId) {
    return apiError(400, "missing_delivery", "Identifiant de livraison manquant")
  }

  const delivery = await prisma.t_notification_delivery.findFirst({
    where: deliveryId
      ? { Id_Delivery: deliveryId }
      : { Correlation_Id: correlationId ?? undefined },
  })

  if (!delivery) {
    return apiError(404, "delivery_not_found", "Livraison introuvable")
  }

  const normalizedType = eventType.trim().toLowerCase()
  let nextStatus: string | undefined
  switch (normalizedType) {
    case "shown":
      nextStatus = "shown"
      break
    case "clicked":
      nextStatus = "clicked"
      break
    case "closed":
      nextStatus = "dismissed"
      break
    case "failed":
    case "error":
      nextStatus = "failed"
      break
    case "sent":
      nextStatus = "sent"
      break
    default:
      nextStatus = undefined
      break
  }

  if (nextStatus === "dismissed" && delivery.Statut === "clicked") {
    nextStatus = "clicked"
  }

  const now = new Date()
  const updateData: Record<string, unknown> = {
    Date_Dernier_Event: now,
  }

  if (nextStatus) {
    updateData.Statut = nextStatus
  }

  if (!delivery.Date_Ack_Agent && ["shown", "clicked", "closed"].includes(normalizedType)) {
    updateData.Date_Ack_Agent = now
  }

  if (nextStatus === "failed") {
    updateData.Derniere_Erreur = (eventData ?? "Erreur agent").slice(0, 255)
  }

  const eventPayload = JSON.stringify({
    eventData,
    alarmId,
    lieuId,
    machineName,
    ip,
  })

  await prisma.$transaction([
    prisma.t_notification_delivery.update({
      where: { Id_Delivery: delivery.Id_Delivery },
      data: updateData,
    }),
    prisma.t_notification_event.create({
      data: {
        Id_Delivery: delivery.Id_Delivery,
        Event_Type: normalizedType,
        Event_Data: eventPayload,
        Date_Event: now,
      },
    }),
  ])

  log.info("AGENT_EVENT", "Agent notification event", {
    deliveryId: delivery.Id_Delivery,
    eventType: normalizedType,
    status: nextStatus ?? delivery.Statut,
    machineName,
    ip,
  })

  return apiOk({ ok: true })
})
