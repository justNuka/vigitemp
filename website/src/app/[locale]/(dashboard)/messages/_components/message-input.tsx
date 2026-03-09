"use client"

import { useRef, useState, useCallback, type KeyboardEvent, type ChangeEvent } from "react"
import { useTranslations } from "next-intl"
import { Send, Paperclip, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { postJson } from "@/lib/http"
import type { Attachment } from "./_types"
import { AttachmentPreview } from "./attachment-preview"

type PendingAttachment = {
  attachment: Attachment
  previewUrl: string
}

type MessageInputProps = {
  onSend: (content: string, attachmentIds: number[]) => Promise<void>
  convId: number
  disabled?: boolean
}

export function MessageInput({ onSend, convId, disabled = false }: MessageInputProps) {
  const t = useTranslations("messaging.thread")
  const [content, setContent] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([])
  const [uploadingCount, setUploadingCount] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  function adjustHeight() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    const lineHeight = 24
    const minH = lineHeight
    const maxH = lineHeight * 4
    el.style.height = `${Math.min(Math.max(el.scrollHeight, minH), maxH)}px`
  }

  function revokePreviewUrl(url: string) {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url)
    }
  }

  const sendTypingStop = useCallback(() => {
    if (!isTypingRef.current) return
    isTypingRef.current = false
    void postJson(`/api/chat/conversations/${convId}/typing`, { isTyping: false }).catch(() => {})
  }, [convId])

  const sendTypingStart = useCallback(() => {
    if (isTypingRef.current) return
    isTypingRef.current = true
    void postJson(`/api/chat/conversations/${convId}/typing`, { isTyping: true }).catch(() => {})
  }, [convId])

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value)
    adjustHeight()

    if (e.target.value.trim().length > 0) {
      sendTypingStart()
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
      typingTimerRef.current = setTimeout(sendTypingStop, 3000)
    } else {
      sendTypingStop()
    }
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    e.target.value = ""

    setUploadingCount((count) => count + files.length)

    await Promise.all(
      files.map(async (file) => {
        const previewUrl = URL.createObjectURL(file)

        try {
          const formData = new FormData()
          formData.append("file", file)

          const res = await fetch(`/api/chat/conversations/${convId}/attachments`, {
            method: "POST",
            body: formData,
          })

          if (!res.ok) throw new Error("upload failed")

          const data = await res.json() as { data: Attachment }
          setPendingAttachments((prev) => [...prev, { attachment: data.data, previewUrl }])
        } catch {
          revokePreviewUrl(previewUrl)
        } finally {
          setUploadingCount((count) => count - 1)
        }
      }),
    )
  }

  function removeAttachment(id: number) {
    setPendingAttachments((prev) => {
      const pending = prev.find((item) => item.attachment.id === id)
      if (pending) {
        revokePreviewUrl(pending.previewUrl)
      }
      return prev.filter((item) => item.attachment.id !== id)
    })
  }

  async function handleSend() {
    const trimmed = content.trim()
    if ((!trimmed && pendingAttachments.length === 0) || isSending || disabled) return

    setIsSending(true)
    sendTypingStop()
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)

    try {
      const attachmentIds = pendingAttachments.map((pending) => pending.attachment.id)
      await onSend(trimmed, attachmentIds)
      pendingAttachments.forEach((pending) => revokePreviewUrl(pending.previewUrl))
      setContent("")
      setPendingAttachments([])
      if (textareaRef.current) textareaRef.current.style.height = "auto"
    } finally {
      setIsSending(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const isEmpty = content.trim().length === 0 && pendingAttachments.length === 0
  const isDisabled = disabled || isSending || uploadingCount > 0

  return (
    <div className="space-y-2 border-t bg-card px-4 py-3">
      {pendingAttachments.length > 0 && (
        <div className="flex flex-wrap gap-3 px-1">
          {pendingAttachments.map(({ attachment, previewUrl }) => (
            <div key={attachment.id} className="relative max-w-72">
              <AttachmentPreview attachment={attachment} isOwn={false} previewUrl={previewUrl} />
              <button
                type="button"
                onClick={() => removeAttachment(attachment.id)}
                className="absolute right-2 top-2 z-10 rounded-full bg-background/85 p-1 opacity-80 shadow-sm hover:opacity-100"
                aria-label="Remove attachment"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {uploadingCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground">
              <span className="animate-pulse">{t("uploading")}</span>
            </div>
          )}
        </div>
      )}

      <div
        className={cn(
          "flex items-end gap-2 rounded-xl border bg-background px-3 py-2 transition-colors",
          "focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20",
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isDisabled}
          className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
          aria-label={t("attach_file")}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
          className="hidden"
          onChange={handleFileChange}
        />

        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={t("input_placeholder")}
          disabled={isDisabled}
          rows={1}
          className={cn(
            "min-h-6 max-h-24 flex-1 resize-none overflow-y-auto border-0 bg-transparent p-0 text-sm leading-6 shadow-none",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            "placeholder:text-muted-foreground/60",
          )}
          style={{ height: "24px" }}
        />

        <Button
          type="button"
          size="icon"
          onClick={() => void handleSend()}
          disabled={isEmpty || isDisabled}
          className={cn(
            "h-8 w-8 shrink-0 rounded-lg transition-all",
            isEmpty || isDisabled ? "opacity-40" : "opacity-100 shadow-sm hover:shadow-md",
          )}
        >
          <Send className="h-3.5 w-3.5" />
          <span className="sr-only">{t("send")}</span>
        </Button>
      </div>
    </div>
  )
}
