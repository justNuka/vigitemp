"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type CommentOption = {
  id: number
  text: string
}

type Props = {
  open: boolean
  alarmCount: number
  isConfirming?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (comment: string) => Promise<void>
}

export function AlarmAcknowledgementCommentDialog({
  open,
  alarmCount,
  isConfirming = false,
  onOpenChange,
  onConfirm,
}: Props) {
  const t = useTranslations("alarmsPage")
  const [commentOptions, setCommentOptions] = useState<CommentOption[]>([])
  const [selectedCommentId, setSelectedCommentId] = useState("")
  const [comment, setComment] = useState("")
  const [isLoadingComments, setIsLoadingComments] = useState(false)

  useEffect(() => {
    if (!open) return

    let active = true
    const initTimer = window.setTimeout(() => {
      setSelectedCommentId("")
      setComment("")
      setIsLoadingComments(true)
    }, 0)

    fetch("/api/alarmes/commentaires-acquittement", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!active) return
        const rows = Array.isArray(payload?.data) ? payload.data : []
        setCommentOptions(
          rows
            .map((item: { id?: number; text?: string }) => ({
              id: Number(item.id),
              text: String(item.text ?? "").trim(),
            }))
            .filter((item: CommentOption) => Number.isFinite(item.id) && item.text.length > 0),
        )
      })
      .catch(() => {
        if (active) setCommentOptions([])
      })
      .finally(() => {
        if (active) setIsLoadingComments(false)
      })

    return () => {
      active = false
      window.clearTimeout(initTimer)
    }
  }, [open])

  const handleConfirm = async () => {
    await onConfirm(comment.trim())
  }

  const title =
    alarmCount > 1
      ? t("analysis.acknowledgeManyDialogTitle", { count: alarmCount })
      : t("dialog.title")

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isConfirming) return
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{t("analysis.acknowledgeDialogDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="analysis-ack-comment-template">
              {t("dialog.comment_select_label")}
            </label>
            <Select
              value={selectedCommentId}
              onValueChange={(value) => {
                setSelectedCommentId(value)
                const option = commentOptions.find((item) => String(item.id) === value)
                if (option) setComment(option.text)
              }}
              disabled={isLoadingComments || isConfirming}
            >
              <SelectTrigger id="analysis-ack-comment-template">
                <SelectValue
                  placeholder={
                    isLoadingComments
                      ? t("dialog.comment_loading")
                      : t("dialog.comment_select_placeholder")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {commentOptions.map((option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    {option.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="analysis-ack-comment">
              {t("dialog.comment_label")}
            </label>
            <Textarea
              id="analysis-ack-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value.slice(0, 200))}
              placeholder={t("dialog.comment_placeholder")}
              rows={4}
              maxLength={200}
              disabled={isConfirming}
            />
            <div className="text-right text-xs text-muted-foreground">
              {comment.length}/200 {t("dialog.characters")}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
          >
            {t("dialog.cancel")}
          </Button>
          <Button type="button" onClick={() => void handleConfirm()} disabled={isConfirming}>
            {isConfirming
              ? t("dialog.confirming")
              : alarmCount > 1
                ? t("analysis.acknowledgeMany", { count: alarmCount })
                : t("analysis.acknowledge")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
