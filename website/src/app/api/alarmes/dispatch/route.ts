import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { routing } from "@/i18n/routing"
import { log } from "@/lib/logger"
import { randomUUID } from "crypto"
import { revalidateTag } from "next/cache"
import { sendAlarmEventEmails } from "@/lib/alarm-email"

const AGENT_PORT = Number.parseInt(process.env.VIGITEMP_AGENT_PORT ?? "8000", 10)
const AGENT_TIMEOUT_MS = Number.parseInt(process.env.VIGITEMP_AGENT_TIMEOUT_MS ?? "1500", 10)
const AGENT_ACTIVE_WINDOW_MINUTES = Number.parseInt(
  process.env.VIGITEMP_AGENT_ACTIVE_WINDOW_MINUTES ?? "15",
  10,
)
const AGENT_SHARED_SECRET = process.env.VIGITEMP_AGENT_SECRET?.trim() ?? ""

type AgentTarget = {
  idPoste: number
  ip: string
  machineName: string | null
  deliveryId: number
  correlationId: string
}

async function dispatchAgentNotifications(
  payload: {
    title: string
    messageBody: string
    locationLabel: string
    dateLabel: string
    alarmUrl: string
    alarmId?: number
    lieuId?: number
    alarmType?: string
    triggeredAt?: string
    lastValue?: string
    lastMeasureAt?: string
  },
  targets: AgentTarget[],
) {
  if (targets.length === 0) {
    return { attempted: 0, failed: 0 }
  }

  let failed = 0

  const requests = targets.map(async (target) => {
    const { ip, machineName, deliveryId, correlationId } = target
    const url = `http://${ip}:${AGENT_PORT}/notify`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), AGENT_TIMEOUT_MS)

    try {
      const headers: Record<string, string> = { "content-type": "application/json" }
      if (AGENT_SHARED_SECRET) {
        headers["x-vigitemp-agent-secret"] = AGENT_SHARED_SECRET
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: payload.title,
          message: payload.messageBody,
          location: payload.locationLabel,
          date: payload.dateLabel,
          url: payload.alarmUrl,
          alarmId: payload.alarmId,
          lieuId: payload.lieuId,
          alarmType: payload.alarmType,
          triggeredAt: payload.triggeredAt,
          lastValue: payload.lastValue,
          lastMeasureAt: payload.lastMeasureAt,
          deliveryId,
          correlationId,
        }),
        signal: controller.signal,
      })
      if (!response.ok) {
        const responseBody = (await response.text().catch(() => "")).slice(0, 200)
        throw new Error(`agent_http_${response.status}${responseBody ? `: ${responseBody}` : ""}`)
      }

      const now = new Date()
      await prisma.$transaction([
        prisma.t_notification_delivery.update({
          where: { Id_Delivery: deliveryId },
          data: {
            Statut: "sent",
            Nb_Tentatives: { increment: 1 },
            Date_Envoi: now,
            Date_Dernier_Event: now,
            Derniere_Erreur: null,
          },
        }),
        prisma.t_notification_event.create({
          data: {
            Id_Delivery: deliveryId,
            Event_Type: "sent",
            Event_Data: JSON.stringify({ ip, machineName }),
            Date_Event: now,
          },
        }),
      ])
    } catch (error) {
      failed += 1
      const now = new Date()
      const errorMessage = error instanceof Error ? error.message : String(error)
      await prisma.$transaction([
        prisma.t_notification_delivery.update({
          where: { Id_Delivery: deliveryId },
          data: {
            Statut: "failed",
            Nb_Tentatives: { increment: 1 },
            Date_Dernier_Event: now,
            Derniere_Erreur: errorMessage.slice(0, 255),
          },
        }),
        prisma.t_notification_event.create({
          data: {
            Id_Delivery: deliveryId,
            Event_Type: "failed",
            Event_Data: JSON.stringify({ ip, machineName, error: errorMessage }),
            Date_Event: now,
          },
        }),
      ])
      log.warn("ALARM_DISPATCH", "Agent notification failed", {
        ip,
        machineName,
        error: errorMessage,
      })
    } finally {
      clearTimeout(timeout)
    }
  })

  await Promise.all(requests)

  return {
    attempted: targets.length,
    failed,
  }
}

