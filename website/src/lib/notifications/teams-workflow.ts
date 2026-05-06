import { prisma } from "@/lib/prisma"
import { decryptTeamsSecret } from "@/lib/secret-crypto"
import { log } from "@/lib/logger"

export type TeamsAlarmEventType = "triggered" | "ended" | "acknowledged"

export type TeamsAlarmNotificationInput = {
  eventType: TeamsAlarmEventType
  alarmId?: number
  site?: string
  lieu?: string
  sonde?: string
  alarmType?: string
  triggeredAt?: string
  endedAt?: string
  lastValue?: string
  details?: string
  alarmUrl?: string
}

type TeamsWorkflowConfig = {
  enabled: boolean
  webhookUrl: string
  channelLabel: string
  notifyOnTrigger: boolean
  notifyOnEnd: boolean
  notifyOnAck: boolean
  timeoutMs: number
  dedupeWindowMinutes: number
}

const TEAMS_SECTION = "NOTIFICATIONS_TEAMS"
const DEFAULT_TIMEOUT_MS = 5000
const DEFAULT_DEDUPE_WINDOW_MINUTES = 10

function parseBool(value: string | null | undefined, fallback = false) {
  if (value == null) return fallback
  const normalized = value.trim().toLowerCase()
  if (["1", "true", "yes", "y", "oui", "on"].includes(normalized)) return true
  if (["0", "false", "no", "n", "non", "off"].includes(normalized)) return false
  return fallback
}

function parseIntParam(value: string | null | undefined, fallback: number) {
  const parsed = Number.parseInt(String(value ?? ""), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

async function getTeamsWorkflowConfig(): Promise<TeamsWorkflowConfig> {
  const params = await prisma.t_parametre.findMany({ where: { Section: TEAMS_SECTION } })
  const map = new Map(params.map((param) => [param.Mot_Cle, param.Valeur ?? ""]))

  return {
    enabled: parseBool(map.get("ENABLED"), false),
    webhookUrl: decryptTeamsSecret(map.get("WEBHOOK_URL") ?? "").trim(),
    channelLabel: (map.get("CHANNEL_LABEL") ?? "").trim(),
    notifyOnTrigger: parseBool(map.get("NOTIFY_ON_TRIGGER"), true),
    notifyOnEnd: parseBool(map.get("NOTIFY_ON_END"), true),
    notifyOnAck: parseBool(map.get("NOTIFY_ON_ACK"), false),
    timeoutMs: parseIntParam(map.get("TIMEOUT_MS"), DEFAULT_TIMEOUT_MS),
    dedupeWindowMinutes: parseIntParam(map.get("DEDUPE_WINDOW_MINUTES"), DEFAULT_DEDUPE_WINDOW_MINUTES),
  }
}

function shouldNotify(config: TeamsWorkflowConfig, eventType: TeamsAlarmEventType) {
  if (!config.enabled || !config.webhookUrl) return false
  if (eventType === "triggered") return config.notifyOnTrigger
  if (eventType === "ended") return config.notifyOnEnd
  if (eventType === "acknowledged") return config.notifyOnAck
  return false
}

function eventTitle(eventType: TeamsAlarmEventType) {
  if (eventType === "ended") return "Alarme terminee"
  if (eventType === "acknowledged") return "Alarme acquittee"
  return "Alarme declenchee"
}

function eventIcon(eventType: TeamsAlarmEventType) {
  if (eventType === "ended") return "[OK]"
  if (eventType === "acknowledged") return "[ACK]"
  return "[ALERTE]"
}

function buildTeamsText(input: TeamsAlarmNotificationInput) {
  const lines = [
    `${eventIcon(input.eventType)} **${eventTitle(input.eventType)}**`,
    "",
    input.site ? `**Site :** ${input.site}` : null,
    input.lieu ? `**Lieu :** ${input.lieu}` : null,
    input.sonde ? `**Sonde :** ${input.sonde}` : null,
    input.alarmType ? `**Type :** ${input.alarmType}` : null,
    input.lastValue ? `**Derniere valeur :** ${input.lastValue}` : null,
    input.triggeredAt ? `**Debut :** ${input.triggeredAt}` : null,
    input.endedAt ? `**Fin :** ${input.endedAt}` : null,
    input.alarmId ? `**Alarme :** #${input.alarmId}` : null,
    input.alarmUrl ? `**Lien :** ${input.alarmUrl}` : null,
    input.details ? "" : null,
    input.details ? `**Details :** ${input.details}` : null,
  ].filter((line): line is string => line !== null)

  return lines.join("\n").slice(0, 24000)
}

function buildTeamsAdaptiveCard(input: TeamsAlarmNotificationInput) {
  const facts = [
    input.site ? { title: "Site", value: input.site } : null,
    input.lieu ? { title: "Lieu", value: input.lieu } : null,
    input.sonde ? { title: "Sonde", value: input.sonde } : null,
    input.alarmType ? { title: "Type", value: input.alarmType } : null,
    input.lastValue ? { title: "Derniere valeur", value: input.lastValue } : null,
    input.triggeredAt ? { title: "Debut", value: input.triggeredAt } : null,
    input.endedAt ? { title: "Fin", value: input.endedAt } : null,
    input.alarmId ? { title: "Alarme", value: `#${input.alarmId}` } : null,
  ].filter((fact): fact is { title: string; value: string } => fact !== null)

  return {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: `${eventIcon(input.eventType)} ${eventTitle(input.eventType)}`,
        weight: "Bolder",
        size: "Large",
        wrap: true,
      },
      facts.length > 0
        ? {
            type: "FactSet",
            facts,
          }
        : null,
      input.details
        ? {
            type: "TextBlock",
            text: input.details,
            wrap: true,
            spacing: "Medium",
          }
        : null,
    ].filter(Boolean),
    actions: input.alarmUrl
      ? [
          {
            type: "Action.OpenUrl",
            title: "Ouvrir VigiSensys",
            url: input.alarmUrl,
          },
        ]
      : [],
  }
}

