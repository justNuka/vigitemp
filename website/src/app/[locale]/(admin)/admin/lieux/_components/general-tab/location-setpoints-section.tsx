'use client'

import { CircleHelp } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useFormContext } from 'react-hook-form'
import { useTranslations } from 'next-intl'

import type { LocationFormData } from '../location-form-types'
import { toOptionalNonNegativeInteger, toOptionalNumber } from './location-form-parsers'

export function LocationSetpointsSection({ isGsoSensor }: { isGsoSensor: boolean }) {
  const t = useTranslations('locationsForm.general')
  const { register, watch, setValue } = useFormContext<LocationFormData>()
  const formData = watch()

  return (
    <div className="border p-4 rounded-lg space-y-4 mt-6">
      <h3 className="font-semibold">{t('sections.setpoints')}</h3>
      <div className="space-y-4 flex flex-col">
        <div className="space-y-3 pb-3 border-b order-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('labels.setpoint')}</Label>
              <Input type="number" {...register('Consigne', { setValueAs: toOptionalNumber })} placeholder={t('placeholders.numeric')} />
            </div>
            <div className="space-y-2">
              <Label>{t('labels.frequency')}</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={isGsoSensor ? 'cursor-not-allowed' : ''}>
                      <Input
                        type="number"
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
                  <Input type="number" {...register('Consigne_Sup', { setValueAs: toOptionalNumber })} placeholder={t('placeholders.numeric')} />
                </div>
                <div className="space-y-2">
                  <Label>{t('labels.alarm_delay_minutes')}</Label>
                  <Input type="number" {...register('Retard_Alarme_Haut', { setValueAs: toOptionalNumber })} placeholder={t('placeholders.delay')} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={formData.Est_Consigne_Sup_Pre_Alarme_Active || false} onCheckedChange={(checked) => setValue('Est_Consigne_Sup_Pre_Alarme_Active', !!checked)} />
                <Label>{t('labels.upper_pre_enable')}</Label>
              </div>
              {formData.Est_Consigne_Sup_Pre_Alarme_Active && (
                <div className="space-y-2 pl-6">
                  <Label>{t('labels.upper_pre_label')}</Label>
                  <Input type="number" {...register('Consigne_Sup_Pre_Alarme', { setValueAs: toOptionalNumber })} placeholder={t('placeholders.numeric')} />
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
                  <Input type="number" {...register('Consigne_Inf', { setValueAs: toOptionalNumber })} placeholder={t('placeholders.numeric')} />
                </div>
                <div className="space-y-2">
                  <Label>{t('labels.alarm_delay_minutes')}</Label>
                  <Input type="number" {...register('Retard_Alarme_Bas', { setValueAs: toOptionalNumber })} placeholder={t('placeholders.delay')} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={formData.Est_Consigne_Inf_Pre_Alarme_Active || false} onCheckedChange={(checked) => setValue('Est_Consigne_Inf_Pre_Alarme_Active', !!checked)} />
                <Label>{t('labels.lower_pre_enable')}</Label>
              </div>
              {formData.Est_Consigne_Inf_Pre_Alarme_Active && (
                <div className="space-y-2 pl-6">
                  <Label>{t('labels.lower_pre_label')}</Label>
                  <Input type="number" {...register('Consigne_Inf_Pre_Alarme', { setValueAs: toOptionalNumber })} placeholder={t('placeholders.numeric')} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
