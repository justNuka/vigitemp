"use client"

import { useEffect, useMemo, useState } from "react"
import { Link2, Search } from "lucide-react"
import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Module } from "@/hooks/useModules"

export type AdjustmentImportAssignmentSensor = {
  serialNumber: string
  existingModuleId: number | null
  existingModuleLabel: string | null
  assignedModuleId: number | null
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  modules: Module[]
  sensors: AdjustmentImportAssignmentSensor[]
  onAssign: (serialNumber: string, moduleId: number) => void
  onClear: (serialNumber: string) => void
}

function getModuleLabel(module: Module) {
  const label = module.Module_Numero_Serie || module.Libelle_Type_Module || `#${module.Id_Module}`
  return module.Port_Serie ? `${label} (${module.Port_Serie})` : label
}

export function AdjustmentImportModuleAssignmentDialog({
  open,
  onOpenChange,
  modules,
  sensors,
  onAssign,
  onClear,
}: Props) {
  const t = useTranslations("sensorAdjustmentImport.module_assignment_dialog")
  const [selectedModuleId, setSelectedModuleId] = useState("")
  const [search, setSearch] = useState("")

  const moduleLabelById = useMemo(
    () => new Map(modules.map((module) => [module.Id_Module, getModuleLabel(module)])),
    [modules],
  )

  useEffect(() => {
    if (!open) return
    if (modules.length === 0) {
      setSelectedModuleId("")
      return
    }
    const selectedStillExists = modules.some((module) => String(module.Id_Module) === selectedModuleId)
    if (!selectedStillExists) setSelectedModuleId(String(modules[0].Id_Module))
  }, [modules, open, selectedModuleId])

  useEffect(() => {
    if (!open) setSearch("")
  }, [open])

  const selectedModuleNumericId = selectedModuleId ? Number(selectedModuleId) : null
  const selectedModuleLabel = selectedModuleNumericId ? moduleLabelById.get(selectedModuleNumericId) ?? "-" : "-"
  const query = search.trim().toLowerCase()
  const filteredSensors = sensors.filter((sensor) => {
    if (!query) return true
    const effectiveModuleId = sensor.existingModuleId ?? sensor.assignedModuleId
    const assignmentLabel = effectiveModuleId ? moduleLabelById.get(effectiveModuleId) ?? "" : t("no_module")
    return sensor.serialNumber.toLowerCase().includes(query) || assignmentLabel.toLowerCase().includes(query)
  })
  const assignedCount = sensors.filter((sensor) => (sensor.existingModuleId ?? sensor.assignedModuleId) != null).length
  const unassignedCount = sensors.length - assignedCount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-3xl overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto px-6 pb-2">
          <div className="grid gap-3 rounded-xl border bg-muted/20 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div className="space-y-2">
              <Label>{t("module_label")}</Label>
              <Select value={selectedModuleId} onValueChange={setSelectedModuleId} disabled={modules.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder={t("module_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module.Id_Module} value={String(module.Id_Module)}>
                      {getModuleLabel(module)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="secondary">{t("assigned_count", { count: assignedCount })}</Badge>
              <Badge variant="outline">{t("unassigned_count", { count: unassignedCount })}</Badge>
            </div>
          </div>

          {modules.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">{t("no_modules")}</div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("search_placeholder")} className="pl-9" />
              </div>
              <p className="text-xs text-muted-foreground">{t("move_hint")}</p>

              <div className="max-h-[48vh] space-y-2 overflow-y-auto pr-1">
                {filteredSensors.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">{t("empty")}</div>
                ) : filteredSensors.map((sensor) => {
                  const locked = sensor.existingModuleId != null
                  const effectiveModuleId = sensor.existingModuleId ?? sensor.assignedModuleId
                  const assignmentLabel = effectiveModuleId
                    ? moduleLabelById.get(effectiveModuleId) ?? `#${effectiveModuleId}`
                    : t("no_module")
                  const checked = selectedModuleNumericId != null && effectiveModuleId === selectedModuleNumericId
                  const canClear = !locked && sensor.assignedModuleId != null

                  return (
                    <div key={sensor.serialNumber} className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between">
                      <label className="flex min-w-0 flex-1 items-start gap-3">
                        <Checkbox
                          className="mt-0.5"
                          checked={checked}
                          disabled={locked || selectedModuleNumericId == null}
                          aria-label={t("checkbox_aria", { sensor: sensor.serialNumber, module: selectedModuleLabel })}
                          onCheckedChange={(value) => {
                            if (locked || selectedModuleNumericId == null) return
                            if (value === true) onAssign(sensor.serialNumber, selectedModuleNumericId)
                            else if (sensor.assignedModuleId === selectedModuleNumericId) onClear(sensor.serialNumber)
                          }}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{sensor.serialNumber}</span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {locked ? t("existing_locked") : sensor.assignedModuleId != null ? t("assigned_here") : t("unassigned")}
                          </span>
                        </span>
                      </label>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Badge variant={locked ? "destructive" : effectiveModuleId ? "secondary" : "outline"}>{assignmentLabel}</Badge>
                        {canClear ? (
                          <Button type="button" variant="ghost" size="sm" onClick={() => onClear(sensor.serialNumber)}>
                            {t("clear")}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button type="button" onClick={() => onOpenChange(false)}>{t("close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
