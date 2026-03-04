import { NextRequest } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { apiError } from "@/lib/api-response"
import { getAccessibleLieuIds } from "@/lib/location-access-scope"

import { addAlarmClient } from "../_stream"

function sse(event: string, data: unknown) {
  return `event: ${event}
data: ${JSON.stringify(data)}\n\n`
}

export async function GET(req: NextRequest) {
  const user = getAuthenticatedUser(req)
  if (!user) {
    return apiError(401, "unauthenticated", "Non authentifié")
  }

  const accessibleLieuIds = await getAccessibleLieuIds(user.userId)
  const accessibleLieuSet = accessibleLieuIds ? new Set(accessibleLieuIds) : null

  const encoder = new TextEncoder()

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

      const removeClient = addAlarmClient({
        send,
        close: safeClose,
        canReceive: (_event, data) => {
          if (!accessibleLieuSet) return true
          if (!data || typeof data !== "object") return false
          const eventData = data as { idLieu?: unknown }
          return typeof eventData.idLieu === "number" && accessibleLieuSet.has(eventData.idLieu)
        },
      })

      send("ready", { ok: true })

      const keepAlive = setInterval(() => {
        enqueue(encoder.encode(": ping\n\n"))
      }, 25000)

      req.signal.addEventListener("abort", () => {
        clearInterval(keepAlive)
        removeClient()
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
