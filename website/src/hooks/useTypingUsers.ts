"use client"

import { useEffect, useRef, useState } from "react"

type TypingEvent = {
  typing: number[]
  names?: Record<number, string>
}

export function useTypingUsers(convId: number, currentUserId: number | undefined) {
  const [typingUserIds, setTypingUserIds] = useState<number[]>([])
  const [userNames, setUserNames] = useState<Map<number, string>>(new Map())
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!convId) return
    const es = new EventSource(`/api/chat/conversations/${convId}/events`)
    esRef.current = es

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as TypingEvent
        const ids = (data.typing ?? []).filter((id) => id !== currentUserId)
        setTypingUserIds(ids)
        if (data.names) {
          const namesSnapshot = data.names
          setUserNames((prev) => {
            const next = new Map(prev)
            for (const [id, name] of Object.entries(namesSnapshot)) {
              next.set(Number(id), name)
            }
            return next
          })
        }
      } catch {
        // ignore parse errors
      }
    }

    es.onerror = () => {
      es.close()
    }

    return () => {
      es.close()
      esRef.current = null
    }
  }, [convId, currentUserId])

  const typingNames = typingUserIds.map((id) => userNames.get(id) ?? "Quelqu'un")

  return { typingUserIds, typingNames }
}
