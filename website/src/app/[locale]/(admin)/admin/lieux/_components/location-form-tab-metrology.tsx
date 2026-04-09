'use client'

import { useEffect, useMemo, useRef } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TabsContent } from '@/components/ui/tabs'
import { useFormContext } from 'react-hook-form'
import { computeEmt } from '@/lib/emt'
import { useAdjustments } from '@/hooks/useAdjustments'
import { useCalibrations } from '@/hooks/useCalibrations'
import { useTranslations } from 'next-intl'

import { EmtModeSection } from './metrology-tab/emt-mode-section'
import { MetrologySensorInfoSection } from './metrology-tab/metrology-sensor-info-section'
import { defaultMetrologyUnit, normalizeMetrologyUnit } from './metrology-tab/metrology-helpers'
import type { LocationFormData } from './location-form-types'

export function LocationFormTabMetrology() {
  const t = useTranslations('locationsForm.metrology')
  const tGeneral = useTranslations('locationsForm.general')
  const { register, watch, setValue } = useFormContext<LocationFormData>()

  const setUserValue = (name: keyof LocationFormData, value: unknown) => {
    setValue(name as never, value as never, { shouldDirty: true, shouldTouch: true })
  }

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
      setValue('Unite', defaultMetrologyUnit)
      setValue('Erreur_Justesse', undefined)
      setValue('Incertitude', undefined)
      return
    }

    const unit = normalizeMetrologyUnit(latestCalibration?.Unite ?? latestAdjustment?.Unite ?? defaultMetrologyUnit) || defaultMetrologyUnit
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
    if (!isDeriveForced || formData.Prendre_En_Compte_Derive === true) return
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
    if (formData.EMT_Mode !== 'sans-objet' || formData.Prendre_En_Compte_Derive === false) return
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
  const withDerivePart = 2 * Math.sqrt(Math.pow(iEtalonnage / 2, 2) + Math.pow(deriveValue / Math.sqrt(3), 2))

  useEffect(() => {
    if (!['quart', 'manuel', 'uncertainties'].includes(formData.EMT_Mode ?? '')) return

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

    const nextSup = formData.Est_Consigne_Sup_Active ? (formData.Consigne_Sup ?? undefined) : undefined
    const nextInf = formData.Est_Consigne_Inf_Active ? (formData.Consigne_Inf ?? undefined) : undefined

    if ((formData.Tolerance_Surveillance_Sup ?? undefined) !== nextSup) {
      setValue('Tolerance_Surveillance_Sup', nextSup)
    }
    if ((formData.Tolerance_Surveillance_Inf ?? undefined) !== nextInf) {
      setValue('Tolerance_Surveillance_Inf', nextInf)
    }
  }, [
    formData.Consigne_Inf,
    formData.Consigne_Sup,
    formData.Est_Consigne_Inf_Active,
    formData.Est_Consigne_Sup_Active,
    formData.EMT_Mode,
    formData.Tolerance_Surveillance_Inf,
    formData.Tolerance_Surveillance_Sup,
    setValue,
  ])

  return (
    <TabsContent value="metrologie" className="space-y-6">
      <MetrologySensorInfoSection formData={formData} latestAdjustment={latestAdjustment} latestCalibration={latestCalibration} />

      <div className="border p-4 rounded-lg space-y-4 mt-6">
        <h3 className="font-semibold">{t('sections.setpoints')}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{tGeneral('labels.upper_max')}</Label>
            <Input disabled value={formData.Consigne_Sup ?? ''} className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>{t('setpoints.upper_tolerance')}</Label>
            <Input disabled value={formData.Est_Consigne_Sup_Active ? (formData.Tolerance_Surveillance_Sup ?? '') : ''} className="bg-muted" />
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
            <Input disabled value={formData.Est_Consigne_Inf_Active ? (formData.Tolerance_Surveillance_Inf ?? '') : ''} className="bg-muted" />
          </div>
        </div>

        {!formData.Est_Consigne_Sup_Active && !formData.Est_Consigne_Inf_Active && (
          <p className="text-sm text-muted-foreground">{t('setpoints.empty')}</p>
        )}
      </div>

      <EmtModeSection
        formData={formData}
        emtPreview={emtPreview}
        absEj={absEj}
        iEtalonnage={iEtalonnage}
        withDerivePart={withDerivePart}
        isDeriveForced={isDeriveForced}
        setUserValue={setUserValue}
        register={register}
      />
    </TabsContent>
  )
}
