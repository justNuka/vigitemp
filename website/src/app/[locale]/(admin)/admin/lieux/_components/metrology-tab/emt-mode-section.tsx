'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { useTranslations } from 'next-intl'
import { formatNumber } from '@/lib/number-display'
import type { UseFormRegister } from 'react-hook-form'

import type { LocationFormData } from '../location-form-types'

const formatEmtNumber = (value: number) =>
  formatNumber(value, { decimals: 4, locale: "en-US", grouping: false })

interface EmtModeSectionProps {
  isExpertEdition: boolean
  formData: LocationFormData
  emtPreview: { emtSonde: number | null }
  absEj: number
  iEtalonnage: number
  withDerivePart: number
  isDeriveForced: boolean
  setUserValue: (name: keyof LocationFormData, value: unknown) => void
  register: UseFormRegister<LocationFormData>
}

export function EmtModeSection({
  isExpertEdition,
  formData,
  emtPreview,
  absEj,
  iEtalonnage,
  withDerivePart,
  isDeriveForced,
  setUserValue,
  register,
}: EmtModeSectionProps) {
  const t = useTranslations('locationsForm.metrology')

  return (
    <>
      <div className="border p-4 rounded-lg space-y-4">
        <h3 className="font-semibold">{t('emt.title')}</h3>
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="radio" name="emt_mode" value="quart" checked={formData.EMT_Mode === 'quart'} onChange={(e) => setUserValue('EMT_Mode', e.target.value)} className="mt-1" />
            <div>
              <div className="font-medium">{t('emt.option.quart.title')}</div>
              <div className="text-sm text-muted-foreground">{t('emt.option.quart.description')}</div>
              {formData.EMT_Mode === 'quart' && (
                <div className="mt-2 space-y-2">
                  <Input type="number" step="0.01" disabled value={emtPreview.emtSonde ?? ''} className="bg-muted" placeholder={t('emt.decimals_placeholder')} />
                </div>
              )}
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="radio" name="emt_mode" value="manuel" checked={formData.EMT_Mode === 'manuel'} onChange={(e) => setUserValue('EMT_Mode', e.target.value)} className="mt-1" />
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
                      setValueAs: (value) => (value === '' || Number.isNaN(Number(value)) ? undefined : Number(value)),
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
              onChange={(e) => setUserValue('EMT_Mode', e.target.value)}
              className="mt-1"
            />
            <div>
              <div className="font-medium">{t('emt.option.uncertainties.title')}</div>
              <div className="text-sm text-muted-foreground">{t('emt.option.uncertainties.description')}</div>
              <div className="mt-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                {!formData.Prendre_En_Compte_Derive && formData.Corriger_Erreur_Justesse ? (
                  <>
                    <span className="font-medium">I<sub>mes</sub> = I<sub>et</sub></span>
                    <div className="text-xs text-muted-foreground">{`I_et = ${iEtalonnage}`}</div>
                  </>
                ) : !formData.Prendre_En_Compte_Derive ? (
                  <>
                    <span className="font-medium">I<sub>mes</sub> = |EJ| + I<sub>etalonnage</sub></span>
                    <div className="text-xs text-muted-foreground">{`I_mes = |${absEj}| + ${iEtalonnage} = ${formatEmtNumber(absEj + iEtalonnage)}`}</div>
                  </>
                ) : formData.Corriger_Erreur_Justesse ? (
                  <>
                    <span className="font-medium">I<sub>mes</sub> = 2 * sqrt((I<sub>et</sub>/2)<sup>2</sup> + (Derive/sqrt(3))<sup>2</sup>)</span>
                    <div className="text-xs text-muted-foreground">{`I_et = ${iEtalonnage}`}</div>
                    <div className="text-xs text-muted-foreground">{`I_mes = ${formatEmtNumber(withDerivePart)}`}</div>
                  </>
                ) : (
                  <>
                    <span className="font-medium">I<sub>mes</sub> = |EJ| + 2 * sqrt((I<sub>et</sub>/2)<sup>2</sup> + (Derive/sqrt(3))<sup>2</sup>)</span>
                    <div className="text-xs text-muted-foreground">{`I_et = ${iEtalonnage}`}</div>
                    <div className="text-xs text-muted-foreground">{`I_mes = |${absEj}| + ${formatEmtNumber(withDerivePart)} = ${formatEmtNumber(absEj + withDerivePart)}`}</div>
                  </>
                )}
              </div>
              {formData.EMT_Mode === 'uncertainties' && (
                <div className="mt-2 space-y-2">
                  <Input type="number" step="0.01" disabled value={emtPreview.emtSonde ?? ''} className="bg-muted" placeholder={t('emt.decimals_placeholder')} />
                </div>
              )}
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="radio" name="emt_mode" value="sans-objet" checked={formData.EMT_Mode === 'sans-objet'} onChange={(e) => setUserValue('EMT_Mode', e.target.value)} className="mt-1" />
            <div className="font-medium">{t('emt.option.na')}</div>
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={formData.Corriger_Erreur_Justesse || false} onCheckedChange={(checked) => setUserValue('Corriger_Erreur_Justesse', !!checked)} />
          <span>{t('checkboxes.correct_accuracy')}</span>
        </label>
        {isExpertEdition ? (
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={formData.Prendre_En_Compte_Derive ?? false} onCheckedChange={(checked) => setUserValue('Prendre_En_Compte_Derive', !!checked)} disabled={isDeriveForced} />
            <span>{t('checkboxes.include_drift')}</span>
          </label>
        ) : null}
      </div>
    </>
  )
}
