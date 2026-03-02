"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronUp } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getJson, postJson } from "@/lib/http"
import { cn } from "@/lib/utils"
import { MessageInput } from "./message-input"
import type { ConversationSummary, MessageItem, MessagesResponse } from "./_types"
import { getInitials } from "../_utils"

type DateLabel = {
  type: "date"
  label: string
  key: string
}

type MessageRow = {
  type: "message"
  data: MessageItem
}

type ListRow = DateLabel | MessageRow

function getDateLabel(
  dateStr: string,
  tTime: ReturnType<typeof useTranslations<"messaging.time">>
): string {
  const date = new Date(dateStr)
  const now = new Date()
  const todayStr = now.toDateString()
  const dateStrNorm = date.toDateString()
  if (dateStrNorm === todayStr) return tTime("date_separator_today")
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateStrNorm === yesterday.toDateString()) return tTime("date_separator_yesterday")
  return date.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })
}

function buildRows(
  messages: MessageItem[],
  tTime: ReturnType<typeof useTranslations<"messaging.time">>
): ListRow[] {
  const rows: ListRow[] = []
  let lastDateKey = ""

  for (const msg of messages) {
    const dateKey = new Date(msg.createdAt).toDateString()
    if (dateKey !== lastDateKey) {
      rows.push({
        type: "date",
        label: getDateLabel(msg.createdAt, tTime),
        key: `date-${dateKey}`,
      })
      lastDateKey = dateKey
    }
    rows.push({ type: "message", data: msg })
  }
  return rows
}

function formatMessageTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

type MessageThreadProps = {
  conversation: ConversationSummary
  currentUserId: number | undefined
}

