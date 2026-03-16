"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"

import { decodeXmlContent } from "@/components/stepper-import-shared/stepper-import-helpers"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { parseCalibrationXml } from "@/lib/calibration-import"
import type { VigilogLogger } from "./types"

type LoggerFormValue = {
  serial: string
  model: string
  label: string
  active: boolean
  calibrationDate: string
  calibrationValidityDate: string
  calibrationValidityDays: string
  accuracyError: string
  comment: string
}

function toDateInput(value: string | null | undefined) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function buildFormValue(logger?: VigilogLogger | null, defaults?: Partial<LoggerFormValue>): LoggerFormValue {
  return {
    serial: defaults?.serial ?? logger?.serial ?? "",
    model: defaults?.model ?? logger?.model ?? "",
    label: defaults?.label ?? logger?.label ?? "",
    active: defaults?.active ?? logger?.active ?? true,
    calibrationDate: defaults?.calibrationDate ?? toDateInput(logger?.calibrationDate),
    calibrationValidityDate:
      defaults?.calibrationValidityDate ?? toDateInput(logger?.calibrationValidityDate),
    calibrationValidityDays:
      defaults?.calibrationValidityDays ??
      (logger?.calibrationValidityDays != null ? String(logger.calibrationValidityDays) : ""),
    accuracyError:
      defaults?.accuracyError ?? (logger?.accuracyError != null ? String(logger.accuracyError) : ""),
    comment: defaults?.comment ?? logger?.comment ?? "",
  }
}

type VigilogLoggerDialogProps = {
  open: boolean
  logger?: VigilogLogger | null
  defaults?: Partial<LoggerFormValue> | null
  pending?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: {
    Numero_Serie: string
    Modele: string | null
    Libelle: string | null
    Actif: boolean
    Date_Etalonnage: string | null
    Date_Validite: string | null
    Duree_Validite_Jours: number | null
    Err_Justesse: number | null
    Commentaire: string | null
  }) => void
}

export function VigilogLoggerDialog({
  open,
  logger,
  defaults,
  pending = false,
  onOpenChange,
  onSubmit,
}: VigilogLoggerDialogProps) {
  const t = useTranslations("servicesVigilog")
  const { toast } = useToast()
  const calibrationFileInputRef = useRef<HTMLInputElement | null>(null)
  const [form, setForm] = useState<LoggerFormValue>(() => buildFormValue(logger, defaults ?? undefined))
  const [importedCalibrationFileName, setImportedCalibrationFileName] = useState("")

  useEffect(() => {
    if (open) {
      setForm(buildFormValue(logger, defaults ?? undefined))
      setImportedCalibrationFileName("")
    }
  }, [defaults, logger, open])

  const isEditing = Boolean(logger)
  const canSubmit = useMemo(() => form.serial.trim().length > 0, [form.serial])

  const handleCalibrationFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    try {
      const buffer = await file.arrayBuffer()
      const { text } = decodeXmlContent(buffer)
      const parsed = parseCalibrationXml(text, file.name)
      const accuracyError = parsed.data.Err_Justesse

      if (accuracyError == null || !Number.isFinite(accuracyError)) {
        setImportedCalibrationFileName("")
        toast({
          variant: "destructive",
          description: t("loggers.importCalibration.missingAccuracyError"),
        })
        return
      }

      setForm((current) => ({
        ...current,
        accuracyError: String(accuracyError),
      }))
      setImportedCalibrationFileName(file.name)
      toast({
        description: t("loggers.importCalibration.success", { file: file.name }),
      })
    } catch (error) {
      setImportedCalibrationFileName("")
      const message =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : t("loggers.importCalibration.error")
      toast({
        variant: "destructive",
        description: message,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl border-border/60 bg-white shadow-sm">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("loggers.dialog.editTitle") : t("loggers.dialog.createTitle")}
          </DialogTitle>
          <DialogDescription>{t("loggers.dialog.description")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vigilog-logger-serial">{t("loggers.fields.serial")}</Label>
              <Input
                id="vigilog-logger-serial"
                value={form.serial}
                onChange={(event) => setForm((current) => ({ ...current, serial: event.target.value }))}
                maxLength={30}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vigilog-logger-model">{t("loggers.fields.model")}</Label>
              <Input
                id="vigilog-logger-model"
                value={form.model}
                onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))}
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vigilog-logger-label">{t("loggers.fields.label")}</Label>
              <Input
                id="vigilog-logger-label"
                value={form.label}
                onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
                maxLength={100}
              />
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{t("loggers.fields.active")}</p>
                  <p className="text-xs text-muted-foreground">{t("loggers.dialog.activeHint")}</p>
                </div>
                <Switch
                  checked={form.active}
                  onCheckedChange={(checked) => setForm((current) => ({ ...current, active: checked }))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vigilog-logger-calibration-date">{t("loggers.fields.calibrationDate")}</Label>
                <Input
                  id="vigilog-logger-calibration-date"
                  type="date"
                  value={form.calibrationDate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, calibrationDate: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vigilog-logger-validity-date">{t("loggers.fields.validityDate")}</Label>
                <Input
                  id="vigilog-logger-validity-date"
                  type="date"
                  value={form.calibrationValidityDate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, calibrationValidityDate: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vigilog-logger-validity-days">{t("loggers.fields.validityDays")}</Label>
                <Input
                  id="vigilog-logger-validity-days"
                  type="number"
                  min="1"
                  step="1"
                  value={form.calibrationValidityDays}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, calibrationValidityDays: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vigilog-logger-accuracy-error">{t("loggers.fields.accuracyError")}</Label>
                <Input
                  id="vigilog-logger-accuracy-error"
                  type="number"
                  step="0.01"
                  value={form.accuracyError}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, accuracyError: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("loggers.importCalibration.label")}</Label>
              <div className="flex flex-wrap gap-2">
                <input
                  ref={calibrationFileInputRef}
                  type="file"
                  accept=".xml,text/xml,application/xml"
                  className="hidden"
                  onChange={handleCalibrationFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => calibrationFileInputRef.current?.click()}
                >
                  {t("loggers.importCalibration.action")}
                </Button>
              </div>
              {importedCalibrationFileName ? (
                <p className="text-xs text-foreground">
                  {t("loggers.importCalibration.selectedFile", { file: importedCalibrationFileName })}
                </p>
              ) : null}
              <p className="text-xs text-muted-foreground">{t("loggers.importCalibration.hint")}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vigilog-logger-comment">{t("loggers.fields.comment")}</Label>
              <Textarea
                id="vigilog-logger-comment"
                value={form.comment}
                onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
                rows={5}
                maxLength={2000}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            disabled={pending || !canSubmit}
            onClick={() =>
              onSubmit({
                Numero_Serie: form.serial.trim(),
                Modele: form.model.trim() || null,
                Libelle: form.label.trim() || null,
                Actif: form.active,
                Date_Etalonnage: form.calibrationDate || null,
                Date_Validite: form.calibrationValidityDate || null,
                Duree_Validite_Jours: form.calibrationValidityDays.trim()
                  ? Number(form.calibrationValidityDays)
                  : null,
                Err_Justesse: form.accuracyError.trim() ? Number(form.accuracyError) : null,
                Commentaire: form.comment.trim() || null,
              })
            }
          >
            {isEditing ? t("loggers.actions.saveCalibration") : t("loggers.actions.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
