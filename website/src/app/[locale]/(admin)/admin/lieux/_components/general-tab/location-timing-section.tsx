'use client'

import { CircleHelp } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { useTranslations } from 'next-intl'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import type { LocationFormData } from '../location-form-types'
import { toOptionalNonNegativeInteger, toOptionalNumber } from './location-form-parsers'

export function LocationTimingSection({ isGsoSensor }: { isGsoSensor: boolean }) {
  const t = useTranslations('locationsForm.general')
  const { register } = useFormContext<LocationFormData>()

  return (
    <div className="mt-6 space-y-4 rounded-lg border p-4">
      <div>
        <h3 className="font-semibold">{t('sections.measurement_timing')}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{t('measurement_timing_description')}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{t('labels.frequency')}</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={isGsoSensor ? 'cursor-not-allowed' : ''}>
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
              </TooltipTrigger>
              {isGsoSensor ? (
                <TooltipContent>
                  <p>{t('tooltips.frequency_gso')}</p>
                </TooltipContent>
              ) : null}
            </Tooltip>
          </TooltipProvider>
        </div>

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
            {...register('Nb_Mesures_Temporisation_Redeclenchement', {
              setValueAs: toOptionalNonNegativeInteger,
            })}
            placeholder={t('placeholders.retrigger_delay_measures')}
          />
        </div>
      </div>
    </div>
  )
}
