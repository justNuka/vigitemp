'use client'

import { useEffect, useMemo } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { useTranslations } from 'next-intl'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TabsContent } from '@/components/ui/tabs'
import type { AvailableSensor } from '@/hooks/useAvailableSensors'
import type { Group } from '@/hooks/useGroups'
import type { Module } from '@/hooks/useModules'
import type { SiteSimple } from '@/hooks/useSites'

import { LocationGeneralSettingsSection } from './general-tab/location-general-settings-section'
import { toOptionalNumber } from './general-tab/location-form-parsers'
import { LocationSensorSection } from './general-tab/location-sensor-section'
import { LocationSetpointsSection } from './general-tab/location-setpoints-section'
import type { LocationFormData } from './location-form-types'

type Props = {
  sites: SiteSimple[]
  groups: Group[]
  availableSensors: AvailableSensor[]
  modules: Module[]
  onGoToPlanning?: () => void
}

export function LocationFormTabGeneral({ sites, groups, availableSensors, modules, onGoToPlanning }: Props) {
  const t = useTranslations('locationsForm.general')
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<LocationFormData>()

  const formData = watch()
  const selectedSensor = useMemo(
    () => availableSensors.find((sensor) => sensor.Sonde_Numero_Serie === formData.Sonde_Numero_Serie),
    [availableSensors, formData.Sonde_Numero_Serie],
  )
  const isGsoSensor = selectedSensor?.Sonde_Type?.toUpperCase() === 'GSO'
  const hasSondeSelected = Boolean(formData.Sonde_Numero_Serie)

  useEffect(() => {
    if (!isGsoSensor) return
    setValue('Frequence', 15)
  }, [isGsoSensor, setValue])

  useEffect(() => {
    if (!formData.Sonde_Numero_Serie) {
      setValue('Id_Module', null)
      return
    }
    setValue('Id_Module', selectedSensor?.Id_Module ?? null)
  }, [formData.Sonde_Numero_Serie, selectedSensor?.Id_Module, setValue])

  return (
    <TabsContent value="general" className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('labels.name')}</Label>
          <Input
            {...register('Nom_Lieu')}
            placeholder={t('placeholders.name')}
            aria-invalid={!!errors.Nom_Lieu}
            aria-describedby={errors.Nom_Lieu ? 'nom-lieu-error' : undefined}
          />
          {errors.Nom_Lieu?.message && (
            <p id="nom-lieu-error" className="text-sm text-destructive">
              {String(errors.Nom_Lieu.message)}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>{t('labels.type')}</Label>
          <Controller
            control={control}
            name="Type_Lieu"
            render={({ field }) => (
              <Select value={field.value || ''} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('placeholders.type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="etuve">{t('type_options.etuve')}</SelectItem>
                  <SelectItem value="bain_marie">{t('type_options.bain_marie')}</SelectItem>
                  <SelectItem value="ambiance">{t('type_options.ambiance')}</SelectItem>
                  <SelectItem value="frigo_congel">{t('type_options.frigo_congel')}</SelectItem>
                  <SelectItem value="autre">{t('type_options.autre')}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('labels.comment')}</Label>
          <Input {...register('Commentaire')} placeholder={t('placeholders.comment')} />
        </div>
        <div className="space-y-2">
          <Label>{t('labels.monitoring')}</Label>
          <Controller
            control={control}
            name="Lieu_Etat"
            render={({ field }) => (
              <RadioGroup value={field.value || 'S'} onValueChange={field.onChange} className="grid gap-2">
                <label className="flex items-center gap-2">
                  <RadioGroupItem value="S" />
                  <span>{t('labels.monitoring_enable')}</span>
                </label>
                <label className="flex items-center gap-2">
                  <RadioGroupItem value="D" />
                  <span>{t('labels.monitoring_disable')}</span>
                </label>
              </RadioGroup>
            )}
          />
        </div>
      </div>

      <LocationGeneralSettingsSection sites={sites} groups={groups} />
      <LocationSensorSection availableSensors={availableSensors} modules={modules} hasSondeSelected={hasSondeSelected} />
      <LocationSetpointsSection isGsoSensor={isGsoSensor} idLieu={formData.Id_Lieu ?? null} onGoToPlanning={onGoToPlanning} />
    </TabsContent>
  )
}
