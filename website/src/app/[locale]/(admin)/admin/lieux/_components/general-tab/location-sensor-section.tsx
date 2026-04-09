'use client'

import { Combobox } from '@/components/ui/combobox'
import { Label } from '@/components/ui/label'
import { Controller, useFormContext } from 'react-hook-form'
import { useMemo } from 'react'
import { useTranslations } from 'next-intl'

import type { AvailableSensor } from '@/hooks/useAvailableSensors'
import type { Module } from '@/hooks/useModules'

import type { LocationFormData } from '../location-form-types'

export function LocationSensorSection({
  availableSensors,
  modules,
  hasSondeSelected,
  standardSensorSerials,
}: {
  availableSensors: AvailableSensor[]
  modules: Module[]
  hasSondeSelected: boolean
  standardSensorSerials: string[]
}) {
  const t = useTranslations('locationsForm.general')
  const { control } = useFormContext<LocationFormData>()
  const standardSerialSet = useMemo(() => new Set(standardSensorSerials), [standardSensorSerials])

  const sensorOptions = useMemo(() => {
    const standardEntries: { value: string; label: string; searchText: string }[] = []
    const regularEntries: { value: string; label: string; searchText: string }[] = []

    for (const sensor of availableSensors) {
      const serial = sensor.Sonde_Numero_Serie || ''
      if (!serial) continue

      const option = {
        value: serial,
        label: serial,
        searchText: serial,
      }

      if (standardSerialSet.has(serial)) {
        standardEntries.push(option)
      } else {
        regularEntries.push(option)
      }
    }

    return [
      { value: '', label: t('options.no_sensor'), searchText: t('options.no_sensor') },
      ...(regularEntries.length > 0
        ? [
            {
              value: '__group_sensors__',
              label: t('options.category_sensors'),
              searchText: t('options.category_sensors'),
              disabled: true,
              className: 'font-semibold text-muted-foreground',
            },
            ...regularEntries,
          ]
        : []),
      ...(standardEntries.length > 0
        ? [
            {
              value: '__group_standard_sensors__',
              label: t('options.category_standard_sensors'),
              searchText: t('options.category_standard_sensors'),
              disabled: true,
              className: 'font-semibold text-muted-foreground',
            },
            ...standardEntries,
          ]
        : []),
    ]
  }, [availableSensors, standardSerialSet, t])

  return (
    <div className="border p-4 rounded-lg space-y-4 mt-6">
      <h3 className="font-semibold">{t('sections.sensor')}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('labels.sensor_select')}</Label>
          <Controller
            control={control}
            name="Sonde_Numero_Serie"
            render={({ field }) => (
              <Combobox
                triggerId="sonde"
                value={field.value || ''}
                onValueChange={(val) => field.onChange(val || null)}
                placeholder={t('placeholders.sensor')}
                searchPlaceholder={t('placeholders.sensor_search')}
                emptyMessage={t('placeholders.sensor_empty')}
                options={sensorOptions}
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('labels.module_select')}</Label>
          <Controller
            control={control}
            name="Id_Module"
            render={({ field }) => (
              <Combobox
                triggerId="module"
                value={field.value ? field.value.toString() : ''}
                onValueChange={(val) => field.onChange(val ? parseInt(val, 10) : null)}
                placeholder={t('placeholders.module')}
                searchPlaceholder={t('placeholders.module_search')}
                emptyMessage={t('placeholders.module_empty')}
                disabled={!hasSondeSelected}
                options={[
                  { value: '', label: t('options.no_module'), searchText: t('options.no_module') },
                  ...modules.map((module) => ({
                    value: module.Id_Module.toString(),
                    label: module.Module_Numero_Serie || module.Port_Serie || `Module #${module.Id_Module}`,
                    searchText: `${module.Module_Numero_Serie || ''} ${module.Port_Serie || ''} ${module.Id_Module}`,
                  })),
                ]}
              />
            )}
          />
        </div>
      </div>
    </div>
  )
}
