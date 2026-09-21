'use client'

import { CircleHelp, Clock3, Gauge, ShieldAlert } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import { useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { fetchJson } from '@/lib/http'
import { computeEmt } from '@/lib/emt'
import { formatNumber } from '@/lib/number-display'
import type { SensorValueRange } from '@/lib/sensor-value-range-contract'
import { cn } from '@/lib/utils'

import type { LocationFormData } from '../location-form-types'
import { LocationAlarmPreview } from './location-alarm-preview'
import { toOptionalNonNegativeInteger, toOptionalNumber } from './location-form-parsers'

type PlanningRegleLite = { Id_Regle: number }

function HelpLabel({
  label,
  help,
}: {
  label: string
  help: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Label className="cursor-help border-b border-dotted border-muted-foreground/70">
        {label}
      </Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex h-4 w-4 cursor-help items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label={label}
          >
            <CircleHelp className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{help}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

function ReadonlyValue({
  label,
  value,
  help,
  className,
}: {
  label: string
  value: string
  help: string
  className?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="min-w-0 cursor-help">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className={cn('mt-1 truncate border-b border-dotted border-current text-sm font-semibold tabular-nums', className)}>
            {value}
          </p>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p>{help}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export function LocationSetpointsSection({
  isGsoSensor,
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
  const locale = useLocale()
  const localeTag = locale === 'fr' ? 'fr-FR' : locale
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

  const formatValue = (value: number | null | undefined) => {
    const formatted = formatNumber(value, {
      minimumDecimals: 0,
      maximumDecimals: 3,
      locale: localeTag,
      grouping: false,
      fallback: '-',
    })
    const unit = sensorRange?.unit?.trim()
    return unit && formatted !== '-' ? `${formatted} ${unit}` : formatted
  }

  const formatRange = () => {
    if (!sensorRange || (sensorRange.min == null && sensorRange.max == null)) return null
    if (sensorRange.min != null && sensorRange.max != null) {
      return `${formatNumber(sensorRange.min, { maximumDecimals: 3, locale: localeTag })} – ${formatNumber(sensorRange.max, { maximumDecimals: 3, locale: localeTag })}${sensorRange.unit ? ` ${sensorRange.unit}` : ''}`
    }
    if (sensorRange.min != null) {
      return `≥ ${formatNumber(sensorRange.min, { maximumDecimals: 3, locale: localeTag })}${sensorRange.unit ? ` ${sensorRange.unit}` : ''}`
    }
    return `≤ ${formatNumber(sensorRange.max, { maximumDecimals: 3, locale: localeTag })}${sensorRange.unit ? ` ${sensorRange.unit}` : ''}`
  }

  const liveEmt = computeEmt({
    mode: formData.EMT_Mode,
    emtValue: formData.EMT_Valeur ?? null,
    consigne: formData.Consigne ?? null,
    consigneSup: formData.Consigne_Sup ?? null,
    consigneInf: formData.Consigne_Inf ?? null,
    isConsigneSupActive: formData.Est_Consigne_Sup_Active ?? false,
    isConsigneInfActive: formData.Est_Consigne_Inf_Active ?? false,
    incertitude: formData.Incertitude ?? null,
    erreurJustesse: formData.Erreur_Justesse ?? null,
    derive: formData.Derive ?? null,
    includeDeriveInUncertainty:
      formData.EMT_Mode === 'quart' || formData.EMT_Mode === 'manuel'
        ? true
        : (formData.Prendre_En_Compte_Derive ?? false),
    correctAccuracyError: formData.Corriger_Erreur_Justesse ?? false,
  })
  const effectiveHigh = formData.Est_Consigne_Sup_Active
    ? (liveEmt.toleranceSup ?? formData.Tolerance_Surveillance_Sup ?? formData.Consigne_Sup ?? null)
    : null
  const effectiveLow = formData.Est_Consigne_Inf_Active
    ? (liveEmt.toleranceInf ?? formData.Tolerance_Surveillance_Inf ?? formData.Consigne_Inf ?? null)
    : null

  return (
    <TooltipProvider delayDuration={120}>
      <div className="mt-6 space-y-5">
        <section className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-start gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock3 className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-semibold">{t('sections.timing')}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{t('timing.description')}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <HelpLabel label={t('labels.frequency')} help={isGsoSensor ? t('tooltips.frequency_gso') : t('tooltips.frequency')} />
              <Input
                type="number"
                min={1}
                step="any"
                {...register('Frequence', { setValueAs: toOptionalNumber })}
                placeholder={t('placeholders.frequency')}
                disabled={isGsoSensor}
                className={isGsoSensor ? 'bg-muted' : ''}
              />
            </div>

            <div className="space-y-2">
              <HelpLabel label={t('labels.retrigger_delay_measures')} help={t('tooltips.retrigger_delay_measures')} />
              <Input
                type="number"
                min={0}
                step="1"
                {...register('Nb_Mesures_Temporisation_Redeclenchement', {
                  setValueAs: toOptionalNonNegativeInteger,
                })}
                placeholder={t('placeholders.retrigger_delay_measures')}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-300">
                <Gauge className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-semibold">{t('sections.setpoints')}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{t('setpoints.description')}</p>
              </div>
            </div>
            {sensorRange && (sensorRange.min != null || sensorRange.max != null) ? (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-900 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-100">
                {t('sensor_range', { range: formatRange() ?? '-' })}
              </span>
            ) : null}
          </div>

          {planningLocked ? (
            <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-100">
              <p className="font-medium">{t('planning_lock.title')}</p>
              <p className="mt-1">{t('planning_lock.description')}</p>
              <Button type="button" variant="outline" size="sm" className="mt-3" onClick={onGoToPlanning}>
                {t('planning_lock.go_to_planning')}
              </Button>
            </div>
          ) : null}

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)]">
            <div className="space-y-4">
              <div className="rounded-xl border bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{t('labels.setpoint')}</p>
                    <p className="text-xs text-muted-foreground">{t('setpoints.target_hint')}</p>
                  </div>
                  <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                </div>
                {planningLocked ? (
                  <div className="mt-3">
                    <ReadonlyValue
                      label={t('labels.setpoint')}
                      value={formatValue(formData.Consigne)}
                      help={t('tooltips.setpoint')}
                    />
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    <HelpLabel label={t('labels.setpoint')} help={t('tooltips.setpoint')} />
                    <Input
                      type="number"
                      step="any"
                      {...register('Consigne', { setValueAs: toOptionalNumber })}
                      placeholder={t('placeholders.numeric')}
                      aria-invalid={!!errors.Consigne}
                    />
                    {errors.Consigne?.message ? (
                      <p className="text-sm text-destructive">{String(errors.Consigne.message)}</p>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-orange-200/70 bg-orange-50/30 p-4 dark:border-orange-500/20 dark:bg-orange-500/5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{t('setpoints.upper_title')}</p>
                      <p className="text-xs text-muted-foreground">{t('setpoints.upper_hint')}</p>
                    </div>
                    {!planningLocked ? (
                      <Checkbox
                        checked={formData.Est_Consigne_Sup_Active || false}
                        onCheckedChange={(checked) =>
                          setValue('Est_Consigne_Sup_Active', !!checked, { shouldDirty: true, shouldTouch: true })
                        }
                        aria-label={t('labels.upper_enable')}
                      />
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">
                        {formData.Est_Consigne_Sup_Active ? t('labels.enabled') : t('labels.disabled')}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 space-y-4">
                    {planningLocked ? (
                      <div className="grid grid-cols-2 gap-3">
                        <ReadonlyValue
                          label={t('labels.upper_max')}
                          value={formatValue(formData.Consigne_Sup)}
                          help={t('tooltips.upper_alarm')}
                        />
                        <ReadonlyValue
                          label={t('labels.effective_threshold')}
                          value={formatValue(effectiveHigh)}
                          help={t('tooltips.effective_threshold')}
                          className="text-orange-700 dark:text-orange-300"
                        />
                        <ReadonlyValue
                          label={t('labels.upper_pre_label')}
                          value={formData.Est_Consigne_Sup_Pre_Alarme_Active ? formatValue(formData.Consigne_Sup_Pre_Alarme) : '-'}
                          help={t('tooltips.prealarm')}
                        />
                        {formData.Est_Consigne_Sup_Active ? (
                          <div className="col-span-2 space-y-2">
                            <HelpLabel label={t('labels.alarm_delay_high')} help={t('tooltips.alarm_delay_high')} />
                            <Input
                              type="number"
                              min={1}
                              step="1"
                              {...register('Retard_Alarme_Haut', { setValueAs: toOptionalNumber })}
                              placeholder={t('placeholders.delay')}
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : formData.Est_Consigne_Sup_Active ? (
                      <>
                        <div className="space-y-2">
                          <HelpLabel label={t('labels.upper_max')} help={t('tooltips.upper_alarm')} />
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
                          <ReadonlyValue
                            label={t('labels.effective_threshold')}
                            value={formatValue(effectiveHigh)}
                            help={t('tooltips.effective_threshold')}
                            className="text-orange-700 dark:text-orange-300"
                          />
                          <div className="space-y-2 pt-1">
                            <HelpLabel label={t('labels.alarm_delay_high')} help={t('tooltips.alarm_delay_high')} />
                            <Input
                              type="number"
                              min={1}
                              step="1"
                              {...register('Retard_Alarme_Haut', { setValueAs: toOptionalNumber })}
                              placeholder={t('placeholders.delay')}
                            />
                          </div>
                        </div>

                        <div className="space-y-2 rounded-lg border bg-background/70 p-3">
                          <label className="flex cursor-pointer items-center gap-2">
                            <Checkbox
                              checked={formData.Est_Consigne_Sup_Pre_Alarme_Active || false}
                              onCheckedChange={(checked) =>
                                setValue('Est_Consigne_Sup_Pre_Alarme_Active', !!checked, { shouldDirty: true, shouldTouch: true })
                              }
                            />
                            <span className="text-sm font-medium">{t('labels.upper_pre_enable')}</span>
                          </label>
                          {formData.Est_Consigne_Sup_Pre_Alarme_Active ? (
                            <>
                              <Input
                                type="number"
                                step="any"
                                {...register('Consigne_Sup_Pre_Alarme', { setValueAs: toOptionalNumber })}
                                placeholder={t('placeholders.numeric')}
                                aria-invalid={!!errors.Consigne_Sup_Pre_Alarme}
                              />
                              {errors.Consigne_Sup_Pre_Alarme?.message ? (
                                <p className="text-sm text-destructive">{String(errors.Consigne_Sup_Pre_Alarme.message)}</p>
                              ) : null}
                            </>
                          ) : null}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t('setpoints.normal_disabled')}</p>
                    )}

                    <div className="space-y-2 rounded-lg border border-red-200 bg-red-50/50 p-3 dark:border-red-500/30 dark:bg-red-500/10">
                      <label className="flex cursor-pointer items-start gap-2">
                        <Checkbox
                          checked={formData.Est_Seuil_Critique_Haut_Active || false}
                          onCheckedChange={(checked) =>
                            setValue('Est_Seuil_Critique_Haut_Active', !!checked, { shouldDirty: true, shouldTouch: true })
                          }
                        />
                        <span>
                          <span className="block text-sm font-semibold text-red-800 dark:text-red-200">{t('labels.critical_high_enable')}</span>
                          <span className="block text-xs text-muted-foreground">{t('setpoints.critical_hint')}</span>
                        </span>
                      </label>
                      {formData.Est_Seuil_Critique_Haut_Active ? (
                        <>
                          <Input
                            type="number"
                            step="any"
                            {...register('Seuil_Critique_Haut', { setValueAs: toOptionalNumber })}
                            placeholder={t('placeholders.numeric')}
                            aria-invalid={!!errors.Seuil_Critique_Haut}
                          />
                          {errors.Seuil_Critique_Haut?.message ? (
                            <p className="text-sm text-destructive">{String(errors.Seuil_Critique_Haut.message)}</p>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-sky-200/70 bg-sky-50/30 p-4 dark:border-sky-500/20 dark:bg-sky-500/5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{t('setpoints.lower_title')}</p>
                      <p className="text-xs text-muted-foreground">{t('setpoints.lower_hint')}</p>
                    </div>
                    {!planningLocked ? (
                      <Checkbox
                        checked={formData.Est_Consigne_Inf_Active || false}
                        onCheckedChange={(checked) =>
                          setValue('Est_Consigne_Inf_Active', !!checked, { shouldDirty: true, shouldTouch: true })
                        }
                        aria-label={t('labels.lower_enable')}
                      />
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">
                        {formData.Est_Consigne_Inf_Active ? t('labels.enabled') : t('labels.disabled')}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 space-y-4">
                    {planningLocked ? (
                      <div className="grid grid-cols-2 gap-3">
                        <ReadonlyValue
                          label={t('labels.lower_min')}
                          value={formatValue(formData.Consigne_Inf)}
                          help={t('tooltips.lower_alarm')}
                        />
                        <ReadonlyValue
                          label={t('labels.effective_threshold')}
                          value={formatValue(effectiveLow)}
                          help={t('tooltips.effective_threshold')}
                          className="text-sky-700 dark:text-sky-300"
                        />
                        <ReadonlyValue
                          label={t('labels.lower_pre_label')}
                          value={formData.Est_Consigne_Inf_Pre_Alarme_Active ? formatValue(formData.Consigne_Inf_Pre_Alarme) : '-'}
                          help={t('tooltips.prealarm')}
                        />
                        {formData.Est_Consigne_Inf_Active ? (
                          <div className="col-span-2 space-y-2">
                            <HelpLabel label={t('labels.alarm_delay_low')} help={t('tooltips.alarm_delay_low')} />
                            <Input
                              type="number"
                              min={1}
                              step="1"
                              {...register('Retard_Alarme_Bas', { setValueAs: toOptionalNumber })}
                              placeholder={t('placeholders.delay')}
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : formData.Est_Consigne_Inf_Active ? (
                      <>
                        <div className="space-y-2">
                          <HelpLabel label={t('labels.lower_min')} help={t('tooltips.lower_alarm')} />
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
                          <ReadonlyValue
                            label={t('labels.effective_threshold')}
                            value={formatValue(effectiveLow)}
                            help={t('tooltips.effective_threshold')}
                            className="text-sky-700 dark:text-sky-300"
                          />
                          <div className="space-y-2 pt-1">
                            <HelpLabel label={t('labels.alarm_delay_low')} help={t('tooltips.alarm_delay_low')} />
                            <Input
                              type="number"
                              min={1}
                              step="1"
                              {...register('Retard_Alarme_Bas', { setValueAs: toOptionalNumber })}
                              placeholder={t('placeholders.delay')}
                            />
                          </div>
                        </div>

                        <div className="space-y-2 rounded-lg border bg-background/70 p-3">
                          <label className="flex cursor-pointer items-center gap-2">
                            <Checkbox
                              checked={formData.Est_Consigne_Inf_Pre_Alarme_Active || false}
                              onCheckedChange={(checked) =>
                                setValue('Est_Consigne_Inf_Pre_Alarme_Active', !!checked, { shouldDirty: true, shouldTouch: true })
                              }
                            />
                            <span className="text-sm font-medium">{t('labels.lower_pre_enable')}</span>
                          </label>
                          {formData.Est_Consigne_Inf_Pre_Alarme_Active ? (
                            <>
                              <Input
                                type="number"
                                step="any"
                                {...register('Consigne_Inf_Pre_Alarme', { setValueAs: toOptionalNumber })}
                                placeholder={t('placeholders.numeric')}
                                aria-invalid={!!errors.Consigne_Inf_Pre_Alarme}
                              />
                              {errors.Consigne_Inf_Pre_Alarme?.message ? (
                                <p className="text-sm text-destructive">{String(errors.Consigne_Inf_Pre_Alarme.message)}</p>
                              ) : null}
                            </>
                          ) : null}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t('setpoints.normal_disabled')}</p>
                    )}

                    <div className="space-y-2 rounded-lg border border-red-200 bg-red-50/50 p-3 dark:border-red-500/30 dark:bg-red-500/10">
                      <label className="flex cursor-pointer items-start gap-2">
                        <Checkbox
                          checked={formData.Est_Seuil_Critique_Bas_Active || false}
                          onCheckedChange={(checked) =>
                            setValue('Est_Seuil_Critique_Bas_Active', !!checked, { shouldDirty: true, shouldTouch: true })
                          }
                        />
                        <span>
                          <span className="block text-sm font-semibold text-red-800 dark:text-red-200">{t('labels.critical_low_enable')}</span>
                          <span className="block text-xs text-muted-foreground">{t('setpoints.critical_hint')}</span>
                        </span>
                      </label>
                      {formData.Est_Seuil_Critique_Bas_Active ? (
                        <>
                          <Input
                            type="number"
                            step="any"
                            {...register('Seuil_Critique_Bas', { setValueAs: toOptionalNumber })}
                            placeholder={t('placeholders.numeric')}
                            aria-invalid={!!errors.Seuil_Critique_Bas}
                          />
                          {errors.Seuil_Critique_Bas?.message ? (
                            <p className="text-sm text-destructive">{String(errors.Seuil_Critique_Bas.message)}</p>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <LocationAlarmPreview sensorRange={sensorRange} />
          </div>
        </section>
      </div>
    </TooltipProvider>
  )
}