function buildDedupeKey(input: TeamsAlarmNotificationInput) {
  if (input.alarmId) {
    return `alarm:${input.alarmId}:${input.eventType}`
  }

  return [
    "manual",
    input.eventType,
    input.site ?? "",
    input.lieu ?? "",
    input.sonde ?? "",
    input.alarmType ?? "",
    input.triggeredAt ?? "",
    input.endedAt ?? "",
  ].join(":")
}

async function reserveTeamsNotification(input: TeamsAlarmNotificationInput, windowMinutes: number) {
  const dedupeKey = buildDedupeKey(input)
  const since = new Date(Date.now() - Math.max(1, windowMinutes) * 60 * 1000)

  const existing = await prisma.t_notification.findFirst({
    where: {
      Type: "TEAMS_WORKFLOW",
      Message: dedupeKey,
      Date_Creation: { gte: since },
    },
    orderBy: { Date_Creation: "desc" },
    select: { Id_Notification: true, Payload_Json: true },
  })

  if (existing) {
    let payload: { status?: string } | null = null
    try {
      payload = existing.Payload_Json ? JSON.parse(existing.Payload_Json) as { status?: string } : null
    } catch {
      payload = null
    }
    if (payload?.status !== "failed") {
      return { reserved: false, dedupeKey, notificationId: existing.Id_Notification }
    }
  }

  const marker = await prisma.t_notification.create({
    data: {
      Type: "TEAMS_WORKFLOW",
      Id_Alarme: input.alarmId ?? null,
      Titre: eventTitle(input.eventType),
      Message: dedupeKey.slice(0, 512),
      Payload_Json: JSON.stringify({
        status: "pending",
        eventType: input.eventType,
        alarmId: input.alarmId ?? null,
        createdAt: new Date().toISOString(),
      }),
      Priorite: 0,
    },
    select: { Id_Notification: true },
  })

  return { reserved: true, dedupeKey, notificationId: marker.Id_Notification }
}

async function updateTeamsNotificationMarker(notificationId: number, status: "sent" | "failed", data: object) {
  await prisma.t_notification.update({
    where: { Id_Notification: notificationId },
    data: {
      Payload_Json: JSON.stringify({
        status,
        updatedAt: new Date().toISOString(),
        ...data,
      }),
    },
  }).catch((error) => {
    log.warn("TEAMS_WORKFLOW", "Failed to update Teams marker", {
      notificationId,
      error: error instanceof Error ? error.message : String(error),
    })
  })
}

export async function sendTeamsWorkflowAlarmNotification(input: TeamsAlarmNotificationInput) {
  const config = await getTeamsWorkflowConfig()
  if (!shouldNotify(config, input.eventType)) {
    return {
      attempted: 0,
      sent: 0,
      skipped: config.enabled ? "event_disabled_or_missing_webhook" : "disabled",
    }
  }

  const reservation = await reserveTeamsNotification(input, config.dedupeWindowMinutes)
  if (!reservation.reserved) {
    return {
      attempted: 0,
      sent: 0,
      skipped: "duplicate_recent",
      dedupeKey: reservation.dedupeKey,
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs)

  try {
    const response = await fetch(config.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildTeamsAdaptiveCard(input)),
      signal: controller.signal,
      cache: "no-store",
    })

    if (!response.ok) {
      const body = (await response.text().catch(() => "")).slice(0, 300)
      throw new Error(`teams_workflow_http_${response.status}${body ? `: ${body}` : ""}`)
    }

    await updateTeamsNotificationMarker(reservation.notificationId, "sent", {
      eventType: input.eventType,
      alarmId: input.alarmId ?? null,
      dedupeKey: reservation.dedupeKey,
    })

    return { attempted: 1, sent: 1, skipped: null }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.name === "AbortError"
          ? `teams_workflow_timeout_${config.timeoutMs}ms`
          : error.message
        : String(error)

    log.warn("TEAMS_WORKFLOW", "Teams workflow notification failed", {
      alarmId: input.alarmId,
      eventType: input.eventType,
      error: message,
    })

    await updateTeamsNotificationMarker(reservation.notificationId, "failed", {
      eventType: input.eventType,
      alarmId: input.alarmId ?? null,
      dedupeKey: reservation.dedupeKey,
      error: message,
    })

    return { attempted: 1, sent: 0, skipped: "failed", error: message }
  } finally {
    clearTimeout(timeout)
  }
}
