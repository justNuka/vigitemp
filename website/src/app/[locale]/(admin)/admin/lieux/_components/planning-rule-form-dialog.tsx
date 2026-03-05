"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { computeEmt } from "@/lib/emt"
import { showFormValidationToast } from "@/lib/form-toast"
import { planningRegleCreateSchema, type LieuEmtParams, type PlanningRegleCreate, type PlanningRegleResponse } from "@/lib/planning-regle-schema"
import { PlanningRuleActiveField, PlanningRuleEmtSummary, PlanningRuleScheduleFields, PlanningRuleThresholdFields } from "./planning-dialog/planning-rule-form-fields"
import { buildDayOptions, createEmtModeLabels, getDefaultPlanningRuleValues, mapPlanningRuleToFormValues, submitPlanningRule, type PlanningRegleFormValues } from "./planning-dialog/planning-rule-form-helpers"

export interface PlanningRuleFormDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  idLieu: number
  editRegle?: PlanningRegleResponse | null
  emtParams: LieuEmtParams
}

export function PlanningRuleFormDialog({
  open,
  onClose,
  onSuccess,
  idLieu,
  editRegle,
  emtParams,
}: PlanningRuleFormDialogProps) {
  const tCommon = useTranslations("common")
  const tDialog = useTranslations("lieux.planning.dialog")
  const isEdit = !!editRegle
  const [submitError, setSubmitError] = useState<string | null>(null)

  const joursOptions = useMemo(() => buildDayOptions(tDialog), [tDialog])
  const emtModeLabels = useMemo(() => createEmtModeLabels(tDialog), [tDialog])

  const form = useForm<PlanningRegleFormValues, unknown, PlanningRegleCreate>({
    resolver: zodResolver(planningRegleCreateSchema),
    defaultValues: getDefaultPlanningRuleValues(),
  })

  useEffect(() => {
    if (!open) return
    form.reset(isEdit && editRegle ? mapPlanningRuleToFormValues(editRegle) : getDefaultPlanningRuleValues())
    setSubmitError(null)
  }, [open, isEdit, editRegle, form])

  const watchedConsigne = form.watch("Consigne")
  const watchedConsigneSup = form.watch("Consigne_Sup")
  const watchedConsigneInf = form.watch("Consigne_Inf")

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
      const res = await submitPlanningRule({ isEdit, editRegle, idLieu, data })
      if (res.ok) {
        toast.success(isEdit ? tDialog("titleEdit") : tDialog("titleCreate"))
        onSuccess()
        onClose()
      } else {
        const errorMessage = tDialog("errorSave")
        setSubmitError(errorMessage)
        toast.error(errorMessage)
      }
    } catch {
      const errorMessage = tDialog("errorSave")
      setSubmitError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const isSubmitting = form.formState.isSubmitting
  const submitForm = form.handleSubmit(handleSubmit, (errors) => showFormValidationToast(errors))

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-card">
        <DialogHeader>
          <DialogTitle>{isEdit ? tDialog("titleEdit") : tDialog("titleCreate")}</DialogTitle>
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
            <PlanningRuleScheduleFields form={form} tDialog={tDialog} joursOptions={joursOptions} />
            <PlanningRuleThresholdFields form={form} tDialog={tDialog} />

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
