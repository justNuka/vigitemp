"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Search, MessageSquarePlus } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatDbDateTimeIntl, parseDbDateTime } from "@/lib/date-display"
import type { ConversationSummary } from "./_types"
import { getInitials } from "../_utils"

function formatTime(dateStr: string, t: ReturnType<typeof useTranslations<"messaging.time">>): string {
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

type ConversationListProps = {
  conversations: ConversationSummary[]
  isLoading: boolean
  selectedId: number | null
  currentUserId: number | undefined
  viewedConvIds: Set<number>
  onSelect: (conv: ConversationSummary) => void
  onNewConversation: () => void
}

export function ConversationList({
  conversations,
  isLoading,
  selectedId,
  currentUserId,
  viewedConvIds,
  onSelect,
  onNewConversation,
}: ConversationListProps) {
  const t = useTranslations("messaging")
  const tTime = useTranslations("messaging.time")
  const [search, setSearch] = useState("")

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  function isUnread(conv: ConversationSummary): boolean {
    if (!conv.lastMessage) return false
    if (currentUserId === undefined) return false
    if (conv.lastMessage.senderId === currentUserId) return false
    // If the conversation was viewed in this session, treat it as read
    if (viewedConvIds.has(conv.id)) return false
    return true
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <h2 className="text-base font-semibold tracking-tight">{t("page.title")}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewConversation}
          title={t("conversations.new")}
          aria-label={t("conversations.new")}
          className="h-8 w-8 shrink-0 hover:bg-muted rounded-full transition-colors"
        >
          <MessageSquarePlus className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-8 h-8 text-sm bg-muted/40 border-0 focus-visible:ring-1 focus-visible:ring-primary/40"
            placeholder={t("conversations.search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1 min-h-0">
        {isLoading ? (
          <div className="px-2 py-1 space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-2.5 rounded-lg">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 gap-2 text-muted-foreground">
            <MessageSquarePlus className="h-8 w-8 opacity-30" />
            <p className="text-sm text-center">{t("conversations.empty_list")}</p>
          </div>
        ) : (
          <div className="px-2 py-1 space-y-0.5">
            {filtered.map((conv) => {
              const unread = isUnread(conv)
              const isActive = conv.id === selectedId
              return (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv)}
                  className={cn(
                    "w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-left transition-colors group",
                    isActive
                      ? "bg-linear-to-r from-primary/15 to-primary/5 border-l-2 border-primary"
                      : "hover:bg-muted/50"
                  )}
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback
                      className={cn(
                        "text-xs font-medium",
                        isActive || unread
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted-foreground/15 text-foreground"
                      )}
                    >
                      {getInitials(conv.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "text-sm truncate flex-1",
                          unread ? "font-semibold text-foreground" : "font-medium text-foreground/80"
                        )}
                      >
                        {conv.name}
                      </span>
                      {conv.type === "group" && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-4 px-1.5 shrink-0 font-normal"
                        >
                          {t("conversations.group_badge")}
                        </Badge>
                      )}
                      {conv.lastMessage && (
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-auto">
                          {formatTime(conv.lastMessage.createdAt, tTime)}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p
                        className={cn(
                          "text-xs truncate mt-0.5",
                          unread ? "text-foreground/70" : "text-muted-foreground"
                        )}
                      >
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>

                  {unread && (
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse" aria-hidden />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
