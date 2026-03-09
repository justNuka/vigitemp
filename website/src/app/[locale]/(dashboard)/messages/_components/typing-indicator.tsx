"use client"

import { useTypingUsers } from "@/hooks/useTypingUsers"

type Props = {
  convId: number
  currentUserId: number | undefined
}

export function TypingIndicator({ convId, currentUserId }: Props) {
  const { typingNames } = useTypingUsers(convId, currentUserId)

  if (typingNames.length === 0) return null

  return (
    <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
      <div className="flex items-center gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: "0.9s" }}
          />
        ))}
      </div>
      <span>{typingNames.join(", ")} est en train d&apos;écrire…</span>
    </div>
  )
}