export function MessageThread({ conversation, currentUserId }: MessageThreadProps) {
  const t = useTranslations("messaging")
  const tTime = useTranslations("messaging.time")
  const queryClient = useQueryClient()
  // Ref on the scrollable viewport div (not ScrollArea root)
  const viewportRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [allMessages, setAllMessages] = useState<MessageItem[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  // undefined = not yet loaded older messages, null = exhausted (no more), number = cursor to next page
  const [loadMoreCursor, setLoadMoreCursor] = useState<number | null | undefined>(undefined)

  const convId = conversation.id

  const { data, isLoading } = useQuery<MessagesResponse>({
    queryKey: ["chat", "messages", convId],
    queryFn: () => getJson<MessagesResponse>(`/api/chat/conversations/${convId}/messages`),
    refetchInterval: 10_000,
    staleTime: 5_000,
  })

  // Merge new messages from polling with already-loaded older messages
  useEffect(() => {
    if (!data) return
    setAllMessages((prev) => {
      if (prev.length === 0) return data.messages
      const existingIds = new Set(prev.map((m) => m.id))
      const newOnes = data.messages.filter((m) => !existingIds.has(m.id))
      if (newOnes.length === 0) return prev
      return [...prev, ...newOnes].sort((a, b) => a.id - b.id)
    })
  }, [data])

  // Reset state when conversation changes
  useEffect(() => {
    setHasScrolledToBottom(false)
    setAllMessages([])
    setLoadMoreCursor(undefined)
  }, [convId])

  // Auto-scroll to bottom on initial load
  useEffect(() => {
    if (!hasScrolledToBottom && allMessages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "instant" })
      setHasScrolledToBottom(true)
    }
  }, [allMessages, hasScrolledToBottom])

  // Smart scroll: only scroll to bottom on new messages if user is near bottom
  const prevMessageCount = useRef(0)
  useEffect(() => {
    if (!hasScrolledToBottom) return
    if (allMessages.length <= prevMessageCount.current) {
      prevMessageCount.current = allMessages.length
      return
    }
    prevMessageCount.current = allMessages.length

    const el = viewportRef.current
    if (!el) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
      return
    }
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [allMessages.length, hasScrolledToBottom])

  const nextCursor = data?.nextCursor
  // loadMoreCursor=undefined means no older messages fetched yet (use nextCursor from initial fetch)
  // loadMoreCursor=null means exhausted (no more older messages — do not show button)
  // loadMoreCursor=number means cursor for the next older page
  const effectiveNextCursor: number | undefined =
    loadMoreCursor === null
      ? undefined
      : loadMoreCursor !== undefined
        ? loadMoreCursor
        : nextCursor

  async function handleLoadMore() {
    if (!effectiveNextCursor || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const older = await getJson<MessagesResponse>(
        `/api/chat/conversations/${convId}/messages?cursor=${effectiveNextCursor}`
      )
      setAllMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id))
        const merged = [
          ...older.messages.filter((m) => !existingIds.has(m.id)),
          ...prev,
        ].sort((a, b) => a.id - b.id)
        return merged
      })
      // null = exhausted when API returns no nextCursor
      setLoadMoreCursor(older.nextCursor ?? null)
    } catch {
      toast.error(t("thread.load_more_error"))
    } finally {
      setIsLoadingMore(false)
    }
  }

  async function handleSend(content: string) {
    try {
      await postJson(`/api/chat/conversations/${convId}/messages`, { contenu: content })
      await queryClient.invalidateQueries({ queryKey: ["chat", "messages", convId] })
      await queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] })
    } catch {
      toast.error(t("thread.send_error"))
    }
  }

  const rows = buildRows(allMessages, tTime)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Thread header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b shrink-0 bg-background/80 backdrop-blur-sm">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
            {getInitials(conversation.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate">{conversation.name}</h3>
          {conversation.type === "group" && (
            <p className="text-xs text-muted-foreground">
              {t("conversations.group_badge")}
            </p>
          )}
        </div>
      </div>

      {/* Messages — using a plain div for the scrollable area so we can ref the viewport */}
      <div
        ref={viewportRef}
        className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-1"
      >
        {/* Load more button */}
        {effectiveNextCursor !== undefined && (
          <div className="flex justify-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void handleLoadMore()}
              disabled={isLoadingMore}
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <ChevronUp className="h-3.5 w-3.5" />
              {t("thread.load_more")}
            </Button>
          </div>
        )}

        {isLoading && allMessages.length === 0 ? (
          <div className="space-y-4 px-2">
            {Array.from({ length: 6 }).map((_, i) => {
              const isOwn = i % 3 === 0
              return (
                <div
                  key={i}
                  className={cn("flex items-end gap-2", isOwn ? "justify-end" : "justify-start")}
                >
                  {!isOwn && <Skeleton className="h-7 w-7 rounded-full shrink-0" />}
                  <Skeleton
                    className={cn("h-10 rounded-2xl", isOwn ? "w-48" : "w-56")}
                  />
                </div>
              )
            })}
          </div>
        ) : (
          rows.map((row) => {
            if (row.type === "date") {
              return (
                <div key={row.key} className="flex items-center gap-3 py-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[11px] text-muted-foreground font-medium px-2 shrink-0">
                    {row.label}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )
            }

            const msg = row.data
            const isOwn = msg.senderId === currentUserId

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex items-end gap-2 group",
                  isOwn ? "justify-end" : "justify-start"
                )}
              >
                {!isOwn && (
                  <Avatar className="h-7 w-7 shrink-0 mb-0.5">
                    <AvatarFallback className="text-[10px] font-medium bg-muted-foreground/15">
                      {msg.senderInitials}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    "flex flex-col gap-0.5 max-w-[70%]",
                    isOwn ? "items-end" : "items-start"
                  )}
                >
                  {!isOwn && (
                    <span className="text-[11px] text-muted-foreground font-medium px-1">
                      {msg.senderName}
                    </span>
                  )}
                  <div
                    className={cn(
                      "px-3.5 py-2 text-sm leading-relaxed wrap-break-word",
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
                        : "bg-muted text-foreground rounded-2xl rounded-bl-sm"
                    )}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatMessageTime(msg.createdAt)}
                    {msg.updatedAt !== null && msg.updatedAt !== msg.createdAt && (
                      <span className="ml-1">{t("conversations.edited_label")}</span>
                    )}
                  </span>
                </div>
              </div>
            )
          })
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={handleSend} />
    </div>
  )
}
