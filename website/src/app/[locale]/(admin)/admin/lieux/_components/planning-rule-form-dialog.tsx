"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { CalendarClock, Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { TemporaryMemoryControls } from "@/components/form/temporary-memory-controls"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { computeEmt } from "@/lib/emt"
import { showFormValidationToast } from "@/lib/form-toast"
import { planningRegleCreateSchema, type LieuEmtParams, type PlanningRegleCreate, type PlanningRegleResponse } from "@/lib/planning-regle-schema"
import { PlanningRuleActiveField, PlanningRuleEmtSummary, PlanningRuleScheduleFields, PlanningRuleThresholdFields } from "./planning-dialog/planning-rule-form-fields"
import { buildDayOptions, createEmtModeLabels, expandPlanningRuleForDailyRepeat, getDefaultPlanningRuleValues, mapPlanningRuleToFormValues, submitPlanningRule, type PlanningRegleFormValues } from "./planning-dialog/planning-rule-form-helpers"

export interface PlanningRuleFormDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  idLieu: number
  editRegle?: PlanningRegleResponse | null
  emtParams: LieuEmtParams
  initialValues?: PlanningRegleFormValues | null
  baseSetpoints?: {
    consigne: number | null
    consigneSup: number | null
    consigneInf: number | null
    frequence: number | null
    retardAlarmeHaut: number | null
    retardAlarmeBas: number | null
  }
}

export function PlanningRuleFormDialog({
  open,
  onClose,
  onSuccess,
  idLieu,
  editRegle,
  emtParams,
  initialValues,
  baseSetpoints,
}: PlanningRuleFormDialogProps) {
  const tCommon = useTranslations("common")
  const tDialog = useTranslations("lieux.planning.dialog")
  const isEdit = !!editRegle
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [repeatEachDay, setRepeatEachDay] = useState(false)

  const joursOptions = useMemo(() => buildDayOptions(tDialog), [tDialog])
  const emtModeLabels = useMemo(() => createEmtModeLabels(tDialog), [tDialog])

  const form = useForm<PlanningRegleFormValues, unknown, PlanningRegleCreate>({
    resolver: zodResolver(planningRegleCreateSchema),
    defaultValues: getDefaultPlanningRuleValues(),
  })

  useEffect(() => {
    if (!open) return
    form.reset(isEdit && editRegle ? mapPlanningRuleToFormValues(editRegle) : initialValues ?? getDefaultPlanningRuleValues())
    setRepeatEachDay(false)
    setSubmitError(null)
  }, [open, isEdit, editRegle, initialValues, form])

  const watchedConsigne = form.watch("Consigne")
  const watchedConsigneSup = form.watch("Consigne_Sup")
  const watchedConsigneInf = form.watch("Consigne_Inf")
  const watchedJourDebut = form.watch("Jour_Debut")
  const watchedJourFin = form.watch("Jour_Fin")
  const canRepeatAcrossDays = !isEdit && watchedJourDebut !== undefined && watchedJourDebut === watchedJourFin

  const emtPreview = useMemo(
    () =>
      computeEmt({
        ...emtParams,
        consigne: watchedConsigne ?? null,
        consigneSup: watchedConsigneSup ?? null,
        consigneInf: watchedConsigneInf ?? null,
      }),
    [emtParams, watchedConsigne, watchedConsigneSup, watchedConsigneInf],
  )

  const handleSubmit = async (data: PlanningRegleCreate) => {
    setSubmitError(null)

    try {
      const payloads = !isEdit && repeatEachDay ? expandPlanningRuleForDailyRepeat(data) : [data]

      for (const payload of payloads) {
        const res = await submitPlanningRule({ isEdit, editRegle, idLieu, data: payload })
        if (!res.ok) {
          throw new Error("save_failed")
        }
      }

      toast.success(
        !isEdit && repeatEachDay
          ? tDialog("repeatSuccess", { count: payloads.length })
          : isEdit
            ? tDialog("titleEdit")
            : tDialog("titleCreate"),
      )
      onSuccess()
      onClose()
    } catch {
      const errorMessage = tDialog("errorSave")
      setSubmitError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const isSubmitting = form.formState.isSubmitting
  const submitForm = form.handleSubmit(handleSubmit, (errors) => showFormValidationToast(errors))
  const resetValues = isEdit && editRegle ? mapPlanningRuleToFormValues(editRegle) : initialValues ?? getDefaultPlanningRuleValues()
  const memoryKey = `planning-rule:${idLieu}:${editRegle?.Id_Regle ?? "new"}`

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-popover dark:text-popover-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            {isEdit ? tDialog("titleEdit") : tDialog("titleCreate")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              void submitForm(event)
            }}
            className="space-y-4"
          >
            <TemporaryMemoryControls
              form={form}
              storageKey={memoryKey}
              resetValues={resetValues}
              labels={{
                save: tDialog("temporaryMemory.save"),
                restore: tDialog("temporaryMemory.restore"),
                clear: tDialog("temporaryMemory.clear"),
                saved: tDialog("temporaryMemory.saved"),
              }}
            />

            <div className="rounded-md bg-muted/30 p-3 space-y-4">
              <PlanningRuleScheduleFields form={form} tDialog={tDialog} joursOptions={joursOptions} />
            </div>

            <div className="rounded-md bg-muted/30 p-3 space-y-4">
              <PlanningRuleThresholdFields form={form} tDialog={tDialog} />
            </div>

            {baseSetpoints ? (
              <div className="rounded-md border bg-muted/40 p-3 text-sm">
                <p className="font-medium">{tDialog("baseSetpointsTitle")}</p>
                <div className="mt-2 grid grid-cols-2 gap-3 text-muted-foreground">
                  <span>{tDialog("baseSetpoint", { value: baseSetpoints.consigne ?? "?" })}</span>
                  <span>{tDialog("baseFrequency", { value: baseSetpoints.frequence ?? "?" })}</span>
                  <span>{tDialog("baseUpper", { value: baseSetpoints.consigneSup ?? "?", delay: baseSetpoints.retardAlarmeHaut ?? "?" })}</span>
                  <span>{tDialog("baseLower", { value: baseSetpoints.consigneInf ?? "?", delay: baseSetpoints.retardAlarmeBas ?? "?" })}</span>
                </div>
              </div>
            ) : null}

            {canRepeatAcrossDays ? (
              <div className="rounded-md border border-dashed border-primary/30 bg-primary/5 p-3">
                <label className="flex cursor-pointer items-start gap-3">
                  <Checkbox checked={repeatEachDay} onCheckedChange={(checked) => setRepeatEachDay(checked === true)} />
                  <div className="space-y-1">
                    <span className="text-sm font-medium">{tDialog("repeatEachDayLabel")}</span>
                    <p className="text-xs text-muted-foreground">{tDialog("repeatEachDayHint")}</p>
                  </div>
                </label>
              </div>
            ) : null}

            <PlanningRuleEmtSummary
              tDialog={tDialog}
              emtPreview={emtPreview}
              emtMode={emtParams.mode}
              emtModeLabel={emtModeLabels[emtParams.mode]}
              correctAccuracyError={emtParams.correctAccuracyError}
              includeDeriveInUncertainty={emtParams.includeDeriveInUncertainty}
            />

            <PlanningRuleActiveField form={form} tDialog={tDialog} />

            {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="gap-2">
                <X className="h-4 w-4" />
                {tCommon("cancel")}
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                className="gap-2"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  void submitForm()
                }}
              >
                <Check className="h-4 w-4" />
                {isSubmitting ? tDialog("saving") : tCommon("save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
