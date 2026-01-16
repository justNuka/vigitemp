import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { sendWebPushToActiveSubscriptions } from "@/lib/web-push"
import { withLogging } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { routing } from "@/i18n/routing"
import { log } from "@/lib/logger"

const AGENT_PORT = Number.parseInt(process.env.VIGITEMP_AGENT_PORT ?? "8000", 10)
const AGENT_TIMEOUT_MS = Number.parseInt(process.env.VIGITEMP_AGENT_TIMEOUT_MS ?? "1500", 10)
const AGENT_ACTIVE_WINDOW_MINUTES = Number.parseInt(
  process.env.VIGITEMP_AGENT_ACTIVE_WINDOW_MINUTES ?? "15",
  10,
)

async function dispatchAgentNotifications(payload: {
  title: string
  messageBody: string
  locationLabel: string
  dateLabel: string
  alarmUrl: string
  alarmId?: number
  lieuId?: number
}) {
  const activeSince = new Date(Date.now() - AGENT_ACTIVE_WINDOW_MINUTES * 60 * 1000)
  const clients = await prisma.t_postes_clients.findMany({
    where: {
      Adresse_IP_Connexion: { not: null },
      Date_Heure_Derniere_Connexion: { gte: activeSince },
    },
    select: {
      Adresse_IP_Connexion: true,
      Nom_Machine_Connexion: true,
    },
  })

  const uniqueIps = new Map<string, string | null>()
  for (const client of clients) {
    if (!client.Adresse_IP_Connexion) continue
    if (!uniqueIps.has(client.Adresse_IP_Connexion)) {
      uniqueIps.set(client.Adresse_IP_Connexion, client.Nom_Machine_Connexion ?? null)
    }
  }

  const requests = Array.from(uniqueIps.entries()).map(async ([ip, machineName]) => {
    const url = `http://${ip}:${AGENT_PORT}/notify`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), AGENT_TIMEOUT_MS)

    try {
      await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: payload.title,
          message: payload.messageBody,
          location: payload.locationLabel,
          date: payload.dateLabel,
          url: payload.alarmUrl,
          alarmId: payload.alarmId,
          lieuId: payload.lieuId,
        }),
        signal: controller.signal,
      })
    } catch (error) {
      log.warn("ALARM_DISPATCH", "Agent notification failed", {
        ip,
        machineName,
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      clearTimeout(timeout)
    }
  })

  await Promise.all(requests)
}

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
  const defaultUrl = `/${routing.defaultLocale}/alarmes`
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const dateLabel = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date())
  let lieuId: number | undefined
  let locationLabel = "Lieu inconnu"

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
      const siteName = alarm.t_lieu?.t_site?.Libelle_Site ?? ""
      const sensorSerial = alarm.t_lieu?.Sonde_Numero_Serie ?? ""
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
        alarm.Type === "H" ? "Alarme haute" : alarm.Type === "B" ? "Alarme basse" : "Alarme"
      const valueLabel = `${alarm.Valeur ?? "N/A"}${alarm.Unite ?? "°C"}`
      const thresholds = [
        alarm.t_lieu?.Consigne_Sup != null ? `Sup ${alarm.t_lieu?.Consigne_Sup}${alarm.Unite ?? "°C"}` : null,
        alarm.t_lieu?.Consigne_Inf != null ? `Inf ${alarm.t_lieu?.Consigne_Inf}${alarm.Unite ?? "°C"}` : null,
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


  const result = await sendWebPushToActiveSubscriptions({
    title,
    body: messageBody,
    data: { url, alarmId },
    tag: alarmId ? `alarm-${alarmId}` : "alarm",
  })


  await dispatchAgentNotifications({
    title,
    messageBody,
    locationLabel,
    dateLabel,
    alarmUrl,
    alarmId,
    lieuId,
  })

  log.info("ALARM_DISPATCH", "Alarm dispatched to web push and agents", {
    alarmId,
    agentTargets: result?.sent ?? undefined,
  })

  return apiOk(result)
})
