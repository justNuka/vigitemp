"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface SaveAnalysisDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lieuId: number
  lieuNom: string
  dateFrom: string
  dateTo: string
  newToleranceSup: number | null
  newToleranceInf: number | null
  simAlarmCount: number
  realAlarmCount: number
}

export function SaveAnalysisDialog({
  open,
  onOpenChange,
  lieuId,
  lieuNom,
  dateFrom,
  dateTo,
  newToleranceSup,
  newToleranceInf,
  simAlarmCount,
  realAlarmCount,
}: SaveAnalysisDialogProps) {
  const t = useTranslations("impactAnalysis")
  const [comment, setComment] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!comment.trim()) return
    setIsSaving(true)
    try {
      const response = await fetch("/api/analyse-impact/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          lieuId,
          lieuNom,
          dateFrom,
          dateTo,
          newToleranceSup,
          newToleranceInf,
          simAlarmCount,
          realAlarmCount,
          commentaireUtilisateur: comment,
        }),
      })
      if (response.ok) {
        toast.success(t("save.success"))
        setComment("")
        onOpenChange(false)
      } else {
        toast.error(t("save.error"))
      }
    } catch {
      toast.error(t("save.error"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent draggable={false}>
        <DialogHeader>
          <DialogTitle>{t("save.dialogTitle")}</DialogTitle>
          <DialogDescription>{t("save.dialogDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="save-comment">{t("save.commentLabel")}</Label>
          <Textarea
            id="save-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("save.commentPlaceholder")}
            rows={5}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            {t("save.cancel")}
          </Button>
          <Button
            onClick={() => void handleSave()}
            disabled={isSaving || !comment.trim()}
          >
            {t("save.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
