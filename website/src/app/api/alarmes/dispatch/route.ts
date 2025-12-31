import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { sendWebPushToActiveSubscriptions } from "@/lib/web-push"
import { withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { routing } from "@/i18n/routing"

const dispatchSchema = z.object({
  alarmId: z.number().int().positive().optional(),
  title: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  url: z.string().min(1).optional(),
})

function isAuthorized(req: NextRequest) {
  const secret = process.env.VIGITEMP_ALARM_DISPATCH_SECRET
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

  let title = validated.data.title
  let messageBody = validated.data.body
  let url = validated.data.url
  const alarmId = validated.data.alarmId
  const defaultUrl = `/${routing.defaultLocale}/surveillance`

  if (alarmId && (!title || !messageBody || !url)) {
    const alarm = await prisma.t_alarme.findUnique({
      where: { Id_Alarme: alarmId },
      include: { t_lieu: { select: { Nom_Lieu: true } } },
    })

    if (alarm) {
      title ??= "Alarme Vigitemp"
      messageBody ??= `${alarm.t_lieu?.Nom_Lieu ?? "Lieu inconnu"} - ${
        alarm.Type === "H" ? "Alarme haute" : alarm.Type === "B" ? "Alarme basse" : "Alarme"
      } (${alarm.Valeur ?? "N/A"}${alarm.Unite ?? "°C"})`
      url ??= defaultUrl
    }
  }

  title ??= "Alarme Vigitemp"
  messageBody ??= "Une alarme a été déclenchée."
  url ??= defaultUrl

  const result = await sendWebPushToActiveSubscriptions({
    title,
    body: messageBody,
    data: { url, alarmId },
    tag: alarmId ? `alarm-${alarmId}` : "alarm",
  })

  return apiOk(result)
})
