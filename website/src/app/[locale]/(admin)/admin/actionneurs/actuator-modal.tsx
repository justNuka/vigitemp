"use client"

import { showFormValidationToast } from "@/lib/form-toast"



import { useEffect, useMemo } from "react"

import { useQueryClient } from '@tanstack/react-query'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { TemporaryMemoryControls } from "@/components/form/temporary-memory-controls"

import { Input } from "@/components/ui/input"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Label } from "@/components/ui/label"

import { Combobox } from "@/components/ui/combobox"

import { useActuatorTypes } from "@/hooks/useActuatorTypes"

import { useLocations } from "@/hooks/useLocations"

import { useRouter } from '@/i18n/navigation'

import type { Actuator } from "@/hooks/useActuators"

import { patchJson, postJson } from "@/lib/http"

import { Check, X } from "lucide-react"

import { useForm, Controller } from "react-hook-form"

import { z } from "zod"

import { zodResolver } from "@hookform/resolvers/zod"

import { useTranslations } from 'next-intl'

import { toast } from "sonner"



type Props = {

  open: boolean

  onOpenChange: (open: boolean) => void

  actuator?: Actuator | null

  isEditing?: boolean

}



export function ActuatorModal({ open, onOpenChange, actuator, isEditing }: Props) {

  const t = useTranslations('actuatorsForm')

  const tCommon = useTranslations('common')

  const queryClient = useQueryClient()

  const router = useRouter()

  const isEdit = Boolean(isEditing && actuator)

  const contentKey = useMemo(() => {

    const id = actuator?.Id_Actionneur ?? "new"

    return `${isEdit ? "edit" : "new"}-${id}-${open ? "open" : "closed"}`

  }, [actuator?.Id_Actionneur, isEdit, open])



  const { data: types, isLoading: typesLoading } = useActuatorTypes(open)

  const { data: locations, isLoading: locationsLoading } = useLocations(open)



  const locationOptions = useMemo(

    () =>

      (locations ?? []).map((location) => ({

        value: location.Id_Lieu.toString(),

        label: location.Nom_Lieu || t('fields.location_fallback', { id: location.Id_Lieu }),

        searchText: `${location.Nom_Lieu || ""} ${location.Id_Lieu}`,

      })),

    [locations, t]

  )



  const initial = useMemo(

    () => ({

      type: isEdit ? actuator?.Type?.toString() || "" : "",

      serie: isEdit ? actuator?.Num_Serie || "" : "",

      commentaire: isEdit ? actuator?.Commentaire || "" : "",

      locationId: isEdit ? actuator?.Id_Lieu?.toString() || "" : "",

    }),

    [actuator, isEdit],

  )



  const actuatorSchema = z.object({

    type: z.string().optional(),

    serie: z.string().optional(),

    commentaire: z.string().optional(),

    locationId: z.string().optional(),

  })



  type ActuatorFormValues = z.infer<typeof actuatorSchema>



  const form = useForm<ActuatorFormValues>({

    resolver: zodResolver(actuatorSchema),

    defaultValues: initial,

  })

  const {

    register,

    handleSubmit,

    control,

    reset,

    formState: { errors, isSubmitting },

  } = form

  const memoryKey = `actuator-form:${isEdit ? actuator?.Id_Actionneur ?? "edit" : "new"}`



  useEffect(() => {

    if (!open) return

    reset(initial)

  }, [initial, open, reset])



  const onSubmit = async (values: ActuatorFormValues) => {

    try {

      const payload = {

        type: values.type,

        serie: values.serie,

        commentaire: values.commentaire,

        lieuId: values.locationId,

      }



      if (isEdit && actuator) {

        await patchJson(`/api/actionneurs/${actuator.Id_Actionneur}`, payload)

      } else {

        await postJson("/api/actionneurs", payload)

      }



      await queryClient.invalidateQueries({ queryKey: ["actionneurs"] })

      router.refresh()

      toast.success(isEdit ? t("toast.save_success") : t("toast.create_success"))

      onOpenChange(false)

    } catch (error) {

      toast.error(error instanceof Error ? error.message : t("toast.save_error"))

    }

  }



  return (

    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent key={contentKey} className="sm:max-w-125 bg-white dark:bg-card">

        <DialogHeader>

          <DialogTitle>{isEdit ? t('title_edit') : t('title_create')}</DialogTitle>

        </DialogHeader>



        <form onSubmit={handleSubmit(onSubmit, (errors) => showFormValidationToast(errors))} className="space-y-4">

          <TemporaryMemoryControls
            form={form}
            storageKey={memoryKey}
            resetValues={initial}
            labels={{
              save: tCommon('temporary_memory.save'),
              restore: tCommon('temporary_memory.restore'),
              clear: tCommon('temporary_memory.clear'),
              saved: tCommon('temporary_memory.saved'),
            }}
          />

          <div className="space-y-2">

            <Label htmlFor="type">{t('fields.type_label')}</Label>

            <Controller

              control={control}

              name="type"

              render={({ field }) => (

                <Select value={field.value} onValueChange={field.onChange} disabled={isEdit}>

                  <SelectTrigger id="type" disabled={typesLoading || isEdit}>

                    <SelectValue placeholder={t('fields.type_placeholder')} />

                  </SelectTrigger>

                  <SelectContent>

                    {types?.filter((type) => type.Type != null).map((type) => (

                      <SelectItem key={type.Type} value={type.Type!.toString()}>

                        {type.Description || t('fields.type_fallback', { id: type.Type! })}

                      </SelectItem>

                    ))}

                  </SelectContent>

                </Select>

              )}

            />

            {errors.type?.message && (

              <p className="text-sm text-destructive">{String(errors.type.message)}</p>

            )}

          </div>



          <div className="space-y-2">

            <Label htmlFor="serie">{t('fields.serial_label')}</Label>

            <Input id="serie" placeholder={t('fields.serial_placeholder')} {...register("serie")} />

          </div>



          <div className="space-y-2">

            <Label htmlFor="commentaire">{t('fields.comment_label')}</Label>

            <Input id="commentaire" placeholder={t('fields.comment_placeholder')} {...register("commentaire")} />

          </div>



          <div className="space-y-2">

            <Label htmlFor="lieu">{t('fields.location_label')}</Label>

            <Controller

              control={control}

              name="locationId"

              render={({ field }) => (

                <Combobox

                  triggerId="lieu"

                  value={field.value || ""}

                  onValueChange={field.onChange}

                  options={locationOptions}

                  placeholder={t('fields.location_placeholder')}

                  searchPlaceholder={t('fields.location_search')}

                  emptyMessage={t('fields.location_empty')}

                  disabled={locationsLoading}

                />

              )}

            />

          </div>



          <DialogFooter>

            <Button variant="outline" onClick={() => onOpenChange(false)} className="gap-2" type="button">

              <X className="h-4 w-4" />

              {tCommon('cancel')}

            </Button>

            <Button className="gap-2" type="submit" disabled={isSubmitting}>

              <Check className="h-4 w-4" />

              {isEdit ? t('submit.update') : t('submit.create')}

            </Button>

          </DialogFooter>

        </form>

      </DialogContent>

    </Dialog>

  )

}









