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
import { LocationTimingSection } from './general-tab/location-timing-section'
import type { LocationFormData } from './location-form-types'
import { resolveLocationSensorFormState } from './general-tab/location-sensor-form-state'

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
    formState: { errors, dirtyFields },
  } = useFormContext<LocationFormData>()
  const autoDisabledMonitoringRef = useRef(false)
  const previousSensorSerialRef = useRef<string | null | undefined>(undefined)

  const formData = watch()
  if (previousSensorSerialRef.current === undefined) {
    previousSensorSerialRef.current = formData.Sonde_Numero_Serie ?? null
  }
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
    const sensorSerial = formData.Sonde_Numero_Serie ?? null
    const sensorChanged = previousSensorSerialRef.current !== sensorSerial
    const nextState = resolveLocationSensorFormState({
      sensorSerial,
      sensorChanged,
      selectedSensorModuleId: selectedSensor?.Id_Module ?? null,
      currentModuleId: formData.Id_Module ?? null,
      monitoringState: formData.Lieu_Etat ?? null,
      monitoringWasAutoDisabled: autoDisabledMonitoringRef.current,
      monitoringExplicitlySet: Boolean(dirtyFields.Lieu_Etat),
      moduleExplicitlySet: Boolean(dirtyFields.Id_Module),
    })

    if ((formData.Id_Module ?? null) !== nextState.moduleId) {
      setValue('Id_Module', nextState.moduleId, { shouldDirty: false })
    }

    if ((formData.Lieu_Etat ?? null) !== nextState.monitoringState) {
      setValue('Lieu_Etat', nextState.monitoringState, {
        shouldDirty: false,
        shouldValidate: Boolean(sensorSerial),
      })
    }

    autoDisabledMonitoringRef.current = nextState.monitoringWasAutoDisabled
    previousSensorSerialRef.current = sensorSerial
  }, [
    dirtyFields.Id_Module,
    dirtyFields.Lieu_Etat,
    formData.Id_Module,
    formData.Lieu_Etat,
    formData.Sonde_Numero_Serie,
    selectedSensor?.Id_Module,
    setValue,
  ])

  return (
    <TabsContent value="general" className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-2">
          <Label>{t('labels.name')}</Label>
          <Input
            {...register('Nom_Lieu')}
            placeholder={t('placeholders.name')}
            maxLength={30}
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
      <LocationTimingSection isGsoSensor={isGsoSensor} />
      <LocationSetpointsSection
        idLieu={formData.Id_Lieu ?? null}
        onGoToPlanning={onGoToPlanning}
        sensorRange={
          selectedSensor
            ? {
                min: selectedSensor.Valeur_Min ?? null,
                max: selectedSensor.Valeur_Max ?? null,
                unit: selectedSensor.Unite_Type ?? formData.Unite ?? null,
              }
            : null
        }
      />
    </TabsContent>
  )
}
