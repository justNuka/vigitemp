"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { MessageSquare } from "lucide-react"
import { getJson, postJson } from "@/lib/http"
import { useMessagingEnabled } from "@/hooks/useMessagingEnabled"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { ConversationList } from "./_components/conversation-list"
import { MessageThread } from "./_components/message-thread"
import { NewConversationModal } from "./_components/new-conversation-modal"
import type { ConversationSummary } from "./_components/_types"

export default function MessagesPage() {
  const t = useTranslations("messaging")
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const messagingEnabled = useMessagingEnabled()
  const { data: currentUser } = useCurrentUser()

  const [selectedConvId, setSelectedConvId] = useState<number | null>(() => {
    const param = searchParams.get("conv")
    return param ? parseInt(param, 10) : null
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewedConvIds, setViewedConvIds] = useState<Set<number>>(new Set())

  // Redirect if messaging is not enabled (fail-closed once we know)
  useEffect(() => {
    if (!messagingEnabled) {
      router.replace("/")
    }
  }, [messagingEnabled, router])

  const { data: conversations = [], isLoading: isLoadingConvs } = useQuery<ConversationSummary[]>({
    queryKey: ["chat", "conversations"],
    queryFn: () => getJson<ConversationSummary[]>("/api/chat/conversations"),
    refetchInterval: 10_000,
    staleTime: 5_000,
    enabled: messagingEnabled,
  })

  const selectedConv = conversations.find((c) => c.id === selectedConvId) ?? null

  const handleSelectConversation = useCallback(
    async (conv: ConversationSummary) => {
      setSelectedConvId(conv.id)
      setViewedConvIds((prev) => new Set([...prev, conv.id]))

      // Update URL query param without full navigation
      const params = new URLSearchParams(searchParams.toString())
      params.set("conv", String(conv.id))
      router.replace(`?${params.toString()}`, { scroll: false })

      // Mark as read
      try {
        await postJson(`/api/chat/conversations/${conv.id}/read`, {})
        await queryClient.invalidateQueries({ queryKey: ["chat", "unread-count"] })
        await queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] })
      } catch {
        // Non-blocking — ignore if read mark fails
      }
    },
    [queryClient, router, searchParams]
  )

  const handleConversationCreated = useCallback(
    async (id: number) => {
      await queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] })
      const refreshed = await queryClient.fetchQuery<ConversationSummary[]>({
        queryKey: ["chat", "conversations"],
        queryFn: () => getJson<ConversationSummary[]>("/api/chat/conversations"),
      })
      const conv = refreshed.find((c) => c.id === id)
      if (conv) {
        void handleSelectConversation(conv)
      } else {
        setSelectedConvId(id)
      }
    },
    [queryClient, handleSelectConversation]
  )

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* Left column — conversation list */}
      <aside className="w-80 shrink-0 border-r flex flex-col bg-background">
        <ConversationList
          conversations={conversations}
          isLoading={isLoadingConvs}
          selectedId={selectedConvId}
          currentUserId={currentUser?.id}
          viewedConvIds={viewedConvIds}
          onSelect={(conv) => void handleSelectConversation(conv)}
          onNewConversation={() => setIsModalOpen(true)}
        />
      </aside>

      {/* Right column — thread or empty state */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background">
        {selectedConv ? (
          <MessageThread
            key={selectedConv.id}
            conversation={selectedConv}
            currentUserId={currentUser?.id}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground select-none">
            <div className="rounded-2xl bg-muted/40 p-6">
              <MessageSquare className="h-10 w-10 opacity-30" />
            </div>
            <p className="text-sm font-medium">{t("thread.empty_state")}</p>
          </div>
        )}
      </main>

      {/* New conversation modal */}
      <NewConversationModal
        open={isModalOpen}
        currentUserId={currentUser?.id}
        onOpenChange={setIsModalOpen}
        onCreated={(id) => void handleConversationCreated(id)}
      />
    </div>
  )
}
