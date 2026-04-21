'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { useTranslations } from 'next-intl'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { TabsContent } from '@/components/ui/tabs'
import type { AvailableSensor } from '@/hooks/useAvailableSensors'
import type { Group } from '@/hooks/useGroups'
import type { Module } from '@/hooks/useModules'
import type { SiteSimple } from '@/hooks/useSites'
import { useStandards } from '@/hooks/useStandards'

import { LocationGeneralSettingsSection } from './general-tab/location-general-settings-section'
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
  const { data: standards = [] } = useStandards()
  const {
    register,
    control,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<LocationFormData>()
  const autoDisabledMonitoringRef = useRef(false)

  const formData = watch()
  const selectedSensor = useMemo(
    () => availableSensors.find((sensor) => sensor.Sonde_Numero_Serie === formData.Sonde_Numero_Serie),
    [availableSensors, formData.Sonde_Numero_Serie],
  )
  const isGsoSensor = Boolean(
    selectedSensor?.Est_Sonde_GSO ||
    selectedSensor?.Famille_Sonde === 'GSO',
  )
  const hasSondeSelected = Boolean(formData.Sonde_Numero_Serie)
  const standardSensorSerials = useMemo(
    () =>
      standards
        .filter((standard) => !standard.Est_Archive && !!standard.Etalon_Numero_Serie)
        .map((standard) => standard.Etalon_Numero_Serie as string),
    [standards],
  )

  const setIfChanged = useCallback((name: keyof LocationFormData, value: unknown) => {
    if (Object.is(getValues(name as any), value)) return
    setValue(name as any, value as any)
  }, [getValues, setValue])

  useEffect(() => {
    if (!isGsoSensor) return
    if (Number(formData.Frequence) === 15) return
    setIfChanged('Frequence', 15)
  }, [formData.Frequence, isGsoSensor, setIfChanged])

  useEffect(() => {
    if (!formData.Sonde_Numero_Serie) {
      if (formData.Id_Module !== null) {
        setIfChanged('Id_Module', null)
      }
      if (formData.Lieu_Etat !== 'D') {
        if (!Object.is(getValues('Lieu_Etat'), 'D')) {
          setValue('Lieu_Etat', 'D', { shouldDirty: true })
        }
        autoDisabledMonitoringRef.current = true
      }
      return
    }

    const nextModuleId = selectedSensor?.Id_Module ?? null
    if ((formData.Id_Module ?? null) !== (nextModuleId ?? null)) {
      setIfChanged('Id_Module', nextModuleId)
    }

    if (autoDisabledMonitoringRef.current && formData.Lieu_Etat === 'D') {
      if (!Object.is(getValues('Lieu_Etat'), null)) {
        setValue('Lieu_Etat', null, { shouldDirty: true })
      }
      autoDisabledMonitoringRef.current = false
    }
  }, [formData.Id_Module, formData.Lieu_Etat, formData.Sonde_Numero_Serie, getValues, selectedSensor?.Id_Module, setIfChanged, setValue])

  return (
    <TabsContent value="general" className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
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
          <Label>{t('labels.observations')}</Label>
          <Textarea
            {...register('Observations_Info')}
            placeholder={t('placeholders.observations')}
            className="min-h-23 resize-y"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('labels.monitoring')}</Label>
          <Controller
            control={control}
            name="Lieu_Etat"
            render={({ field }) => (
              <RadioGroup value={field.value ?? ''} onValueChange={field.onChange} className="grid gap-2" disabled={!hasSondeSelected}>
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
          {errors.Lieu_Etat?.message ? <p className="text-sm text-destructive">{String(errors.Lieu_Etat.message)}</p> : null}
          {!hasSondeSelected ? <p className="text-xs text-muted-foreground">{t('tooltips.monitoring_requires_sensor')}</p> : null}
        </div>
      </div>

      <LocationGeneralSettingsSection sites={sites} groups={groups} />
      <LocationSensorSection
        availableSensors={availableSensors}
        modules={modules}
        hasSondeSelected={hasSondeSelected}
        standardSensorSerials={standardSensorSerials}
      />
      <LocationSetpointsSection isGsoSensor={isGsoSensor} idLieu={formData.Id_Lieu ?? null} onGoToPlanning={onGoToPlanning} />
    </TabsContent>
  )
}
