"use client"

import { useEffect, useMemo, useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { VigilogConfiguration } from "./types"

type ConfigurationFormValue = {
  name: string
  description: string
  target: string
  lowLimitActive: boolean
  lowLimit: string
  highLimitActive: boolean
  highLimit: string
  frequencyMinutes: string
  alarmDelayMinutes: string
  startDelayMinutes: string
  stopButtonEnabled: boolean
  resetWithStartEnabled: boolean
  active: boolean
}

function buildFormValue(configuration?: VigilogConfiguration | null): ConfigurationFormValue {
  return {
    name: configuration?.name ?? "",
    description: configuration?.description ?? "",
    target: configuration?.target != null ? String(configuration.target) : "",
    lowLimitActive: configuration?.lowLimitActive ?? false,
    lowLimit: configuration?.lowLimit != null ? String(configuration.lowLimit) : "",
    highLimitActive: configuration?.highLimitActive ?? false,
    highLimit: configuration?.highLimit != null ? String(configuration.highLimit) : "",
    frequencyMinutes:
      configuration?.frequencyMinutes != null ? String(configuration.frequencyMinutes) : "15",
    alarmDelayMinutes:
      configuration?.alarmDelayMinutes != null ? String(configuration.alarmDelayMinutes) : "15",
    startDelayMinutes:
      configuration?.startDelayMinutes != null ? String(configuration.startDelayMinutes) : "0",
    stopButtonEnabled: configuration?.stopButtonEnabled ?? true,
    resetWithStartEnabled: configuration?.resetWithStartEnabled ?? true,
    active: configuration?.active ?? true,
  }
}

type VigilogConfigurationDialogProps = {
  open: boolean
  configuration?: VigilogConfiguration | null
  pending?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: {
    Nom_Configuration: string
    Description_Configuration: string | null
    Consigne: number | null
    Limite_Basse_Active: boolean
    Limite_Basse: number | null
    Limite_Haute_Active: boolean
    Limite_Haute: number | null
    Frequence_Min: number
    Retard_Alarme_Min: number
    Delai_Demarrage_Min: number
    Autorise_Arret_Bouton_Stop: boolean
    Reinitialise_Avec_Bouton_Start: boolean
    Actif: boolean
  }) => void
}

