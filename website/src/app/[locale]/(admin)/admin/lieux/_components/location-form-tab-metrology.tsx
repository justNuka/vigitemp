'use client'

import { useEffect, useMemo, useRef } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TabsContent } from '@/components/ui/tabs'
import { useFormContext } from 'react-hook-form'
import { computeEmt } from '@/lib/emt'
import { formatDbDateTime } from '@/lib/date-display'
import { useAdjustments } from '@/hooks/useAdjustments'
import { useCalibrations } from '@/hooks/useCalibrations'
import { useTranslations } from 'next-intl'

import type { LocationFormData } from './location-form-types'

const DEGREE_C = '\u00b0C'
const BAD_DEGREE = '\u00c2\u00b0'
const REPLACEMENT_CHAR = String.fromCharCode(0xfffd)

const normalizeUnit = (value: string | null | undefined) => {
  let normalized = value ?? ''
  normalized = normalized.split(BAD_DEGREE).join('\u00b0')
  normalized = normalized.split(REPLACEMENT_CHAR).join('\u00c9')
  return normalized.trim()
}

export function LocationFormTabMetrology() {
  const t = useTranslations('locationsForm.metrology')
  const tGeneral = useTranslations('locationsForm.general')
  const { register, watch, setValue } = useFormContext<LocationFormData>()
  const formData = watch()
  const selectedSerial = formData.Sonde_Numero_Serie ?? null
  const { data: adjustments = [] } = useAdjustments(selectedSerial)
  const { data: calibrations = [] } = useCalibrations(selectedSerial)
  const latestAdjustment = adjustments[0] ?? null
  const latestCalibration = calibrations[0] ?? null
  const isDeriveForced = formData.EMT_Mode === 'quart' || formData.EMT_Mode === 'manuel'
  const previousModeRef = useRef(formData.EMT_Mode)

  useEffect(() => {
    if (!selectedSerial) {
      setValue('Unite', DEGREE_C)
      setValue('Erreur_Justesse', undefined)
      setValue('Incertitude', undefined)
      return
    }

    const unit = normalizeUnit(latestCalibration?.Unite ?? latestAdjustment?.Unite ?? DEGREE_C) || DEGREE_C
    setValue('Unite', unit)
    setValue('Erreur_Justesse', latestCalibration?.Err_Justesse ?? undefined)
    setValue('Incertitude', latestCalibration?.Incertitude ?? undefined)
  }, [
    latestAdjustment?.Unite,
    latestCalibration?.Err_Justesse,
    latestCalibration?.Incertitude,
    latestCalibration?.Unite,
    selectedSerial,
    setValue,
  ])

  useEffect(() => {
    if (!isDeriveForced) return
    if (formData.Prendre_En_Compte_Derive === true) return
    setValue('Prendre_En_Compte_Derive', true)
  }, [formData.Prendre_En_Compte_Derive, isDeriveForced, setValue])

  useEffect(() => {
    const previousMode = previousModeRef.current
    if (previousMode !== formData.EMT_Mode && formData.EMT_Mode === 'uncertainties') {
      if (formData.Prendre_En_Compte_Derive !== false) {
        setValue('Prendre_En_Compte_Derive', false)
      }
      if (formData.Corriger_Erreur_Justesse !== false) {
        setValue('Corriger_Erreur_Justesse', false)
      }
    }
    previousModeRef.current = formData.EMT_Mode
  }, [formData.Corriger_Erreur_Justesse, formData.EMT_Mode, formData.Prendre_En_Compte_Derive, setValue])

  useEffect(() => {
    if (formData.EMT_Mode !== 'sans-objet') return
    if (formData.Prendre_En_Compte_Derive === false) return
    setValue('Prendre_En_Compte_Derive', false)
  }, [formData.EMT_Mode, formData.Prendre_En_Compte_Derive, setValue])

  const emtPreview = useMemo(
    () =>
      computeEmt({
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
        includeDeriveInUncertainty: formData.Prendre_En_Compte_Derive ?? false,
        correctAccuracyError: formData.Corriger_Erreur_Justesse ?? false,
      }),
    [formData],
  )


  const absEj = Math.abs(formData.Erreur_Justesse ?? 0)
  const iEtalonnage = Math.abs(formData.Incertitude ?? 0)
  const deriveValue = Math.abs(formData.Derive ?? 0)
  const withDerivePart =
    2 * Math.sqrt(Math.pow(iEtalonnage / 2, 2) + Math.pow(deriveValue / Math.sqrt(3), 2))

  useEffect(() => {
    if (formData.EMT_Mode !== 'quart' && formData.EMT_Mode !== 'manuel' && formData.EMT_Mode !== 'uncertainties') return

    const nextSup = emtPreview.toleranceSup ?? undefined
    const nextInf = emtPreview.toleranceInf ?? undefined

    if ((formData.Tolerance_Surveillance_Sup ?? undefined) !== nextSup) {
      setValue('Tolerance_Surveillance_Sup', nextSup)
    }
    if ((formData.Tolerance_Surveillance_Inf ?? undefined) !== nextInf) {
      setValue('Tolerance_Surveillance_Inf', nextInf)
    }
  }, [
    emtPreview.toleranceInf,
    emtPreview.toleranceSup,
    formData.EMT_Mode,
    formData.Tolerance_Surveillance_Inf,
    formData.Tolerance_Surveillance_Sup,
    setValue,
  ])


  useEffect(() => {
    if (formData.EMT_Mode !== 'sans-objet') return

    const nextSup = formData.Consigne_Sup ?? undefined
    const nextInf = formData.Consigne_Inf ?? undefined

    if ((formData.Tolerance_Surveillance_Sup ?? undefined) !== nextSup) {
      setValue('Tolerance_Surveillance_Sup', nextSup)
    }
    if ((formData.Tolerance_Surveillance_Inf ?? undefined) !== nextInf) {
      setValue('Tolerance_Surveillance_Inf', nextInf)
    }
  }, [
    formData.Consigne_Inf,
    formData.Consigne_Sup,
    formData.EMT_Mode,
    formData.Tolerance_Surveillance_Inf,
    formData.Tolerance_Surveillance_Sup,
    setValue,
  ])

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
            <Input
              disabled
              value={formatDbDateTime(latestAdjustment?.Date_Heure_Ajustage ?? null)}
              placeholder={t('placeholders.auto')}
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label>{t('labels.calibration_check_date')}</Label>
            <Input
              disabled
              value={formatDbDateTime(latestCalibration?.Date_Heure_Etalonnage ?? null)}
              placeholder={t('placeholders.auto')}
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label>{t('labels.unit')}</Label>
            <Input disabled value={normalizeUnit(formData.Unite) || DEGREE_C} className="bg-muted" />
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

      <div className="border p-4 rounded-lg space-y-4 mt-6">
        <h3 className="font-semibold">{t('sections.setpoints')}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{tGeneral('labels.upper_max')}</Label>
            <Input disabled value={formData.Consigne_Sup ?? ''} className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>{t('setpoints.upper_tolerance')}</Label>
            <Input disabled value={formData.Tolerance_Surveillance_Sup ?? ''} className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label>{tGeneral('labels.setpoint')}</Label>
            <Input disabled value={formData.Consigne ?? ''} className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>{tGeneral('labels.frequency')}</Label>
            <Input disabled value={formData.Frequence ?? ''} className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label>{tGeneral('labels.lower_min')}</Label>
            <Input disabled value={formData.Consigne_Inf ?? ''} className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>{t('setpoints.lower_tolerance')}</Label>
            <Input disabled value={formData.Tolerance_Surveillance_Inf ?? ''} className="bg-muted" />
          </div>
        </div>

        {!formData.Est_Consigne_Sup_Active && !formData.Est_Consigne_Inf_Active && (
          <p className="text-sm text-muted-foreground">{t('setpoints.empty')}</p>
        )}
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
                    disabled
                    value={emtPreview.emtSonde ?? ''}
                    className="bg-muted"
                    placeholder={t('emt.decimals_placeholder')}
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
              <div className="mt-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                {!formData.Prendre_En_Compte_Derive ? (
                  <>
                    <span className="font-medium">I<sub>mes</sub> = |EJ| + I<sub>etalonnage</sub></span>
                    <div className="text-xs text-muted-foreground">
                      {`I_mes = |${absEj}| + ${iEtalonnage} = ${(absEj + iEtalonnage).toFixed(4)}`}
                    </div>
                  </>
                ) : formData.Corriger_Erreur_Justesse ? (
                  <>
                    <span className="font-medium">
                      I<sub>mes</sub> = 2 * sqrt((I<sub>et</sub>/2)<sup>2</sup> + (Derive/sqrt(3))<sup>2</sup>)
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {`I_et = ${iEtalonnage}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {`I_mes = ${withDerivePart.toFixed(4)}`}
                    </div>
                  </>
                ) : (
                  <>
                    <span className="font-medium">
                      I<sub>mes</sub> = |EJ| + 2 * sqrt((I<sub>et</sub>/2)<sup>2</sup> + (Derive/sqrt(3))<sup>2</sup>)
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {`I_et = ${iEtalonnage}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {`I_mes = |${absEj}| + ${withDerivePart.toFixed(4)} = ${(absEj + withDerivePart).toFixed(4)}`}
                    </div>
                  </>
                )}
              </div>
              {formData.EMT_Mode === 'uncertainties' && (
                <div className="mt-2 space-y-2">
                  <Input
                    type="number"
                    step="0.01"
                    disabled
                    value={emtPreview.emtSonde ?? ''}
                    className="bg-muted"
                    placeholder={t('emt.decimals_placeholder')}
                  />
                </div>
              )}
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
            checked={formData.Prendre_En_Compte_Derive ?? false}
            onCheckedChange={(checked) => setValue('Prendre_En_Compte_Derive', !!checked)}
            disabled={isDeriveForced}
          />
          <span>{t('checkboxes.include_drift')}</span>
        </label>
      </div>
    </TabsContent>
  )
}
