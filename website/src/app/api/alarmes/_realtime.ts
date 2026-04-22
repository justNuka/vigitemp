import { prisma } from "@/lib/prisma"
import { serializeDbDateTime } from "@/lib/date-display"

export type AlarmRealtimeEventType = "triggered" | "ended"

export type AlarmRealtimePayload =
  | {
      eventType: "triggered"
      id: number
      idLieu: number
      lieu: string
      type: string
      valeur: number | null
      unite: string | null
      dateDebut: string | null
      soundEnabled: boolean
    }
  | {
      eventType: "ended"
      idLieu: number
      alarmId?: number | null
    }

export async function buildAlarmRealtimePayload(input: {
  alarmId?: number | null
  idLieu?: number | null
  eventType: AlarmRealtimeEventType
}): Promise<AlarmRealtimePayload | null> {
  if (input.eventType === "ended") {
    if (!input.idLieu && !input.alarmId) return null

    let idLieu = input.idLieu ?? null
    if (!idLieu && input.alarmId) {
      const alarm = await prisma.t_alarme.findUnique({
        where: { Id_Alarme: input.alarmId },
        select: { Id_Lieu: true },
      })
      idLieu = alarm?.Id_Lieu ?? null
    }

    if (!idLieu) return null

    return {
      eventType: "ended",
      idLieu,
      alarmId: input.alarmId ?? null,
    }
  }

  if (!input.alarmId) return null

  const alarm = await prisma.t_alarme.findUnique({
    where: { Id_Alarme: input.alarmId },
    include: {
      t_lieu: {
        select: {
          Nom_Lieu: true,
          Est_Son_Alarme_Active: true,
        },
      },
    },
  })

  if (!alarm) return null

  return {
    eventType: "triggered",
    id: alarm.Id_Alarme,
    idLieu: alarm.Id_Lieu ?? input.idLieu ?? 0,
    lieu: alarm.t_lieu?.Nom_Lieu ?? "Lieu inconnu",
    type: alarm.Type ?? "",
    valeur: alarm.Valeur ?? null,
    unite: alarm.Unite ?? null,
    dateDebut: serializeDbDateTime(alarm.Date_Heure_Debut),
    soundEnabled: alarm.t_lieu?.Est_Son_Alarme_Active ?? true,
  }
}
