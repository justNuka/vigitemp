'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TabsContent } from '@/components/ui/tabs'
import { useFormContext } from 'react-hook-form'
import { useTranslations } from 'next-intl'

import type { LocationFormData } from './location-form-types'

export function LocationFormTabMetrology() {
  const t = useTranslations('locationsForm.metrology')
  const { register, watch, setValue } = useFormContext<LocationFormData>()
  const formData = watch()

  return (
    <TabsContent value="metrologie" className="space-y-6">
      <div className="border p-4 rounded-lg space-y-4">
        <h3 className="font-semibold">{t('sections.sensor')}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('labels.serial')}</Label>
            <Input disabled value={formData.Sonde_Numero_Serie || ''} className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>{t('labels.state')}</Label>
            <Input disabled placeholder={t('placeholders.auto')} className="bg-muted" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{t('labels.calibration_date')}</Label>
            <Input disabled placeholder={t('placeholders.auto')} className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>{t('labels.calibration_check_date')}</Label>
            <Input disabled placeholder={t('placeholders.auto')} className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>{t('labels.unit')}</Label>
            <Input disabled value={formData.Unite || '°C'} className="bg-muted" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{t('labels.accuracy_error')}</Label>
            <Input type="number" step="0.01" disabled value={formData.Erreur_Justesse || ''} className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>{t('labels.uncertainty')}</Label>
            <Input type="number" step="0.01" disabled value={formData.Incertitude || ''} className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>{t('labels.drift')}</Label>
            <Input type="number" step="0.01" disabled value={formData.Derive || ''} className="bg-muted" />
          </div>
        </div>
      </div>

      <div className="border p-3 rounded-lg space-y-3 bg-slate-50 dark:bg-slate-900/30">
        <h3 className="font-semibold text-sm">{t('sections.setpoints')}</h3>
        <div className="space-y-2 text-sm">
          {formData.Est_Consigne_Sup_Active && (
            <div className="flex justify-between items-center">
              <span>{t('setpoints.upper', { value: formData.Consigne_Sup ?? '-' })}</span>
              <span className="text-muted-foreground">{t('setpoints.upper_tolerance')}</span>
              <Input
                type="number"
                step="0.01"
                {...register('Tolerance_Surveillance_Sup', {
                  setValueAs: (value) =>
                    value === '' || Number.isNaN(Number(value)) ? undefined : Number(value),
                })}
                placeholder="0.00"
                className="w-24 h-8"
              />
            </div>
          )}
          {formData.Est_Consigne_Inf_Active && (
            <div className="flex justify-between items-center">
              <span>{t('setpoints.lower', { value: formData.Consigne_Inf ?? '-' })}</span>
              <span className="text-muted-foreground">{t('setpoints.lower_tolerance')}</span>
              <Input
                type="number"
                step="0.01"
                {...register('Tolerance_Surveillance_Inf', {
                  setValueAs: (value) =>
                    value === '' || Number.isNaN(Number(value)) ? undefined : Number(value),
                })}
                placeholder="0.00"
                className="w-24 h-8"
              />
            </div>
          )}
          {!formData.Est_Consigne_Sup_Active && !formData.Est_Consigne_Inf_Active && (
            <p className="text-muted-foreground">{t('setpoints.empty')}</p>
          )}
        </div>
      </div>

      <div className="border p-4 rounded-lg space-y-4">
        <h3 className="font-semibold">{t('emt.title')}</h3>
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="emt_mode"
              value="quart"
              checked={formData.EMT_Mode === 'quart'}
              onChange={(e) => setValue('EMT_Mode', e.target.value)}
              className="mt-1"
            />
            <div>
              <div className="font-medium">{t('emt.option.quart.title')}</div>
              <div className="text-sm text-muted-foreground">{t('emt.option.quart.description')}</div>
              {formData.EMT_Mode === 'quart' && (
                <div className="mt-2 space-y-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={t('emt.decimals_placeholder')}
                    {...register('EMT_Valeur', {
                      setValueAs: (value) =>
                        value === '' || Number.isNaN(Number(value)) ? undefined : Number(value),
                    })}
                  />
                </div>
              )}
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="emt_mode"
              value="manuel"
              checked={formData.EMT_Mode === 'manuel'}
              onChange={(e) => setValue('EMT_Mode', e.target.value)}
              className="mt-1"
            />
            <div>
              <div className="font-medium">{t('emt.option.manuel.title')}</div>
              <div className="text-sm text-muted-foreground">{t('emt.option.manuel.description')}</div>
              {formData.EMT_Mode === 'manuel' && (
                <div className="mt-2 space-y-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={t('emt.decimals_placeholder')}
                    {...register('EMT_Valeur', {
                      setValueAs: (value) =>
                        value === '' || Number.isNaN(Number(value)) ? undefined : Number(value),
                    })}
                  />
                </div>
              )}
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="emt_mode"
              value="uncertainties"
              checked={formData.EMT_Mode === 'uncertainties'}
              onChange={(e) => setValue('EMT_Mode', e.target.value)}
              className="mt-1"
            />
            <div>
              <div className="font-medium">{t('emt.option.uncertainties.title')}</div>
              <div className="text-sm text-muted-foreground">{t('emt.option.uncertainties.description')}</div>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="emt_mode"
              value="sans-objet"
              checked={formData.EMT_Mode === 'sans-objet'}
              onChange={(e) => setValue('EMT_Mode', e.target.value)}
              className="mt-1"
            />
            <div className="font-medium">{t('emt.option.na')}</div>
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={formData.Corriger_Erreur_Justesse || false}
            onCheckedChange={(checked) => setValue('Corriger_Erreur_Justesse', !!checked)}
          />
          <span>{t('checkboxes.correct_accuracy')}</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={formData.Prendre_En_Compte_Derive ?? true}
            onCheckedChange={(checked) => setValue('Prendre_En_Compte_Derive', !!checked)}
          />
          <span>{t('checkboxes.include_drift')}</span>
        </label>
      </div>
    </TabsContent>
  )
}


