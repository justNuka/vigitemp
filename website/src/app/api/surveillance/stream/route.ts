import { NextRequest } from "next/server"

import { apiError } from "@/lib/api-response"
import { getAuthenticatedUser } from "@/lib/auth"

import { addSurveillanceClient } from "../_stream"

function sse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

export async function GET(req: NextRequest) {
  const user = getAuthenticatedUser(req)
  if (!user) {
    return apiError(401, "unauthenticated", "Non authentifié")
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sse(event, data)))
      }

      const safeClose = () => {
        try {
          controller.close()
        } catch {
          // ignore
        }
      }

      const removeClient = addSurveillanceClient({
        send,
        close: safeClose,
      })

      send("ready", { ok: true })

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(": ping\n\n"))
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

