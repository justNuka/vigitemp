"use client"
import { showFormValidationToast } from "@/lib/form-toast"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Form } from "@/components/ui/form"

import { useModules } from "@/hooks/useModules"
import { useStandardTypes } from "@/hooks/useStandardTypes"
import type { Standard } from "@/hooks/useStandards"

import { StandardCertificateForm } from "./_components/standard-certificate-form"
import { StandardInfoForm } from "./_components/standard-info-form"
import { StandardMeasurementsTable, type MeasurementPoint } from "./_components/standard-measurements-table"
import { patchJson, postJson } from "@/lib/http"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  standard?: Standard | null
  isEditing?: boolean
}

type Measurement = MeasurementPoint

const measurementSchema = z.object({
  reference: z.string().default(""),
  value: z.string().default(""),
  incertitude: z.string().default(""),
})

const buildStandardSchema = (serialRequired: string) => z.object({
  type: z.string().optional(),
  serie: z.string().min(1, serialRequired),
  moduleId: z.string().optional(),
  portSerie: z.string().optional(),
  idServeur: z.string().optional(),
  valeurBase: z.string().optional(),
  resolution: z.string().optional(),
  incertitude: z.string().optional(),
  organisme: z.string().optional(),
  dateCertif: z.string().optional(),
  unite: z.string().optional(),
  numeroCertif: z.string().optional(),
  mesures: z.array(measurementSchema).default([]),
})

type StandardFormValues = z.input<ReturnType<typeof buildStandardSchema>>

export function StandardModal({ open, onOpenChange, standard, isEditing }: Props) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const t = useTranslations('standardsDialog')
  const tCommon = useTranslations('common')
  const [isLoading, setIsLoading] = useState(false)

  const defaultValues = useMemo<StandardFormValues>(
    () => ({
      type: isEditing && standard?.Etalon_Numero_Serie ? standard.Etalon_Numero_Serie.substring(0, 2) : "",
      serie: isEditing && standard?.Etalon_Numero_Serie ? standard.Etalon_Numero_Serie : "",
      moduleId: standard?.Id_Module?.toString() || "",
      portSerie: standard?.Port_Serie || "",
      idServeur: standard?.Id_Serveur?.toString() || "0",
      valeurBase: "0",
      resolution: standard?.Resolution || "0",
      incertitude: standard?.Incertitude || "0",
      organisme: standard?.Organisme || "",
      dateCertif: standard?.Date_Certif ? standard.Date_Certif.substring(0, 10) : "",
      unite: standard?.Unite || "",
      numeroCertif: standard?.Num_Certif || "",
      mesures: [],
    }),
    [isEditing, standard],
  )

  const standardSchema = useMemo(() => buildStandardSchema(t("validation.serial_required")), [t])

  const form = useForm<StandardFormValues>({
    resolver: zodResolver(standardSchema),
    defaultValues,
    mode: "onChange",
  })

  const { append, update, remove } = useFieldArray({
    control: form.control,
    name: "mesures",
  })

  const mesures = (useWatch({ control: form.control, name: "mesures" }) ?? []).map((mesure) => ({
    reference: mesure?.reference ?? "",
    value: mesure?.value ?? "",
    incertitude: mesure?.incertitude ?? "",
  }))
  const [selectedMesureIndex, setSelectedMesureIndex] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data: types, isLoading: typesLoading } = useStandardTypes(open)
  const { data: modules, isLoading: modulesLoading } = useModules(open)

  useEffect(() => {
    if (!open) return
    form.reset(defaultValues)
    setSelectedMesureIndex(null)
    setIsDeleteDialogOpen(false)
  }, [defaultValues, form, open])

  const handleAddMesure = () => {
    append({ reference: "", value: "", incertitude: "" })
    setSelectedMesureIndex(mesures.length)
  }

  const handleUpdateMesure = (index: number, field: keyof Measurement, value: string) => {
    const current = mesures[index] || { reference: "", value: "", incertitude: "" }
    update(index, { ...current, [field]: value })
  }

  const handleDeleteMesure = () => {
    if (selectedMesureIndex !== null) {
      remove(selectedMesureIndex)
      setSelectedMesureIndex(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleSubmit = async (values: StandardFormValues) => {
    setIsLoading(true)

    try {
      const payload = {
        Etalon_Numero_Serie: values.serie,
        Resolution: values.resolution,
        Incertitude: values.incertitude,
        Numero: values.numeroCertif,
        Organisme: values.organisme,
        Date: values.dateCertif,
        Unite: values.unite,
        mesures: values.mesures?.map((m, index) => ({
          Numero_Ordre: index + 1,
          Temperature_Reference: m.reference || "",
          Temperature_Vraie: m.value || "",
          Incertitude: m.incertitude || "",
        })),
      }

      if (isEditing && standard) {
        await patchJson(`/api/etalons/${standard.Id_Etalon}`, payload)
      } else {
        await postJson("/api/etalons", payload)
      }

      toast.success(isEditing ? t('toast.update_success') : t('toast.create_success'))

      queryClient.invalidateQueries({ queryKey: ["etalons"] })
      router.refresh()
      onOpenChange(false)
    } catch (error) {
      console.error("Submit error:", error)
      toast.error(error instanceof Error ? error.message : t('toast.save_error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto bg-white dark:bg-card">
          <DialogHeader>
            <DialogTitle>{isEditing ? t('title_edit') : t('title_create')}</DialogTitle>
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

              <StandardCertificateForm />

              <Separator />

              <StandardMeasurementsTable
                mesures={mesures}
                selectedMesureIndex={selectedMesureIndex}
                onSelectMesure={setSelectedMesureIndex}
                onAdd={handleAddMesure}
                onUpdate={handleUpdateMesure}
                onRequestDelete={() => {
                  if (selectedMesureIndex !== null) setIsDeleteDialogOpen(true)
                }}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                  {tCommon('cancel')}
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? t('submit_saving') : isEditing ? t('submit_update') : t('submit_create')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('measurements.delete_title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('measurements.delete_description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteMesure} className="bg-red-600">
            {tCommon('delete')}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