async function getActiveAgentTargets() {
  const activeSince = new Date(Date.now() - AGENT_ACTIVE_WINDOW_MINUTES * 60 * 1000)
  const clients = await prisma.t_postes_clients.findMany({
    where: {
      Adresse_IP_Connexion: { not: null },
      Date_Heure_Derniere_Connexion: { gte: activeSince },
    },
    select: {
      Id_Poste: true,
      Adresse_IP_Connexion: true,
      Nom_Machine_Connexion: true,
    },
  })

  const uniqueIps = new Map<string, { idPoste: number; machineName: string | null }>()
  for (const client of clients) {
    if (!client.Adresse_IP_Connexion) continue
    if (!uniqueIps.has(client.Adresse_IP_Connexion)) {
      uniqueIps.set(client.Adresse_IP_Connexion, {
        idPoste: client.Id_Poste,
        machineName: client.Nom_Machine_Connexion ?? null,
      })
    }
  }

  return Array.from(uniqueIps.entries()).map(([ip, info]) => ({
    ip,
    idPoste: info.idPoste,
    machineName: info.machineName,
  }))
}

const dispatchSchema = z.object({
  alarmId: z.number().int().positive().optional(),
  title: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  url: z.string().min(1).optional(),
  eventType: z.enum(["triggered", "ended"]).optional(),
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
  const defaultUrl = `/${routing.defaultLocale}/alarmes`
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const formatDateTime = (value?: Date | null) =>
    value
      ? new Intl.DateTimeFormat("fr-FR", {
          dateStyle: "short",
          timeStyle: "medium",
        }).format(value)
      : undefined
  const dateLabel = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date())
  let lieuId: number | undefined
  let locationLabel = "Lieu inconnu"
  let alarmTypeLabel: string | undefined
  let alarmTypeCode: string | undefined
  let triggeredAtLabel: string | undefined
  let triggeredAtDate: Date | null = null
  let endedAtDate: Date | null = null
  let siteLabel: string | undefined
  let lieuLabel = "Lieu inconnu"
  let sondeLabel: string | undefined
  let consigneSupValue: number | null = null
  let consigneInfValue: number | null = null
  let consigneValue: number | null = null
  let uniteLabel: string | undefined
  let lastValueLabel: string | undefined
  let lastMeasureAtLabel: string | undefined

  if (alarmId && (!title || !messageBody || !url)) {
    const alarm = await prisma.t_alarme.findUnique({
      where: { Id_Alarme: alarmId },
      include: {
        t_lieu: {
          select: {
            Nom_Lieu: true,
            Sonde_Numero_Serie: true,
            Consigne: true,
            Consigne_Sup: true,
            Consigne_Inf: true,
            Consigne_Sup_Pre_Alarme: true,
            Consigne_Inf_Pre_Alarme: true,
            Tolerance_Surveillance_Sup: true,
            Tolerance_Surveillance_Inf: true,
            Retard_Alarme_Haut: true,
            Retard_Alarme_Bas: true,
            t_site: { select: { Libelle_Site: true } },
            t_groupe1: { select: { Nom_Groupe: true } },
            t_groupe2: { select: { Nom_Groupe: true } },
            t_lieu_groupe: { select: { t_groupe: { select: { Nom_Groupe: true } } } },
          },
        },
      },
    })

    if (alarm) {
      lieuId = alarm.Id_Lieu ?? undefined
      const lieuName = alarm.t_lieu?.Nom_Lieu ?? "Lieu inconnu"
      lieuLabel = lieuName
      const siteName = alarm.t_lieu?.t_site?.Libelle_Site ?? ""
      siteLabel = siteName || undefined
      const sensorSerial = alarm.t_lieu?.Sonde_Numero_Serie ?? ""
      sondeLabel = sensorSerial || undefined
      const groupNames = [
        alarm.t_lieu?.t_groupe1?.Nom_Groupe,
        alarm.t_lieu?.t_groupe2?.Nom_Groupe,
        ...(alarm.t_lieu?.t_lieu_groupe?.map((g) => g.t_groupe?.Nom_Groupe) ?? []),
      ]
        .filter((name, idx, arr) => name && arr.indexOf(name) === idx)
        .join(", ")

      locationLabel = [siteName, lieuName].filter(Boolean).join(" / ")
      title ??= "Alarme Vigitemp"
      const alarmType =
        alarm.Type === "H" ? "Alarme haute" : alarm.Type === "B" ? "Alarme basse" : alarm.Type === "N" ? "Non reponse" : "Alarme"
      alarmTypeCode = alarm.Type ?? undefined
      const valueLabel = `${alarm.Valeur ?? "N/A"}${alarm.Unite ?? "°C"}`
      alarmTypeLabel = alarmType
      lastValueLabel = valueLabel
      triggeredAtDate = alarm.Date_Heure_Debut_Alarme_Vrai ?? alarm.Date_Heure_Debut ?? null
      endedAtDate = alarm.Date_Heure_Fin ?? null
      triggeredAtLabel = formatDateTime(triggeredAtDate)
      lastMeasureAtLabel = formatDateTime(alarm.Date_Heure_Derniere_Mesure)
      const supTolerance =
        alarm.t_lieu?.Tolerance_Surveillance_Sup ?? alarm.t_lieu?.Consigne_Sup ?? null
      consigneValue = alarm.t_lieu?.Consigne != null ? Number(alarm.t_lieu.Consigne) : null
      uniteLabel = alarm.Unite ?? undefined
      consigneSupValue = supTolerance != null ? Number(supTolerance) : null
      const infTolerance =
        alarm.t_lieu?.Tolerance_Surveillance_Inf ?? alarm.t_lieu?.Consigne_Inf ?? null
      consigneInfValue = infTolerance != null ? Number(infTolerance) : null
      const thresholds = [
        supTolerance != null ? `Sup ${supTolerance}${alarm.Unite ?? "°C"}` : null,
        infTolerance != null ? `Inf ${infTolerance}${alarm.Unite ?? "°C"}` : null,
      ].filter(Boolean).join(" / ")
      const preAlarms = [
        alarm.t_lieu?.Consigne_Sup_Pre_Alarme != null
          ? `Pré sup ${alarm.t_lieu?.Consigne_Sup_Pre_Alarme}${alarm.Unite ?? "°C"}`
          : null,
        alarm.t_lieu?.Consigne_Inf_Pre_Alarme != null
          ? `Pré inf ${alarm.t_lieu?.Consigne_Inf_Pre_Alarme}${alarm.Unite ?? "°C"}`
          : null,
      ].filter(Boolean).join(" / ")
      const delays = [
        alarm.t_lieu?.Retard_Alarme_Haut != null ? `Retard H ${alarm.t_lieu?.Retard_Alarme_Haut}m` : null,
        alarm.t_lieu?.Retard_Alarme_Bas != null ? `Retard B ${alarm.t_lieu?.Retard_Alarme_Bas}m` : null,
      ].filter(Boolean).join(" / ")

      const detailLines = [
        siteName ? `Site: ${siteName}` : null,
        `Lieu: ${lieuName}`,
        sensorSerial ? `Sonde: ${sensorSerial}` : null,
        groupNames ? `Groupes: ${groupNames}` : null,
        `Type: ${alarmType}`,
        `Valeur: ${valueLabel}`,
        thresholds ? `Seuils: ${thresholds}` : null,
        preAlarms ? `Pré-alarmes: ${preAlarms}` : null,
        delays ? `Retards: ${delays}` : null,
      ].filter(Boolean)

      messageBody ??= detailLines.join(" | ")
      url ??= defaultUrl
    }
  }

  title ??= "Alarme Vigitemp"
  messageBody ??= "Une alarme a été déclenchée."
  url ??= defaultUrl

  const alarmUrl = url.startsWith("http")
    ? url
    : `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`
  const eventType = validated.data.eventType ?? (endedAtDate ? "ended" : "triggered")

  const safeTitle = title.slice(0, 128)
  const safeMessage = messageBody.slice(0, 512)
  const payloadJson = JSON.stringify({
    title: safeTitle,
    message: safeMessage,
    location: locationLabel,
    date: dateLabel,
    url: alarmUrl,
    alarmId,
    lieuId,
    alarmType: alarmTypeLabel,
    triggeredAt: triggeredAtLabel,
    lastValue: lastValueLabel,
    lastMeasureAt: lastMeasureAtLabel,
  })

  const notification = await prisma.t_notification.create({
    data: {
      Type: "ALARM",
      Id_Alarme: alarmId ?? null,
      Titre: safeTitle,
      Message: safeMessage,
      Payload_Json: payloadJson,
      Priorite: 0,
    },
  })

  let agentResult = { attempted: 0, failed: 0 }
  if (eventType !== "ended") {
    const targets = await getActiveAgentTargets()
    const deliveries = await Promise.all(
      targets.map(async (target) => {
        const correlationId = randomUUID()
        const delivery = await prisma.t_notification_delivery.create({
          data: {
            Id_Notification: notification.Id_Notification,
            Id_Poste: target.idPoste,
            Id_Utilisateur: null,
            Statut: "queued",
            Nb_Tentatives: 0,
            Date_Queue: new Date(),
            Correlation_Id: correlationId,
          },
          select: { Id_Delivery: true },
        })

        return {
          ...target,
          deliveryId: delivery.Id_Delivery,
          correlationId,
        }
      }),
    )

    agentResult = await dispatchAgentNotifications(
      {
        title: safeTitle,
        messageBody: safeMessage,
        locationLabel,
        dateLabel,
        alarmUrl,
        alarmId,
        lieuId,
        alarmType: alarmTypeLabel,
        triggeredAt: triggeredAtLabel,
        lastValue: lastValueLabel,
        lastMeasureAt: lastMeasureAtLabel,
      },
      deliveries,
    )
  }

  log.info("ALARM_DISPATCH", "Alarm dispatched to agents", {
    alarmId,
    agentTargets: agentResult.attempted,
    agentFailed: agentResult.failed,
  })

  const emailResult = await sendAlarmEventEmails({
    eventType,
    alarmId,
    site: siteLabel,
    lieu: lieuLabel,
    sonde: sondeLabel,
    alarmTypeCode: alarmTypeCode ?? alarmTypeLabel,
    triggeredAt: triggeredAtDate,
    endedAt: endedAtDate,
    lastValue: lastValueLabel,
    details: safeMessage,
    alarmUrl,
    idLieu: lieuId,
    unite: uniteLabel,
    consigneSup: consigneSupValue,
    consigneInf: consigneInfValue,
    consigne: consigneValue,
  })

  log.info("ALARM_EMAIL", "Alarm email dispatch result", {
    alarmId,
    attempted: emailResult.attempted,
    sent: emailResult.sent,
    skipped: emailResult.skipped,
  })

  revalidateTag("dashboard-active-alarms", "default")
  revalidateTag("dashboard-stats", "default")
  revalidateTag("dashboard-critical-sensors", "default")
  revalidateTag("dashboard-sensor-overview", "default")
  revalidateTag("dashboard-alarm-trend", "default")

  return apiOk({
    agentTargets: agentResult.attempted,
    agentFailed: agentResult.failed,
    emailAttempted: emailResult.attempted,
    emailSent: emailResult.sent,
    emailSkipped: emailResult.skipped,
  })
})
