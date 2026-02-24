import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth"
import { apiError } from "@/lib/api-response"

type AlarmEvent = {
  id: number
  lieu: string
  type: "H" | "B" | string
  valeur: number | null
  unite: string | null
  dateDebut: string | null
}

function formatAlarmEvent(alarm: any): AlarmEvent {
  return {
    id: alarm.Id_Alarme,
    lieu: alarm.t_lieu?.Nom_Lieu ?? "Lieu inconnu",
    type: alarm.Type ?? "",
    valeur: alarm.Valeur ?? null,
    unite: alarm.Unite ?? null,
    dateDebut: alarm.Date_Heure_Debut ? alarm.Date_Heure_Debut.toISOString() : null,
  }
}

function sse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

export async function GET(req: NextRequest) {
  const user = getAuthenticatedUser(req)
  if (!user) {
    return apiError(401, "unauthenticated", "Non authentifié")
  }

  const encoder = new TextEncoder()
  let baselineInitialized = false
  let lastActiveIds = new Set<number>()

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let isClosed = false

      const enqueue = (chunk: Uint8Array) => {
        if (isClosed) return false
        try {
          controller.enqueue(chunk)
          return true
        } catch {
          isClosed = true
          return false
        }
      }

      const send = (event: string, data: unknown) => {
        enqueue(encoder.encode(sse(event, data)))
      }

      const safeClose = () => {
        if (isClosed) return
        isClosed = true
        try {
          controller.close()
        } catch {
          // ignore
        }
      }

      const poll = async () => {
        try {
          const active = await prisma.t_alarme.findMany({
            where: {
              Est_Acquittee: false,
              Date_Heure_Fin: null,
              Est_Alarme_Vrai: true,
            },
            include: { t_lieu: { select: { Nom_Lieu: true } } },
            orderBy: { Date_Heure_Debut: "desc" },
            take: 50,
          })

          const activeIds = new Set<number>(active.map((a) => a.Id_Alarme))

          if (!baselineInitialized) {
            baselineInitialized = true
            lastActiveIds = activeIds
            send("ready", { ok: true })
            return
          }

          const newlyActive = active.filter((a) => !lastActiveIds.has(a.Id_Alarme))
          lastActiveIds = activeIds

          for (const alarm of newlyActive) {
            send("alarm", formatAlarmEvent(alarm))
          }
        } catch {
          send("error", { message: "Erreur lors de la récupération des alarmes" })
        }
      }

      const keepAlive = setInterval(() => {
        enqueue(encoder.encode(": ping\n\n"))
      }, 25000)

      const interval = setInterval(() => {
        void poll()
      }, 5000)

      void poll()

      req.signal.addEventListener("abort", () => {
        clearInterval(interval)
        clearInterval(keepAlive)
        safeClose()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
