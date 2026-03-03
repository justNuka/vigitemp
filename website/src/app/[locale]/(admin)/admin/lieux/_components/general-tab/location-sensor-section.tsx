'use client'

import { Combobox } from '@/components/ui/combobox'
import { Label } from '@/components/ui/label'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslations } from 'next-intl'

import type { AvailableSensor } from '@/hooks/useAvailableSensors'
import type { Module } from '@/hooks/useModules'

import type { LocationFormData } from '../location-form-types'

export function LocationSensorSection({
  availableSensors,
  modules,
  hasSondeSelected,
}: {
  availableSensors: AvailableSensor[]
  modules: Module[]
  hasSondeSelected: boolean
}) {
  const t = useTranslations('locationsForm.general')
  const { control } = useFormContext<LocationFormData>()

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
                options={[
                  { value: '', label: t('options.no_sensor'), searchText: t('options.no_sensor') },
                  ...availableSensors.map((sensor) => ({
                    value: sensor.Sonde_Numero_Serie || '',
                    label: sensor.Sonde_Numero_Serie || '',
                    searchText: sensor.Sonde_Numero_Serie || '',
                  })),
                ]}
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
