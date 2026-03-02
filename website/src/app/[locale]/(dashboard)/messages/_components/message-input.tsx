"use client"

import { useRef, useState, type KeyboardEvent, type ChangeEvent } from "react"
import { useTranslations } from "next-intl"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type MessageInputProps = {
  onSend: (content: string) => Promise<void>
  disabled?: boolean
}

export function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  const t = useTranslations("messaging.thread")
  const [content, setContent] = useState("")
  const [isSending, setIsSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function adjustHeight() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    const lineHeight = 24
    const minH = lineHeight
    const maxH = lineHeight * 4
    el.style.height = `${Math.min(Math.max(el.scrollHeight, minH), maxH)}px`
  }

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value)
    adjustHeight()
  }

  async function handleSend() {
    const trimmed = content.trim()
    if (!trimmed || isSending || disabled) return
    setIsSending(true)
    try {
      await onSend(trimmed)
      setContent("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
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

  const isEmpty = content.trim().length === 0
  const isDisabled = disabled || isSending

  return (
    <div className="border-t bg-background/80 backdrop-blur-sm px-4 py-3">
      <div
        className={cn(
          "flex items-end gap-2 rounded-xl border bg-background px-3 py-2 transition-colors",
          "focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20"
        )}
      >
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={t("input_placeholder")}
          disabled={isDisabled}
          rows={1}
          className={cn(
            "flex-1 resize-none border-0 bg-transparent p-0 text-sm shadow-none",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            "min-h-6 max-h-24 overflow-y-auto leading-6",
            "placeholder:text-muted-foreground/60"
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
            isEmpty || isDisabled
              ? "opacity-40"
              : "opacity-100 shadow-sm hover:shadow-md"
          )}
        >
          <Send className="h-3.5 w-3.5" />
          <span className="sr-only">{t("send")}</span>
        </Button>
      </div>
    </div>
  )
}
