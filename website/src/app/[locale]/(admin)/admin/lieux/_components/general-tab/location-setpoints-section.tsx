'use client'

import { useQuery } from '@tanstack/react-query'
import { useFormContext } from 'react-hook-form'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fetchJson } from '@/lib/http'
import type { SensorValueRange } from '@/lib/sensor-value-range-contract'

import type { LocationFormData } from '../location-form-types'
import { toOptionalNumber } from './location-form-parsers'

type PlanningRegleLite = { Id_Regle: number }

function ReadOnlyValue({
  label,
  value,
}: {
  label: string
  value: number | string | null | undefined
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value ?? '—'}</p>
    </div>
  )
}

export function LocationSetpointsSection({
  idLieu,
  onGoToPlanning,
  sensorRange,
}: {
  isGsoSensor: boolean
  idLieu: number | null
  onGoToPlanning?: () => void
  sensorRange?: SensorValueRange | null
}) {
  const t = useTranslations('locationsForm.general')
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<LocationFormData>()
  const formData = watch()

  const { data: planningRegles = [] } = useQuery<PlanningRegleLite[]>({
    queryKey: ['planning-regles-lock', idLieu],
    queryFn: () => fetchJson<PlanningRegleLite[]>(`/api/lieux/${idLieu}/planning`),
    enabled: !!idLieu,
    staleTime: 30_000,
  })
  const planningLocked = planningRegles.length > 0

  const sensorRangeLabel =
    sensorRange && (sensorRange.min != null || sensorRange.max != null)
      ? sensorRange.min != null && sensorRange.max != null
        ? `${sensorRange.min} – ${sensorRange.max}${sensorRange.unit ? ` ${sensorRange.unit}` : ''}`
        : sensorRange.min != null
          ? `≥ ${sensorRange.min}${sensorRange.unit ? ` ${sensorRange.unit}` : ''}`
          : `≤ ${sensorRange.max}${sensorRange.unit ? ` ${sensorRange.unit}` : ''}`
      : null

  return (
    <div className="mt-6 space-y-5 rounded-lg border p-4">
      <div>
        <h3 className="font-semibold">{t('sections.setpoints')}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{t('setpoints_description')}</p>
      </div>

      {sensorRangeLabel ? (
        <div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-2 text-sm text-sky-900 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-100">
          {t('sensor_range', { range: sensorRangeLabel })}
        </div>
      ) : null}

      {planningLocked ? (
        <div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-100">
          <p className="font-medium">{t('planning_lock.title')}</p>
          <p className="mt-1">{t('planning_lock.description')}</p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={onGoToPlanning}>
            {t('planning_lock.go_to_planning')}
          </Button>
        </div>
      ) : null}

      <div className="rounded-lg border bg-muted/20 p-4">
        <div className="mx-auto max-w-sm space-y-2">
          <Label className="font-medium">{t('labels.setpoint')}</Label>
          {planningLocked ? (
            <div className="rounded-md border bg-background px-3 py-2 text-center text-lg font-semibold">
              {formData.Consigne ?? '—'}
            </div>
          ) : (
            <>
              <Input
                type="number"
                step="any"
                {...register('Consigne', { setValueAs: toOptionalNumber })}
                placeholder={t('placeholders.numeric')}
                aria-invalid={!!errors.Consigne}
                className="text-center text-base font-medium"
              />
              {errors.Consigne?.message ? (
                <p className="text-sm text-destructive">{String(errors.Consigne.message)}</p>
              ) : null}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="space-y-4 rounded-lg border bg-muted/10 p-4">
          <div className="flex items-center gap-2">
            {planningLocked ? (
              <span className="text-sm font-semibold">{t('labels.lower_threshold')}</span>
            ) : (
              <>
                <Checkbox
                  checked={formData.Est_Consigne_Inf_Active || false}
                  onCheckedChange={(checked) =>
                    setValue('Est_Consigne_Inf_Active', !!checked, {
                      shouldDirty: true,
                      shouldTouch: true,
                    })
                  }
                />
                <Label className="font-semibold">{t('labels.lower_enable')}</Label>
              </>
            )}
          </div>

          {planningLocked ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <ReadOnlyValue
                label={t('labels.lower_min')}
                value={formData.Est_Consigne_Inf_Active ? formData.Consigne_Inf : null}
              />
              <ReadOnlyValue
                label={t('labels.lower_pre_label')}
                value={
                  formData.Est_Consigne_Inf_Pre_Alarme_Active
                    ? formData.Consigne_Inf_Pre_Alarme
                    : null
                }
              />
              <div className="col-span-2 space-y-2">
                <Label>{t('labels.alarm_delay_minutes')}</Label>
                <Input
                  type="number"
                  min={1}
                  step="any"
                  {...register('Retard_Alarme_Bas', { setValueAs: toOptionalNumber })}
                  placeholder={t('placeholders.delay')}
                />
              </div>
            </div>
          ) : formData.Est_Consigne_Inf_Active ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('labels.lower_min')}</Label>
                  <Input
                    type="number"
                    step="any"
                    {...register('Consigne_Inf', { setValueAs: toOptionalNumber })}
                    placeholder={t('placeholders.numeric')}
                    aria-invalid={!!errors.Consigne_Inf}
                  />
                  {errors.Consigne_Inf?.message ? (
                    <p className="text-sm text-destructive">{String(errors.Consigne_Inf.message)}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>{t('labels.alarm_delay_minutes')}</Label>
                  <Input
                    type="number"
                    min={1}
                    step="any"
                    {...register('Retard_Alarme_Bas', { setValueAs: toOptionalNumber })}
                    placeholder={t('placeholders.delay')}
                  />
                </div>
              </div>

              <div className="rounded-md border bg-background/60 p-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.Est_Consigne_Inf_Pre_Alarme_Active || false}
                    onCheckedChange={(checked) =>
                      setValue('Est_Consigne_Inf_Pre_Alarme_Active', !!checked, {
                        shouldDirty: true,
                        shouldTouch: true,
                      })
                    }
                  />
                  <Label>{t('labels.lower_pre_enable')}</Label>
                </div>
                {formData.Est_Consigne_Inf_Pre_Alarme_Active ? (
                  <div className="mt-3 space-y-2">
                    <Label>{t('labels.lower_pre_label')}</Label>
                    <Input
                      type="number"
                      step="any"
                      {...register('Consigne_Inf_Pre_Alarme', { setValueAs: toOptionalNumber })}
                      placeholder={t('placeholders.numeric')}
                      aria-invalid={!!errors.Consigne_Inf_Pre_Alarme}
                    />
                    {errors.Consigne_Inf_Pre_Alarme?.message ? (
                      <p className="text-sm text-destructive">
                        {String(errors.Consigne_Inf_Pre_Alarme.message)}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t('threshold_disabled_hint')}</p>
          )}
        </div>

        <div className="space-y-4 rounded-lg border bg-muted/10 p-4">
          <div className="flex items-center gap-2">
            {planningLocked ? (
              <span className="text-sm font-semibold">{t('labels.upper_threshold')}</span>
            ) : (
              <>
                <Checkbox
                  checked={formData.Est_Consigne_Sup_Active || false}
                  onCheckedChange={(checked) =>
                    setValue('Est_Consigne_Sup_Active', !!checked, {
                      shouldDirty: true,
                      shouldTouch: true,
                    })
                  }
                />
                <Label className="font-semibold">{t('labels.upper_enable')}</Label>
              </>
            )}
          </div>

          {planningLocked ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <ReadOnlyValue
                label={t('labels.upper_max')}
                value={formData.Est_Consigne_Sup_Active ? formData.Consigne_Sup : null}
              />
              <ReadOnlyValue
                label={t('labels.upper_pre_label')}
                value={
                  formData.Est_Consigne_Sup_Pre_Alarme_Active
                    ? formData.Consigne_Sup_Pre_Alarme
                    : null
                }
              />
              <div className="col-span-2 space-y-2">
                <Label>{t('labels.alarm_delay_minutes')}</Label>
                <Input
                  type="number"
                  min={1}
                  step="any"
                  {...register('Retard_Alarme_Haut', { setValueAs: toOptionalNumber })}
                  placeholder={t('placeholders.delay')}
                />
              </div>
            </div>
          ) : formData.Est_Consigne_Sup_Active ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('labels.upper_max')}</Label>
                  <Input
                    type="number"
                    step="any"
                    {...register('Consigne_Sup', { setValueAs: toOptionalNumber })}
                    placeholder={t('placeholders.numeric')}
                    aria-invalid={!!errors.Consigne_Sup}
                  />
                  {errors.Consigne_Sup?.message ? (
                    <p className="text-sm text-destructive">{String(errors.Consigne_Sup.message)}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>{t('labels.alarm_delay_minutes')}</Label>
                  <Input
                    type="number"
                    min={1}
                    step="any"
                    {...register('Retard_Alarme_Haut', { setValueAs: toOptionalNumber })}
                    placeholder={t('placeholders.delay')}
                  />
                </div>
              </div>

              <div className="rounded-md border bg-background/60 p-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.Est_Consigne_Sup_Pre_Alarme_Active || false}
                    onCheckedChange={(checked) =>
                      setValue('Est_Consigne_Sup_Pre_Alarme_Active', !!checked, {
                        shouldDirty: true,
                        shouldTouch: true,
                      })
                    }
                  />
                  <Label>{t('labels.upper_pre_enable')}</Label>
                </div>
                {formData.Est_Consigne_Sup_Pre_Alarme_Active ? (
                  <div className="mt-3 space-y-2">
                    <Label>{t('labels.upper_pre_label')}</Label>
                    <Input
                      type="number"
                      step="any"
                      {...register('Consigne_Sup_Pre_Alarme', { setValueAs: toOptionalNumber })}
                      placeholder={t('placeholders.numeric')}
                      aria-invalid={!!errors.Consigne_Sup_Pre_Alarme}
                    />
                    {errors.Consigne_Sup_Pre_Alarme?.message ? (
                      <p className="text-sm text-destructive">
                        {String(errors.Consigne_Sup_Pre_Alarme.message)}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t('threshold_disabled_hint')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
