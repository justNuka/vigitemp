import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { prismaChat } from "@/lib/prisma-chat"
import { checkChatAccess, verifyParticipant } from "@/lib/chat-guard"
import { getTypingUserIds } from "@/lib/chat-typing-store"
import { verifyToken } from "@/lib/jwt"
import { apiError } from "@/lib/api-response"

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const guard = await checkChatAccess()
    if (!guard.ok) return guard.response

    const { id: idParam } = await params
    const convId = parseInt(idParam, 10)
    if (isNaN(convId) || convId <= 0) return apiError(400, "invalid_id", "ID invalide")

    // Auth via cookie (SSE cannot use withAuthLogging — must return a plain Response)
    const token = req.cookies.get("auth-token")?.value
    if (!token) return apiError(401, "unauthorized", "Non authentifié")
    const payload = verifyToken(token)
    if (!payload) return apiError(401, "unauthorized", "Token invalide")

    const userId = payload.userId
    const isMember = await verifyParticipant(convId, userId)
    if (!isMember) return apiError(403, "not_participant", "Non membre")

    // Load participant IDs from chat DB, then resolve names from main DB
    const chatParticipants = await prismaChat.t_conversation_participant.findMany({
      where: { Id_Conversation: convId },
      select: { Id_Utilisateur: true },
    })
    const participantIds = chatParticipants.map((p) => p.Id_Utilisateur)

    const dbUsers = await prisma.t_utilisateur.findMany({
      where: { Id_Utilisateur: { in: participantIds } },
      select: { Id_Utilisateur: true, Prenom: true, Nom: true, Login: true },
    })
    const nameMap = new Map<number, string>()
    for (const p of dbUsers) {
      const name =
        (`${p.Prenom ?? ""} ${p.Nom ?? ""}`.trim()) || p.Login || `User ${p.Id_Utilisateur}`
      nameMap.set(p.Id_Utilisateur, name)
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        let closed = false
        let intervalId: ReturnType<typeof setInterval>

        function send() {
          if (closed) return
          const typingIds = getTypingUserIds(convId)
          const names: Record<number, string> = {}
          for (const id of typingIds) {
            const n = nameMap.get(id)
            if (n) names[id] = n
          }
          const data = JSON.stringify({ typing: typingIds, names })
          try {
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          } catch {
            closed = true
            clearInterval(intervalId)
          }
        }

        intervalId = setInterval(send, 1500)
        send() // immediate first push

        // Close after 30s to force client reconnect
        const maxTimer = setTimeout(() => {
          closed = true
          clearInterval(intervalId)
          try {
            controller.close()
          } catch {
            // already closed
          }
        }, 30_000)

        req.signal.addEventListener("abort", () => {
          closed = true
          clearInterval(intervalId)
          clearTimeout(maxTimer)
          try {
            controller.close()
          } catch {
            // already closed
          }
        })
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    })
  } catch {
    return apiError(500, "events_failed", "Erreur SSE")
  }
}
