"use client"

import { AlertCircle, CheckCircle2, Download, Mail } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type HardwareOrderResultDialogProps = {
  open: boolean
  kind: "success" | "failure" | "prepared" | null
  reference: string | null
  description: string
  countdown: number | null
  downloadReady: boolean
  labels: {
    successTitle: string
    failureTitle: string
    preparedTitle: string
    countdown: (seconds: number) => string
    downloadHint: string
    downloadNow: string
    close: string
    cancel: string
  }
  onOpenChange: (open: boolean) => void
  onDownload: () => void
}

export function HardwareOrderResultDialog({
  open,
  kind,
  reference,
  description,
  countdown,
  downloadReady,
  labels,
  onOpenChange,
  onDownload,
}: HardwareOrderResultDialogProps) {
  const isSuccess = kind === "success"
  const isPrepared = kind === "prepared"
  const isPositive = isSuccess || isPrepared

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent draggable={false} className="max-w-md rounded-3xl p-0">
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-white dark:bg-popover">
          <div
            className={
              isPositive
                ? "bg-[linear-gradient(135deg,rgba(25,145,201,0.12),rgba(25,145,201,0.03))] px-6 py-5"
                : "bg-[linear-gradient(135deg,rgba(239,68,68,0.12),rgba(239,68,68,0.03))] px-6 py-5"
            }
          >
            <div className="flex items-start gap-4">
              <div
                className={
                  isPositive
                    ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary"
                    : "flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/15 text-destructive"
                }
              >
                {isPositive ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
              </div>

              <DialogHeader className="space-y-2 text-left">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Mail className="h-4 w-4" />
                  {isSuccess
                    ? labels.successTitle
                    : isPrepared
                      ? labels.preparedTitle
                      : labels.failureTitle}
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </DialogDescription>
                {reference ? (
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {reference}
                  </p>
                ) : null}
              </DialogHeader>
            </div>
          </div>

          <div className="space-y-4 px-6 py-5">
            {isPositive && countdown !== null && countdown > 0 ? (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
                {labels.countdown(countdown)}
              </div>
            ) : null}

            {downloadReady ? (
              <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                {labels.downloadHint}
              </div>
            ) : null}
          </div>

          <DialogFooter className="gap-3 border-t border-border/60 px-6 py-5 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isPositive ? labels.close : labels.cancel}
            </Button>
            {downloadReady ? (
              <Button type="button" onClick={onDownload}>
                <Download className="h-4 w-4" />
                {labels.downloadNow}
              </Button>
            ) : null}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
