"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useQuery } from "@tanstack/react-query"
import { Check, Search, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { getJson, postJson } from "@/lib/http"
import { cn } from "@/lib/utils"
import type { ApiUser, ConversationRef, GroupConversationRef } from "./_types"
import { getInitials } from "../_utils"

type NewConversationModalProps = {
  open: boolean
  currentUserId: number | undefined
  onOpenChange: (open: boolean) => void
  onCreated: (id: number) => void
}

export function NewConversationModal({
  open,
  currentUserId,
  onOpenChange,
  onCreated,
}: NewConversationModalProps) {
  const t = useTranslations("messaging.new_conversation")
  const [tab, setTab] = useState<"direct" | "group">("direct")
  const [directSearch, setDirectSearch] = useState("")
  const [groupSearch, setGroupSearch] = useState("")
  const [groupTitle, setGroupTitle] = useState("")
  const [selectedDmUser, setSelectedDmUser] = useState<ApiUser | null>(null)
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<ApiUser[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const { data: users = [], isLoading: isLoadingUsers } = useQuery<ApiUser[]>({
    queryKey: ["chat", "users"],
    queryFn: () => getJson<ApiUser[]>("/api/chat/users"),
    enabled: open,
    staleTime: 60_000,
  })

  const otherUsers = users.filter((u) => u.id !== currentUserId && u.status === "active")

  const directFiltered = otherUsers.filter((u) =>
    u.displayName.toLowerCase().includes(directSearch.toLowerCase()) ||
    u.username.toLowerCase().includes(directSearch.toLowerCase())
  )

  const groupFiltered = otherUsers.filter(
    (u) =>
      (u.displayName.toLowerCase().includes(groupSearch.toLowerCase()) ||
        u.username.toLowerCase().includes(groupSearch.toLowerCase())) &&
      !selectedGroupMembers.some((m) => m.id === u.id)
  )

  function toggleGroupMember(user: ApiUser) {
    setSelectedGroupMembers((prev) => {
      const exists = prev.some((m) => m.id === user.id)
      return exists ? prev.filter((m) => m.id !== user.id) : [...prev, user]
    })
  }

  function handleClose() {
    setDirectSearch("")
    setGroupSearch("")
    setGroupTitle("")
    setSelectedDmUser(null)
    setSelectedGroupMembers([])
    setTab("direct")
    onOpenChange(false)
  }

  async function handleCreateDirect() {
    if (!selectedDmUser || isCreating) return
    setIsCreating(true)
    try {
      const result = await postJson<ConversationRef>("/api/chat/conversations/direct", {
        targetUserId: selectedDmUser.id,
      })
      onCreated(result.id)
      handleClose()
    } catch {
      toast.error(t("create_error"))
    } finally {
      setIsCreating(false)
    }
  }

  async function handleCreateGroup() {
    if (!groupTitle.trim() || selectedGroupMembers.length === 0 || isCreating) return
    setIsCreating(true)
    try {
      const result = await postJson<GroupConversationRef>("/api/chat/conversations/group", {
        titre: groupTitle.trim(),
        participantIds: selectedGroupMembers.map((m) => m.id),
      })
      onCreated(result.id)
      handleClose()
    } catch {
      toast.error(t("create_error"))
    } finally {
      setIsCreating(false)
    }
  }

  const canCreateDirect = selectedDmUser !== null && !isCreating
  const canCreateGroup = groupTitle.trim().length > 0 && selectedGroupMembers.length > 0 && !isCreating

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "direct" | "group")}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="direct" className="flex-1">{t("tab_direct")}</TabsTrigger>
            <TabsTrigger value="group" className="flex-1">{t("tab_group")}</TabsTrigger>
          </TabsList>

          {/* Direct message tab */}
          <TabsContent value="direct" className="mt-0 space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                className="pl-8 h-9 text-sm"
                placeholder={t("direct_search")}
                value={directSearch}
                onChange={(e) => setDirectSearch(e.target.value)}
              />
            </div>

            <ScrollArea className="h-60 rounded-md border">
              {isLoadingUsers ? (
                <div className="p-2 space-y-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-2 py-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3.5 w-2/3" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : directFiltered.length === 0 ? (
                <div className="flex items-center justify-center h-full py-8 text-sm text-muted-foreground">
                  {t("no_users")}
                </div>
              ) : (
                <div className="p-1">
                  {directFiltered.map((user) => {
                    const isSelected = selectedDmUser?.id === user.id
                    return (
                      <button
                        key={user.id}
                        onClick={() => setSelectedDmUser(isSelected ? null : user)}
                        className={cn(
                          "w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors",
                          isSelected ? "bg-primary/10" : "hover:bg-muted/60"
                        )}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className={cn(
                            "text-xs font-medium",
                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted-foreground/15"
                          )}>
                            {getInitials(user.displayName || user.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.displayName || user.username}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </ScrollArea>

            <Button
              className="w-full"
              onClick={() => void handleCreateDirect()}
              disabled={!canCreateDirect || isCreating}
            >
              {t("create")}
            </Button>
          </TabsContent>

          {/* Group tab */}
          <TabsContent value="group" className="mt-0 space-y-3">
            <div>
              <Label className="text-xs font-medium mb-1.5 block">{t("group_title_label")}</Label>
              <Input
                className="h-9 text-sm"
                placeholder={t("group_title_placeholder")}
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-xs font-medium mb-1.5 block">{t("group_members_label")}</Label>

              {selectedGroupMembers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedGroupMembers.map((member) => (
                    <Badge
                      key={member.id}
                      variant="secondary"
                      className="gap-1 pr-1 text-xs font-normal"
                    >
                      {member.displayName || member.username}
                      <button
                        onClick={() => toggleGroupMember(member)}
                        aria-label={member.displayName || member.username}
                        className="rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  className="pl-8 h-9 text-sm"
                  placeholder={t("group_members_search")}
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                />
              </div>

              <ScrollArea className="h-44 rounded-md border">
                {isLoadingUsers ? (
                  <div className="p-2 space-y-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 px-2 py-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-3.5 w-1/2 flex-1" />
                      </div>
                    ))}
                  </div>
                ) : groupFiltered.length === 0 ? (
                  <div className="flex items-center justify-center h-full py-6 text-sm text-muted-foreground">
                    {t("no_users")}
                  </div>
                ) : (
                  <div className="p-1">
                    {groupFiltered.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => toggleGroupMember(user)}
                        className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-left hover:bg-muted/60 transition-colors"
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs font-medium bg-muted-foreground/15">
                            {getInitials(user.displayName || user.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.displayName || user.username}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            <Button
              className="w-full"
              onClick={() => void handleCreateGroup()}
              disabled={!canCreateGroup || isCreating}
            >
              {t("create")}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
