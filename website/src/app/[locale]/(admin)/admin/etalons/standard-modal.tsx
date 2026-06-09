"use client"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

import { patchJson, postJson } from "@/lib/http"
import { buildStandardSerial, inferStandardTypeCode } from "@/lib/standard-types"
import { showFormValidationToast } from "@/lib/form-toast"
import { useRouter } from "@/i18n/navigation"
import type { Standard } from "@/hooks/useStandards"
import { useModules } from "@/hooks/useModules"
import { useStandardTypes } from "@/hooks/useStandardTypes"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"

import { StandardCertificateForm } from "./_components/standard-certificate-form"
import { StandardInfoForm } from "./_components/standard-info-form"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  standard?: Standard | null
  isEditing?: boolean
}

type StandardFormValues = {
  type?: string
  serie: string
  moduleId?: string
  portSerie?: string
  idWorker?: string
  coeffA?: string
  coeffB?: string
  coeffC?: string
  incertitudeMax?: string
  pdfId?: number | null
  pdfName?: string
}

function asNullableNumber(value: string | undefined) {
  if (!value?.trim()) return null
  const parsed = Number(value.replace(",", "."))
  return Number.isFinite(parsed) ? parsed : null
}

export function StandardModal({ open, onOpenChange, standard, isEditing }: Props) {
  const t = useTranslations('standardsPage')
  const queryClient = useQueryClient()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const standardSchema = useMemo(() => z.object({
    type: z.string().optional(),
    serie: z.string().min(1, t('form.validation.serialRequired')),
    moduleId: z.string().optional(),
    portSerie: z.string().optional(),
    idWorker: z.string().optional(),
    coeffA: z.string().optional(),
    coeffB: z.string().optional(),
    coeffC: z.string().optional(),
    incertitudeMax: z.string().optional(),
    pdfId: z.number().nullable().optional(),
    pdfName: z.string().optional(),
  }), [t])

  const defaultValues = useMemo<StandardFormValues>(
    () => ({
      type: isEditing && standard?.Etalon_Numero_Serie ? inferStandardTypeCode(standard.Etalon_Numero_Serie, undefined) ?? "" : "",
      serie: standard?.Etalon_Numero_Serie || "",
      moduleId: standard?.Id_Module?.toString() || "",
      portSerie: standard?.Port_Serie || "",
      idWorker: standard?.Id_Worker?.toString() || "",
      coeffA: standard?.Coeff_A?.toString() || "",
      coeffB: standard?.Coeff_B?.toString() || "",
      coeffC: standard?.Coeff_C?.toString() || "",
      incertitudeMax: standard?.Incertitude_Max?.toString() || "",
      pdfId: standard?.Pdf_Id ?? null,
      pdfName: standard?.Pdf_Name || "",
    }),
    [isEditing, standard],
  )

  const form = useForm<StandardFormValues>({
    resolver: zodResolver(standardSchema),
    defaultValues,
    mode: "onChange",
  })

  const { data: types, isLoading: typesLoading } = useStandardTypes(open)
  const { data: modules, isLoading: modulesLoading } = useModules(open)
  const watchedModuleId = useWatch({ control: form.control, name: "moduleId" })
  const watchedType = useWatch({ control: form.control, name: "type" })

  useEffect(() => {
    if (!open) return
    form.reset(defaultValues)
  }, [defaultValues, form, open])

  useEffect(() => {
    const selectedModule = modules?.find((module) => String(module.Id_Module) === String(watchedModuleId))
    form.setValue("portSerie", selectedModule?.Port_Serie || "", { shouldDirty: false })
    form.setValue("idWorker", selectedModule?.Id_Worker?.toString() || "", { shouldDirty: false })
  }, [form, modules, watchedModuleId])

  async function handleSubmit(values: StandardFormValues) {
    setIsLoading(true)

    try {
      const serialToStore = buildStandardSerial(values.type, values.serie)
      const selectedType = types?.find((type) => (type.Type_Etalon ?? "").toUpperCase() === String(watchedType ?? values.type ?? "").toUpperCase()) ?? null
      const payload = {
        Etalon_Numero_Serie: serialToStore,
        Etat_Etalon: "1",
        Id_Module: values.moduleId ? Number(values.moduleId) : null,
        Est_Sonde_Externe: Boolean(selectedType?.Est_Sonde_Externe),
        Coeff_A: asNullableNumber(values.coeffA),
        Coeff_B: asNullableNumber(values.coeffB),
        Coeff_C: asNullableNumber(values.coeffC),
        Incertitude_Max: asNullableNumber(values.incertitudeMax),
        Pdf_Id: values.pdfId ?? null,
      }

      if (isEditing && standard) {
        await patchJson(`/api/etalons/${standard.Id_Etalon}`, payload)
      } else {
        await postJson("/api/etalons", payload)
      }

      toast.success(isEditing ? t('form.toast.updated') : t('form.toast.created'))
      queryClient.invalidateQueries({ queryKey: ["etalons"] })
      router.refresh()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('form.toast.error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-5xl dark:bg-popover dark:text-popover-foreground">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('form.dialog.editTitle') : t('form.dialog.createTitle')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit, (errors) => showFormValidationToast(errors))} className="space-y-6">
            <StandardInfoForm
              isEditing={!!isEditing}
              types={types}
              typesLoading={typesLoading}
              modules={modules}
              modulesLoading={modulesLoading}
            />

            <Separator />

            <StandardCertificateForm standardId={standard?.Id_Etalon ?? null} existingPdfName={standard?.Pdf_Name ?? null} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                {t('form.actions.cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t('form.actions.saving') : isEditing ? t('form.actions.update') : t('form.actions.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
