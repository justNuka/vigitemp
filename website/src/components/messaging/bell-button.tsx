"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { useTranslations } from "next-intl"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useUnreadCount } from "@/hooks/useUnreadCount"
import { getJson, postJson } from "@/lib/http"

type ConversationSummary = {
  id: number
  type: string
  name: string
  avatar: { initials: string; avatarSrc: string | null } | null
  lastMessage: {
    id: number
    senderId: number
    contenu: string | null
    deleted: boolean
    createdAt: string
  } | null
  lastReadMsgId: number | null
}

function isUnread(conv: ConversationSummary, currentUserId?: number): boolean {
  if (!conv.lastMessage) return false
  if (conv.lastMessage.senderId === currentUserId) return false
  if (!conv.lastReadMsgId) return true
  return conv.lastMessage.id > conv.lastReadMsgId
}

function useFormatTime() {
  const t = useTranslations("messaging.time")

  return function formatTime(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60_000)
    if (diffMin < 1) return t("just_now")
    if (diffMin < 60) return t("minutes_ago", { count: diffMin })
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    return t("yesterday")
  }
}

export function BellButton({ currentUserId }: { currentUserId?: number }) {
  const t = useTranslations("messaging")
  const unreadCount = useUnreadCount()
  const [open, setOpen] = useState(false)
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
    if (!conversations) return
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

      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold text-sm">{t("bell.title")}</span>
          {unreadConvs.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={markAllRead}
            >
              {t("bell.mark_all_read")}
            </Button>
          )}
        </div>

        {unreadConvs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
            <Bell className="h-8 w-8 opacity-30" />
            <p className="text-sm">{t("bell.empty")}</p>
          </div>
        ) : (
          <ScrollArea className="max-h-72">
            <div className="py-1">
              {unreadConvs.map((conv, index) => (
                <div key={conv.id}>
                  <Link
                    // next-intl's typed Link doesn't support query params natively; cast is safe here
                    href={`/messages?conv=${conv.id}` as never}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <Avatar className="h-9 w-9 shrink-0 mt-0.5">
                      {conv.avatar?.avatarSrc && (
                        <AvatarImage src={conv.avatar.avatarSrc} />
                      )}
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {conv.avatar?.initials ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate flex-1">{conv.name}</p>
                        {conv.lastMessage && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatTime(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      {conv.lastMessage?.contenu && !conv.lastMessage.deleted && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {conv.lastMessage.contenu}
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
        <div className="px-4 py-2">
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
