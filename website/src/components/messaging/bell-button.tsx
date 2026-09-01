"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { useTranslations } from "next-intl"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useUnreadCount } from "@/hooks/useUnreadCount"
import { getJson, postJson } from "@/lib/http"
import { formatDbDateTimeIntl, parseDbDateTime } from "@/lib/date-display"

type ConversationSummary = {
  id: number
  type: "dm" | "group"
  name: string
  dmKey: string | null
  lastMessage: {
    id: number
    content: string
    senderId: number
    senderName: string
    createdAt: string
  } | null
  unreadCount: number
}

function isUnread(conv: ConversationSummary, currentUserId: number | undefined): boolean {
  if (!conv.lastMessage) return false
  if (currentUserId === undefined) return false
  if (conv.lastMessage.senderId === currentUserId) return false
  // V1: server always returns unreadCount: 0 as a placeholder.
  // We treat any conversation whose last message was sent by someone else as unread.
  return true
}

function useFormatTime() {
  const t = useTranslations("messaging.time")

  return function formatTime(dateStr: string): string {
    const date = parseDbDateTime(dateStr)
    if (!date) return "-"
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60_000)
    if (diffMin < 1) return t("just_now")
    if (diffMin < 60) return t("minutes_ago", { count: diffMin })
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) {
      return formatDbDateTimeIntl(date, {
        intl: { hour: "2-digit", minute: "2-digit" },
      })
    }

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const isYesterday = msgDay.getTime() === yesterday.getTime()

    if (isYesterday) return t("yesterday")
    return formatDbDateTimeIntl(date, {
      intl: { day: "numeric", month: "short" },
    })
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return (parts[0]?.[0] ?? "?").toUpperCase()
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase()
}

export function BellButton({ currentUserId }: { currentUserId?: number }) {
  const t = useTranslations("messaging")
  const unreadCount = useUnreadCount()
  const [open, setOpen] = useState(false)
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false)
  const formatTime = useFormatTime()
  const queryClient = useQueryClient()

  const { data: conversations } = useQuery<ConversationSummary[]>({
    queryKey: ["chat", "conversations"],
    queryFn: () => getJson<ConversationSummary[]>("/api/chat/conversations"),
    enabled: open,
    staleTime: 10_000,
  })

  const unreadConvs = (conversations ?? [])
    .filter((c) => isUnread(c, currentUserId))
    .slice(0, 5)

  const markAllRead = async (): Promise<void> => {
    if (!conversations || isMarkingAllRead) return
    setIsMarkingAllRead(true)
    try {
      const unreadIds = conversations
        .filter((c) => isUnread(c, currentUserId))
        .map((c) => c.id)

      await Promise.all(
        unreadIds.map((id) =>
          postJson<void>(`/api/chat/conversations/${id}/read`, {})
        )
      )

      await queryClient.invalidateQueries({ queryKey: ["chat", "unread-count"] })
      await queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] })
    } catch {
      // Silently fail — the user can retry by reopening the popover
    } finally {
      setIsMarkingAllRead(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={t("bell.tooltip")}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 overflow-hidden border-border/70 bg-popover text-popover-foreground shadow-xl" align="end">
        <div className="flex items-center justify-between border-b border-border/70 bg-background/70 px-4 py-3 backdrop-blur-sm dark:bg-slate-950/70">
          <span className="font-semibold text-sm">{t("bell.title")}</span>
          {unreadConvs.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground dark:text-slate-300 dark:hover:text-white"
              onClick={markAllRead}
              disabled={isMarkingAllRead}
            >
              {t("bell.mark_all_read")}
            </Button>
          )}
        </div>

        {unreadConvs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground dark:text-slate-300">
            <Bell className="h-8 w-8 opacity-30" />
            <p className="text-sm">{t("bell.empty")}</p>
          </div>
        ) : (
          <ScrollArea className="h-72 bg-popover">
            <div className="py-1">
              {unreadConvs.map((conv, index) => (
                <div key={conv.id}>
                  <Link
                    // next-intl's typed Link doesn't support query params natively; cast is safe here
                    href={`/messages?conv=${conv.id}` as never}
                    onClick={() => setOpen(false)}
                    className="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/60 dark:hover:bg-slate-800/70"
                  >
                    <Avatar className="h-9 w-9 shrink-0 mt-0.5">
                      <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                        {getInitials(conv.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate flex-1">{conv.name}</p>
                        {conv.lastMessage && (
                          <span className="shrink-0 text-xs text-muted-foreground dark:text-slate-400">
                            {formatTime(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      {conv.lastMessage?.content && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground dark:text-slate-400">
                          {conv.lastMessage.content}
                        </p>
                      )}
                    </div>
                    <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-2" aria-hidden />
                  </Link>
                  {index < unreadConvs.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <Separator />
        <div className="bg-background/70 px-4 py-2 dark:bg-slate-950/70">
          <Link
            href="/messages"
            onClick={() => setOpen(false)}
            className="text-xs text-primary hover:underline font-medium"
          >
            {t("bell.view_all")}
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
