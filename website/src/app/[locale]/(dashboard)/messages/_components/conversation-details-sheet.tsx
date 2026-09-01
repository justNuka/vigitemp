"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useQuery } from "@tanstack/react-query"
import { Download, FileText, FileSpreadsheet, FileImage, File } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { getJson } from "@/lib/http"
import { formatNumber } from "@/lib/number-display"
import { getInitials, formatDate } from "../_utils"
import { UserProfileSheet } from "./user-profile-sheet"
import type {
  ConversationDetails,
  ConversationAttachmentsResponse,
  ConversationParticipant,
} from "./_types"

type ConversationDetailsSheetProps = {
  convId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${formatNumber(bytes / 1024, { decimals: 1, locale: "en-US", grouping: false })} KB`
  return `${formatNumber(bytes / (1024 * 1024), { decimals: 1, locale: "en-US", grouping: false })} MB`
}


function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <FileImage className="h-4 w-4 text-blue-500 shrink-0" />
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType === "text/csv")
    return <FileSpreadsheet className="h-4 w-4 text-green-600 shrink-0" />
  if (mimeType.includes("pdf") || mimeType.includes("word") || mimeType.includes("text"))
    return <FileText className="h-4 w-4 text-orange-500 shrink-0" />
  return <File className="h-4 w-4 text-muted-foreground shrink-0" />
}

export function ConversationDetailsSheet({
  convId,
  open,
  onOpenChange,
}: ConversationDetailsSheetProps) {
  const t = useTranslations("messaging.details")
  const [selectedUser, setSelectedUser] = useState<ConversationParticipant | null>(null)

  const { data: details, isLoading: isLoadingDetails } = useQuery<ConversationDetails>({
    queryKey: ["chat", "conv-details", convId],
    queryFn: () => getJson<ConversationDetails>(`/api/chat/conversations/${convId}/details`),
    enabled: open,
    staleTime: 60_000,
  })

  const { data: attachmentsData, isLoading: isLoadingAttachments } =
    useQuery<ConversationAttachmentsResponse>({
      queryKey: ["chat", "conv-attachments", convId],
      queryFn: () =>
        getJson<ConversationAttachmentsResponse>(`/api/chat/conversations/${convId}/attachments`),
      enabled: open,
      staleTime: 30_000,
    })

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-80 sm:w-96 flex flex-col p-0">
          <SheetHeader className="px-6 py-4 border-b shrink-0">
            <SheetTitle>{t("sheet_title")}</SheetTitle>
            <SheetDescription className="sr-only">{t("sheet_title")}</SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="px-6 py-4 space-y-6">
              {/* Group info */}
              {isLoadingDetails ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : details ? (
                <div>
                  <p className="text-base font-semibold">
                    {details.titre ?? details.participants.map((p) => p.displayName).join(", ")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("group_created")} {formatDate(details.createdAt)}
                  </p>
                </div>
              ) : null}

              {/* Members */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  {t("members_section")}
                  {details ? ` (${details.participants.length})` : ""}
                </p>
                {isLoadingDetails ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-3.5 w-28" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {details?.participants.map((participant) => (
                      <button
                        key={participant.id}
                        onClick={() => setSelectedUser(participant)}
                        className="flex items-center gap-3 w-full rounded-lg p-2 hover:bg-muted/60 transition-colors text-left"
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={participant.avatar ?? undefined} />
                          <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                            {getInitials(participant.displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{participant.displayName}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            @{participant.username}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Shared documents */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  {t("documents_section")}
                </p>
                {isLoadingAttachments ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full rounded-md" />
                    ))}
                  </div>
                ) : !attachmentsData?.attachments.length ? (
                  <p className="text-sm text-muted-foreground">{t("no_documents")}</p>
                ) : (
                  <div className="space-y-1">
                    {attachmentsData.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-start gap-2 rounded-md border border-border/60 bg-muted/30 p-2 transition-colors hover:bg-muted/50"
                      >
                        {getFileIcon(att.mimeType)}
                        <div className="flex-1 min-w-0">
                          <p className="break-words text-sm leading-5 whitespace-normal">{att.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatBytes(att.size)} · {formatDate(att.uploadedAt)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          asChild
                        >
                          <a
                            href={`/api/chat/attachments/${att.id}`}
                            download={att.fileName}
                            title={t("download")}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Nested user profile sheet */}
      <UserProfileSheet
        user={selectedUser}
        open={selectedUser !== null}
        onOpenChange={(o) => { if (!o) setSelectedUser(null) }}
      />
    </>
  )
}
