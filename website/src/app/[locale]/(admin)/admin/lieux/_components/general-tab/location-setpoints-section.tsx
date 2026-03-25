'use client'

import { CircleHelp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useFormContext } from 'react-hook-form'
import { useTranslations } from 'next-intl'

import { fetchJson } from '@/lib/http'

import type { LocationFormData } from '../location-form-types'
import { toOptionalNonNegativeInteger, toOptionalNumber } from './location-form-parsers'

type PlanningRegleLite = { Id_Regle: number }

export function LocationSetpointsSection({ isGsoSensor, idLieu, onGoToPlanning }: { isGsoSensor: boolean; idLieu: number | null; onGoToPlanning?: () => void }) {
  const t = useTranslations('locationsForm.general')
  const { register, watch, setValue } = useFormContext<LocationFormData>()
  const formData = watch()

  const { data: planningRegles = [] } = useQuery<PlanningRegleLite[]>({
    queryKey: ['planning-regles-lock', idLieu],
    queryFn: () => fetchJson<PlanningRegleLite[]>(`/api/lieux/${idLieu}/planning`),
    enabled: !!idLieu,
    staleTime: 30_000,
  })
  const planningLocked = planningRegles.length > 0

  return (
    <div className="border p-4 rounded-lg space-y-4 mt-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">{t('sections.setpoints')}</h3>
      </div>
      {planningLocked ? (
        <div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-100">
          <p className="font-medium">{t('planning_lock.title')}</p>
          <p className="mt-1">{t('planning_lock.description')}</p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={onGoToPlanning}>
            {t('planning_lock.go_to_planning')}
          </Button>
        </div>
      ) : null}
      {planningLocked ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-md border bg-muted/30 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">{t('labels.setpoint')}</p>
              <p className="mt-1 text-sm font-medium">{formData.Consigne ?? '?'}</p>
            </div>
            <div className="rounded-md border bg-muted/30 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">{t('labels.frequency')}</p>
              <p className="mt-1 text-sm font-medium">{formData.Frequence ?? '?'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-md border bg-muted/30 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">{t('labels.retrigger_delay_measures')}</p>
              <p className="mt-1 text-sm font-medium">{formData.Nb_Mesures_Temporisation_Redeclenchement ?? '?'}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="rounded-md border bg-muted/30 px-4 py-3 space-y-2">
              <p className="text-sm font-medium">{t('labels.upper_enable')}</p>
              <p className="text-xs text-muted-foreground">{formData.Est_Consigne_Sup_Active ? t('labels.enabled') : t('labels.disabled')}</p>
              <div className="grid grid-cols-2 gap-3 pt-1 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">{t('labels.upper_max')}</p>
                  <p className="font-medium">{formData.Consigne_Sup ?? '?'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('labels.alarm_delay_minutes')}</p>
                  <p className="font-medium">{formData.Retard_Alarme_Haut ?? '?'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('labels.upper_pre_enable')}</p>
                  <p className="font-medium">{formData.Est_Consigne_Sup_Pre_Alarme_Active ? t('labels.enabled') : t('labels.disabled')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('labels.upper_pre_label')}</p>
                  <p className="font-medium">{formData.Consigne_Sup_Pre_Alarme ?? '?'}</p>
                </div>
              </div>
            </div>
            <div className="rounded-md border bg-muted/30 px-4 py-3 space-y-2">
              <p className="text-sm font-medium">{t('labels.lower_enable')}</p>
              <p className="text-xs text-muted-foreground">{formData.Est_Consigne_Inf_Active ? t('labels.enabled') : t('labels.disabled')}</p>
              <div className="grid grid-cols-2 gap-3 pt-1 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">{t('labels.lower_min')}</p>
                  <p className="font-medium">{formData.Consigne_Inf ?? '?'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('labels.alarm_delay_minutes')}</p>
                  <p className="font-medium">{formData.Retard_Alarme_Bas ?? '?'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('labels.lower_pre_enable')}</p>
                  <p className="font-medium">{formData.Est_Consigne_Inf_Pre_Alarme_Active ? t('labels.enabled') : t('labels.disabled')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('labels.lower_pre_label')}</p>
                  <p className="font-medium">{formData.Consigne_Inf_Pre_Alarme ?? '?'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
      <fieldset className="space-y-4 flex flex-col"> 
        <div className="space-y-3 pb-3 border-b order-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('labels.setpoint')}</Label>
              <Input type="number" step="any" {...register('Consigne', { setValueAs: toOptionalNumber })} placeholder={t('placeholders.numeric')} />
            </div>
            <div className="space-y-2">
              <Label>{t('labels.frequency')}</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={isGsoSensor ? 'cursor-not-allowed' : ''}>
                      <Input
                        type="number"
                        step="any"
                        {...register('Frequence', { setValueAs: toOptionalNumber })}
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label>{t('labels.retrigger_delay_measures')}</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground"
                        aria-label={t('labels.retrigger_delay_measures')}
                      >
                        <CircleHelp className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('tooltips.retrigger_delay_measures')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                type="number"
                min={0}
                {...register('Nb_Mesures_Temporisation_Redeclenchement', { setValueAs: toOptionalNonNegativeInteger })}
                placeholder={t('placeholders.retrigger_delay_measures')}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 order-1">
          <div className="flex items-center gap-2">
            <Checkbox checked={formData.Est_Consigne_Sup_Active || false} onCheckedChange={(checked) => setValue('Est_Consigne_Sup_Active', !!checked)} />
            <Label className="font-medium">{t('labels.upper_enable')}</Label>
          </div>
          {formData.Est_Consigne_Sup_Active && (
            <div className="space-y-3 pl-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('labels.upper_max')}</Label>
                  <Input type="number" step="any" {...register('Consigne_Sup', { setValueAs: toOptionalNumber })} placeholder={t('placeholders.numeric')} />
                </div>
                <div className="space-y-2">
                  <Label>{t('labels.alarm_delay_minutes')}</Label>
                  <Input type="number" step="any" {...register('Retard_Alarme_Haut', { setValueAs: toOptionalNumber })} placeholder={t('placeholders.delay')} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={formData.Est_Consigne_Sup_Pre_Alarme_Active || false} onCheckedChange={(checked) => setValue('Est_Consigne_Sup_Pre_Alarme_Active', !!checked)} />
                <Label>{t('labels.upper_pre_enable')}</Label>
              </div>
              {formData.Est_Consigne_Sup_Pre_Alarme_Active && (
                <div className="space-y-2 pl-6">
                  <Label>{t('labels.upper_pre_label')}</Label>
                  <Input type="number" step="any" {...register('Consigne_Sup_Pre_Alarme', { setValueAs: toOptionalNumber })} placeholder={t('placeholders.numeric')} />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3 order-3">
          <div className="flex items-center gap-2">
            <Checkbox checked={formData.Est_Consigne_Inf_Active || false} onCheckedChange={(checked) => setValue('Est_Consigne_Inf_Active', !!checked)} />
            <Label className="font-medium">{t('labels.lower_enable')}</Label>
          </div>
          {formData.Est_Consigne_Inf_Active && (
            <div className="space-y-3 pl-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('labels.lower_min')}</Label>
                  <Input type="number" step="any" {...register('Consigne_Inf', { setValueAs: toOptionalNumber })} placeholder={t('placeholders.numeric')} />
                </div>
                <div className="space-y-2">
                  <Label>{t('labels.alarm_delay_minutes')}</Label>
                  <Input type="number" step="any" {...register('Retard_Alarme_Bas', { setValueAs: toOptionalNumber })} placeholder={t('placeholders.delay')} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={formData.Est_Consigne_Inf_Pre_Alarme_Active || false} onCheckedChange={(checked) => setValue('Est_Consigne_Inf_Pre_Alarme_Active', !!checked)} />
                <Label>{t('labels.lower_pre_enable')}</Label>
              </div>
              {formData.Est_Consigne_Inf_Pre_Alarme_Active && (
                <div className="space-y-2 pl-6">
                  <Label>{t('labels.lower_pre_label')}</Label>
                  <Input type="number" step="any" {...register('Consigne_Inf_Pre_Alarme', { setValueAs: toOptionalNumber })} placeholder={t('placeholders.numeric')} />
                </div>
              )}
            </div>
          )}
        </div>
      </fieldset>
      )}
    </div>
  )
}