export function VigilogConfigurationDialog({
  open,
  configuration,
  pending = false,
  onOpenChange,
  onSubmit,
}: VigilogConfigurationDialogProps) {
  const t = useTranslations("servicesVigilog")
  const [form, setForm] = useState<ConfigurationFormValue>(() => buildFormValue(configuration))

  useEffect(() => {
    if (open) {
      const syncTimer = window.setTimeout(() => {
        setForm(buildFormValue(configuration))
      }, 0)

      return () => {
        window.clearTimeout(syncTimer)
      }
    }
  }, [configuration, open])

  const isEditing = Boolean(configuration)
  const lowLimitDisabled = !form.lowLimitActive
  const highLimitDisabled = !form.highLimitActive

  const canSubmit = useMemo(() => {
    if (!form.name.trim()) return false
    if (!form.frequencyMinutes.trim() || Number(form.frequencyMinutes) <= 0) return false
    if (!form.alarmDelayMinutes.trim() || Number(form.alarmDelayMinutes) <= 0) return false
    if (!form.startDelayMinutes.trim() || Number(form.startDelayMinutes) < 0) return false
    if (form.lowLimitActive && !form.lowLimit.trim()) return false
    if (form.highLimitActive && !form.highLimit.trim()) return false
    return true
  }, [form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl border-border/60 bg-white shadow-sm dark:bg-popover dark:text-popover-foreground">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("config.dialog.editTitle") : t("config.dialog.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("config.dialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vigilog-config-name">{t("config.fields.name")}</Label>
              <Input
                id="vigilog-config-name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vigilog-config-description">{t("config.fields.description")}</Label>
              <Textarea
                id="vigilog-config-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                rows={4}
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vigilog-config-target">{t("config.fields.target")}</Label>
              <Input
                id="vigilog-config-target"
                type="number"
                step="0.01"
                value={form.target}
                onChange={(event) => setForm((current) => ({ ...current, target: event.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="vigilog-config-low-enabled">{t("config.fields.lowLimitActive")}</Label>
                  <Switch
                    id="vigilog-config-low-enabled"
                    checked={form.lowLimitActive}
                    onCheckedChange={(checked) =>
                      setForm((current) => ({ ...current, lowLimitActive: checked }))
                    }
                  />
                </div>
                <Input
                  type="number"
                  step="0.01"
                  disabled={lowLimitDisabled}
                  value={form.lowLimit}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, lowLimit: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="vigilog-config-high-enabled">{t("config.fields.highLimitActive")}</Label>
                  <Switch
                    id="vigilog-config-high-enabled"
                    checked={form.highLimitActive}
                    onCheckedChange={(checked) =>
                      setForm((current) => ({ ...current, highLimitActive: checked }))
                    }
                  />
                </div>
                <Input
                  type="number"
                  step="0.01"
                  disabled={highLimitDisabled}
                  value={form.highLimit}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, highLimit: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vigilog-config-frequency">{t("config.fields.frequencyMinutes")}</Label>
                <Input
                  id="vigilog-config-frequency"
                  type="number"
                  min="1"
                  step="1"
                  value={form.frequencyMinutes}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, frequencyMinutes: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vigilog-config-start-delay">{t("config.fields.startDelayMinutes")}</Label>
                <Input
                  id="vigilog-config-start-delay"
                  type="number"
                  min="0"
                  step="1"
                  value={form.startDelayMinutes}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, startDelayMinutes: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vigilog-config-delay">{t("config.fields.alarmDelayMinutes")}</Label>
                <Input
                  id="vigilog-config-delay"
                  type="number"
                  min="1"
                  step="1"
                  value={form.alarmDelayMinutes}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, alarmDelayMinutes: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/30 p-4">
              <p className="text-sm font-medium text-foreground">{t("config.advanced.title")}</p>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-foreground">{t("config.fields.stopButtonEnabled")}</p>
                  <p className="text-xs text-muted-foreground">{t("config.advanced.stopHint")}</p>
                </div>
                <Switch
                  checked={form.stopButtonEnabled}
                  onCheckedChange={(checked) =>
                    setForm((current) => ({ ...current, stopButtonEnabled: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-foreground">{t("config.fields.resetWithStartEnabled")}</p>
                  <p className="text-xs text-muted-foreground">{t("config.advanced.resetHint")}</p>
                </div>
                <Switch
                  checked={form.resetWithStartEnabled}
                  onCheckedChange={(checked) =>
                    setForm((current) => ({ ...current, resetWithStartEnabled: checked }))
                  }
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t("config.fields.active")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("config.dialog.activeHint")}
                  </p>
                </div>
                <Switch
                  checked={form.active}
                  onCheckedChange={(checked) => setForm((current) => ({ ...current, active: checked }))}
                />
              </div>
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
                Nom_Configuration: form.name.trim(),
                Description_Configuration: form.description.trim() || null,
                Consigne: form.target.trim() ? Number(form.target) : null,
                Limite_Basse_Active: form.lowLimitActive,
                Limite_Basse: form.lowLimitActive && form.lowLimit.trim() ? Number(form.lowLimit) : null,
                Limite_Haute_Active: form.highLimitActive,
                Limite_Haute: form.highLimitActive && form.highLimit.trim() ? Number(form.highLimit) : null,
                Frequence_Min: Number(form.frequencyMinutes),
                Retard_Alarme_Min: Number(form.alarmDelayMinutes),
                Delai_Demarrage_Min: Number(form.startDelayMinutes),
                Autorise_Arret_Bouton_Stop: form.stopButtonEnabled,
                Reinitialise_Avec_Bouton_Start: form.resetWithStartEnabled,
                Actif: form.active,
              })
            }
          >
            {isEditing ? t("config.actions.save") : t("config.actions.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
