'use client'

import { useEffect, useMemo } from 'react'

import type { AvailableSensor } from '@/hooks/useAvailableSensors'
import type { Group } from '@/hooks/useGroups'
import type { SiteSimple } from '@/hooks/useSites'
import { MultiSelectFilter } from '@/components/multi-select-filter'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TabsContent } from '@/components/ui/tabs'
import { Combobox } from '@/components/ui/combobox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslations } from 'next-intl'

import type { LocationFormData } from './location-form-types'

type Props = {
  sites: SiteSimple[]
  groups: Group[]
  availableSensors: AvailableSensor[]
}

export function LocationFormTabGeneral({ sites, groups, availableSensors }: Props) {
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
    () => (availableSensors ?? []).find((sensor) => sensor.Sonde_Numero_Serie === formData.Sonde_Numero_Serie),
    [availableSensors, formData.Sonde_Numero_Serie],
  )
  const isGsoSensor = selectedSensor?.Sonde_Type?.toUpperCase() === 'GSO'

  useEffect(() => {
    if (!isGsoSensor) return
    setValue('Frequence', 15)
  }, [isGsoSensor, setValue])

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
          <Input
            {...register('Commentaire')}
            placeholder={t('placeholders.comment')}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('labels.monitoring')}</Label>
          <Controller
            control={control}
            name="Lieu_Etat"
            render={({ field }) => (
              <RadioGroup
                value={field.value || 'S'}
                onValueChange={field.onChange}
                className="grid gap-2"
              >
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('labels.site')}</Label>
          <Controller
            control={control}
            name="Id_Site"
            render={({ field }) => (
              <Combobox
                triggerId="site"
                value={field.value ? field.value.toString() : ''}
                onValueChange={(val) => field.onChange(val ? parseInt(val) : null)}
                placeholder={t('placeholders.site')}
                searchPlaceholder={t('placeholders.site_search')}
                emptyMessage={t('placeholders.site_empty')}
                options={(sites ?? []).map((site) => ({
                  value: site.id.toString(),
                  label: site.name,
                  searchText: site.name,
                }))}
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('labels.groups')}</Label>
          <Controller
            control={control}
            name="GroupIds"
            render={({ field }) => (
              <MultiSelectFilter
                label={t('labels.groups')}
                options={(groups || []).map((g) => ({
                  id: g.Id_Groupe,
                  label: g.Nom_Groupe || t('group_fallback', { id: g.Id_Groupe }),
                }))}
                selectedIds={field.value || []}
                onChange={(selectedIds) =>
                  field.onChange(selectedIds.map((v) => Number(v)).filter((v) => !Number.isNaN(v)))
                }
                placeholder={t('placeholders.groups')}
                tone="default"
                enableSearch
                searchPlaceholder={t('placeholders.groups_search')}
              />
            )}
          />
        </div>
      </div>

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
                    ...(availableSensors ?? []).map((sensor) => ({
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
            <Label>{t('labels.sensor_state')}</Label>
            <Input disabled placeholder={t('placeholders.auto')} className="bg-muted" />
          </div>
        </div>
      </div>

      <div className="border p-4 rounded-lg space-y-4 mt-6">
        <h3 className="font-semibold">{t('sections.setpoints')}</h3>
        <div className="space-y-4 flex flex-col">
          <div className="space-y-3 pb-3 border-b order-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('labels.setpoint')}</Label>
                <Input
                  type="number"
                  {...register('Consigne', {
                    setValueAs: (value) => (value === '' || Number.isNaN(Number(value)) ? undefined : Number(value)),
                  })}
                  placeholder={t('placeholders.numeric')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('labels.frequency')}</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={isGsoSensor ? 'cursor-not-allowed' : ''}>
                        <Input
                          type="number"
                          {...register('Frequence', {
                            setValueAs: (value) =>
                              value === '' || Number.isNaN(Number(value)) ? undefined : Number(value),
                          })}
                          placeholder={t('placeholders.frequency')}
                          disabled={isGsoSensor}
                          className={isGsoSensor ? 'bg-muted' : ''}
                        />
                      </div>
                    </TooltipTrigger>
                    {isGsoSensor ? (
                      <TooltipContent>
                        <p>{t('tooltips.frequency_gso')}</p>
                      </TooltipContent>
                    ) : null}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          <div className="space-y-3 order-1">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.Est_Consigne_Sup_Active || false}
                onCheckedChange={(checked) => setValue('Est_Consigne_Sup_Active', !!checked)}
              />
              <Label className="font-medium">{t('labels.upper_enable')}</Label>
            </div>
            {formData.Est_Consigne_Sup_Active && (
              <div className="space-y-3 pl-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('labels.upper_max')}</Label>
                    <Input
                      type="number"
                      {...register('Consigne_Sup', {
                        setValueAs: (value) =>
                          value === '' || Number.isNaN(Number(value)) ? undefined : Number(value),
                      })}
                      placeholder={t('placeholders.numeric')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('labels.alarm_delay_minutes')}</Label>
                    <Input
                      type="number"
                      {...register('Retard_Alarme_Haut', {
                        setValueAs: (value) =>
                          value === '' || Number.isNaN(Number(value)) ? undefined : Number(value),
                      })}
                      placeholder={t('placeholders.delay')}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.Est_Consigne_Sup_Pre_Alarme_Active || false}
                    onCheckedChange={(checked) => setValue('Est_Consigne_Sup_Pre_Alarme_Active', !!checked)}
                  />
                  <Label>{t('labels.upper_pre_enable')}</Label>
                </div>
                {formData.Est_Consigne_Sup_Pre_Alarme_Active && (
                  <div className="space-y-2 pl-6">
                    <Label>{t('labels.upper_pre_label')}</Label>
                    <Input
                      type="number"
                      {...register('Consigne_Sup_Pre_Alarme', {
                        setValueAs: (value) =>
                          value === '' || Number.isNaN(Number(value)) ? undefined : Number(value),
                      })}
                      placeholder={t('placeholders.numeric')}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3 order-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.Est_Consigne_Inf_Active || false}
                onCheckedChange={(checked) => setValue('Est_Consigne_Inf_Active', !!checked)}
              />
              <Label className="font-medium">{t('labels.lower_enable')}</Label>
            </div>
            {formData.Est_Consigne_Inf_Active && (
              <div className="space-y-3 pl-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('labels.lower_min')}</Label>
                    <Input
                      type="number"
                      {...register('Consigne_Inf', {
                        setValueAs: (value) =>
                          value === '' || Number.isNaN(Number(value)) ? undefined : Number(value),
                      })}
                      placeholder={t('placeholders.numeric')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('labels.alarm_delay_minutes')}</Label>
                    <Input
                      type="number"
                      {...register('Retard_Alarme_Bas', {
                        setValueAs: (value) =>
                          value === '' || Number.isNaN(Number(value)) ? undefined : Number(value),
                      })}
                      placeholder={t('placeholders.delay')}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.Est_Consigne_Inf_Pre_Alarme_Active || false}
                    onCheckedChange={(checked) => setValue('Est_Consigne_Inf_Pre_Alarme_Active', !!checked)}
                  />
                  <Label>{t('labels.lower_pre_enable')}</Label>
                </div>
                {formData.Est_Consigne_Inf_Pre_Alarme_Active && (
                  <div className="space-y-2 pl-6">
                    <Label>{t('labels.lower_pre_label')}</Label>
                    <Input
                      type="number"
                      {...register('Consigne_Inf_Pre_Alarme', {
                        setValueAs: (value) =>
                          value === '' || Number.isNaN(Number(value)) ? undefined : Number(value),
                      })}
                      placeholder={t('placeholders.numeric')}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </TabsContent>
  )
}



