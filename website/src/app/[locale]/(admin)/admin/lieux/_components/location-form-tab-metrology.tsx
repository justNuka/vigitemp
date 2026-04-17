'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TabsContent } from '@/components/ui/tabs'
import { useFormContext } from 'react-hook-form'
import { computeEmt } from '@/lib/emt'
import { useAdjustments } from '@/hooks/useAdjustments'
import { useCalibrations } from '@/hooks/useCalibrations'
import { formatDbDateTime } from '@/lib/date-display'
import { useTranslations } from 'next-intl'

import { EmtModeSection } from './metrology-tab/emt-mode-section'
import { MetrologySensorInfoSection } from './metrology-tab/metrology-sensor-info-section'
import { defaultMetrologyUnit, normalizeMetrologyUnit } from './metrology-tab/metrology-helpers'
import type { LocationFormData } from './location-form-types'

type LocationFormTabMetrologyProps = {
  isExpertEdition: boolean
}

export function LocationFormTabMetrology({ isExpertEdition }: LocationFormTabMetrologyProps) {
  const t = useTranslations('locationsForm.metrology')
  const tGeneral = useTranslations('locationsForm.general')
  const { register, watch, setValue } = useFormContext<LocationFormData>()
  const formData = watch()

  const setUserValue = (name: keyof LocationFormData, value: unknown) => {
    setValue(name as never, value as never, { shouldDirty: true, shouldTouch: true })
  }
  const setIfChanged = useCallback(<K extends keyof LocationFormData>(name: K, value: LocationFormData[K]) => {
    if (Object.is(formData[name], value)) return
    setValue(name, value as never)
  }, [formData, setValue])
  const selectedSerial = formData.Sonde_Numero_Serie ?? null
  const { data: adjustments = [] } = useAdjustments(selectedSerial)
  const { data: calibrations = [] } = useCalibrations(selectedSerial)
  const [selectedCalibrationId, setSelectedCalibrationId] = useState<string>('')
  const latestAdjustment = adjustments[0] ?? null
  const latestCalibration = calibrations[0] ?? null
  const isDeriveForced = formData.EMT_Mode === 'quart' || formData.EMT_Mode === 'manuel'
  const previousModeRef = useRef(formData.EMT_Mode)

  useEffect(() => {
    if (!selectedSerial) {
      setIfChanged('Unite', defaultMetrologyUnit)
      setIfChanged('Erreur_Justesse', undefined)
      setIfChanged('Incertitude', undefined)
      setIfChanged('Derniere_Date_Etalonnage', undefined)
      setIfChanged('Applied_Etalonnage_Id', undefined)
      const resetTimer = window.setTimeout(() => {
        setSelectedCalibrationId('')
      }, 0)

      return () => {
        window.clearTimeout(resetTimer)
      }
    }

    const unit = normalizeMetrologyUnit(latestCalibration?.Unite ?? latestAdjustment?.Unite ?? defaultMetrologyUnit) || defaultMetrologyUnit
    setIfChanged('Unite', unit)
    setIfChanged('Erreur_Justesse', latestCalibration?.Err_Justesse ?? undefined)
    setIfChanged('Incertitude', latestCalibration?.Incertitude ?? undefined)
  }, [
    formData.Applied_Etalonnage_Id,
    formData.Derniere_Date_Etalonnage,
    formData.Erreur_Justesse,
    formData.Incertitude,
    formData.Unite,
    latestAdjustment?.Unite,
    latestCalibration?.Err_Justesse,
    latestCalibration?.Incertitude,
    latestCalibration?.Unite,
    selectedSerial,
    setIfChanged,
    setValue,
  ])

  useEffect(() => {
    if (!selectedSerial || calibrations.length === 0) {
      const resetTimer = window.setTimeout(() => {
        setSelectedCalibrationId('')
      }, 0)

      return () => {
        window.clearTimeout(resetTimer)
      }
    }

    const currentExists = calibrations.some((cal) => String(cal.Id_Etalonnage) === selectedCalibrationId)
    if (!currentExists) {
      const selectTimer = window.setTimeout(() => {
        setSelectedCalibrationId(String(calibrations[0].Id_Etalonnage))
      }, 0)

      return () => {
        window.clearTimeout(selectTimer)
      }
    }
  }, [calibrations, selectedCalibrationId, selectedSerial])

  const selectedCalibration = useMemo(
    () => calibrations.find((calibration) => String(calibration.Id_Etalonnage) === selectedCalibrationId) ?? null,
    [calibrations, selectedCalibrationId],
  )

  const applySelectedCalibration = () => {
    if (!selectedCalibration) return

    const unit = normalizeMetrologyUnit(selectedCalibration.Unite) || defaultMetrologyUnit
    setUserValue('Unite', unit)
    setUserValue('Erreur_Justesse', selectedCalibration.Err_Justesse ?? undefined)
    setUserValue('Incertitude', selectedCalibration.Incertitude ?? undefined)
    setUserValue('Derniere_Date_Etalonnage', selectedCalibration.Date_Heure_Etalonnage ?? null)
    setUserValue('Applied_Etalonnage_Id', selectedCalibration.Id_Etalonnage)

    toast.success(t('calibration.manual_apply_success'))
  }

  useEffect(() => {
    if (!isDeriveForced || formData.Prendre_En_Compte_Derive === true) return
    setValue('Prendre_En_Compte_Derive', true)
  }, [formData.Prendre_En_Compte_Derive, isDeriveForced, setValue])

  useEffect(() => {
    if (isExpertEdition) return

    if (formData.EMT_Mode === 'uncertainties') {
      setIfChanged('EMT_Mode', 'quart')
    }
    if (formData.Prendre_En_Compte_Derive) {
      setIfChanged('Prendre_En_Compte_Derive', false)
    }
  }, [formData.EMT_Mode, formData.Prendre_En_Compte_Derive, isExpertEdition, setIfChanged])

  useEffect(() => {
    const previousMode = previousModeRef.current
    if (previousMode !== formData.EMT_Mode && formData.EMT_Mode === 'uncertainties') {
      if (formData.Prendre_En_Compte_Derive !== false) {
        setIfChanged('Prendre_En_Compte_Derive', false)
      }
      if (formData.Corriger_Erreur_Justesse !== false) {
        setIfChanged('Corriger_Erreur_Justesse', false)
      }
    }
    previousModeRef.current = formData.EMT_Mode
  }, [formData.Corriger_Erreur_Justesse, formData.EMT_Mode, formData.Prendre_En_Compte_Derive, setIfChanged])

  useEffect(() => {
    if (formData.EMT_Mode !== 'sans-objet' || formData.Prendre_En_Compte_Derive === false) return
    setIfChanged('Prendre_En_Compte_Derive', false)
  }, [formData.EMT_Mode, formData.Prendre_En_Compte_Derive, setIfChanged])

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
      setIfChanged('Tolerance_Surveillance_Sup', nextSup)
    }
    if ((formData.Tolerance_Surveillance_Inf ?? undefined) !== nextInf) {
      setIfChanged('Tolerance_Surveillance_Inf', nextInf)
    }
  }, [
    emtPreview.toleranceInf,
    emtPreview.toleranceSup,
    formData.EMT_Mode,
    formData.Tolerance_Surveillance_Inf,
    formData.Tolerance_Surveillance_Sup,
    setIfChanged,
  ])

  useEffect(() => {
    if (formData.EMT_Mode !== 'sans-objet') return

    const nextSup = formData.Est_Consigne_Sup_Active ? (formData.Consigne_Sup ?? undefined) : undefined
    const nextInf = formData.Est_Consigne_Inf_Active ? (formData.Consigne_Inf ?? undefined) : undefined

    if ((formData.Tolerance_Surveillance_Sup ?? undefined) !== nextSup) {
      setIfChanged('Tolerance_Surveillance_Sup', nextSup)
    }
    if ((formData.Tolerance_Surveillance_Inf ?? undefined) !== nextInf) {
      setIfChanged('Tolerance_Surveillance_Inf', nextInf)
    }
  }, [
    formData.Consigne_Inf,
    formData.Consigne_Sup,
    formData.Est_Consigne_Inf_Active,
    formData.Est_Consigne_Sup_Active,
    formData.EMT_Mode,
    formData.Tolerance_Surveillance_Inf,
    formData.Tolerance_Surveillance_Sup,
    setIfChanged,
  ])

  return (
    <TabsContent value="metrologie" className="space-y-6">
      <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <span className="font-medium">{t('mode.label')}:</span>{' '}
        {isExpertEdition ? t('mode.expert') : t('mode.standard')}
      </div>

      <MetrologySensorInfoSection formData={formData} latestAdjustment={latestAdjustment} latestCalibration={latestCalibration} />

      <div className="border p-4 rounded-lg space-y-4">
        <h3 className="font-semibold">{t('calibration.manual_apply_title')}</h3>
        {!selectedSerial ? (
          <p className="text-sm text-muted-foreground">{t('calibration.manual_apply_no_sensor')}</p>
        ) : calibrations.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('calibration.manual_apply_empty')}</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <div className="space-y-2">
              <Label>{t('calibration.manual_apply_select_label')}</Label>
              <Select
                value={selectedCalibrationId}
                onValueChange={(value) => {
                  setSelectedCalibrationId(value)
                  setValue('Applied_Etalonnage_Id', undefined)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('calibration.manual_apply_select_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {calibrations.map((calibration) => (
                    <SelectItem key={calibration.Id_Etalonnage} value={String(calibration.Id_Etalonnage)}>
                      {`${formatDbDateTime(calibration.Date_Heure_Etalonnage ?? null)} - ${calibration.Operateur ?? t('calibration.operator_unknown')}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="button" onClick={applySelectedCalibration} disabled={!selectedCalibration}>
              {t('calibration.manual_apply_button')}
            </Button>
          </div>
        )}
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
        isExpertEdition={isExpertEdition}
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
