'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDbDateTime } from '@/lib/date-display'
import { useTranslations } from 'next-intl'

import type { LocationFormData } from '../location-form-types'
import { defaultMetrologyUnit, normalizeMetrologyUnit } from './metrology-helpers'

export function MetrologySensorInfoSection({
  formData,
  latestAdjustment,
  latestCalibration,
}: {
  formData: LocationFormData
  latestAdjustment: { Date_Heure_Ajustage?: string | null } | null
  latestCalibration: { Date_Heure_Etalonnage?: string | null } | null
}) {
  const t = useTranslations('locationsForm.metrology')

  return (
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
          <Input disabled value={formatDbDateTime(latestAdjustment?.Date_Heure_Ajustage ?? null)} placeholder={t('placeholders.auto')} className="bg-muted" />
        </div>
        <div className="space-y-2">
          <Label>{t('labels.calibration_check_date')}</Label>
          <Input disabled value={formatDbDateTime(latestCalibration?.Date_Heure_Etalonnage ?? null)} placeholder={t('placeholders.auto')} className="bg-muted" />
        </div>
        <div className="space-y-2">
          <Label>{t('labels.unit')}</Label>
          <Input disabled value={normalizeMetrologyUnit(formData.Unite) || defaultMetrologyUnit} className="bg-muted" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{t('labels.applied_calibration_date')}</Label>
          <Input
            disabled
            value={formatDbDateTime(formData.Derniere_Date_Etalonnage ?? latestCalibration?.Date_Heure_Etalonnage ?? null)}
            placeholder={t('placeholders.auto')}
            className="bg-muted"
          />
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
  )
}
