import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Chart as ChartJS, CategoryScale, Filler, Legend, LineElement, LinearScale, PointElement, Title, Tooltip } from 'chart.js'
import { BatteryWarning, Power, PowerOff, Settings } from 'lucide-react'
import { m } from 'motion/react'
import { useQueryClient } from '@tanstack/react-query'

import { useAppAccess } from '@/components/access/app-access-provider'
import { AlarmAcknowledgeDialog, type AcknowledgeDialogAlarm } from '@/components/alarm-acknowledge-dialog'
import MonitoringDetailsModal from '@/components/monitoring-details-modal'
import { MonitoringCardChartPreview } from '@/components/monitoring-card/monitoring-card-chart-preview'
import { MonitoringCardHeader } from '@/components/monitoring-card/monitoring-card-header'
import { RssiBars } from '@/components/monitoring-card/rssi-bars'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useLieuMeasurements } from '@/hooks/useLieuMeasurements'
import { formatDbDateTime, parseDbDateTime } from '@/lib/date-display'
import type { LieuTypeValue } from '@/lib/lieu-types'
import { calculateYDomain, formatMeasureValue, getMeasureSummary, sortMeasuresChronologically } from '@/lib/measurements'
import { cn } from '@/lib/utils'
import { fadeInUp } from '@/lib/motion-variants'
import { markAlarmAcknowledgedInPaginatedSensorsCache } from '@/lib/surveillance-cache'
import type { SensorStatus } from '@/lib/surveillance-status'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface MonitoringCardProps {
  idLieu: number
  nomLieu: string
  currentValue?: number | null
  lastMeasurement?: Date | string | null
  sondeNumeroSerie?: string
  lieuEtat: string
  lieuType: LieuTypeValue
  siteName: string
  groupName: string
  status: SensorStatus
  alarmType?: 'H' | 'B' | 'N' | 'S' | 'A' | 'M' | 'T' | null
  alarmDisabled: boolean
  alarmDisabledUntil: Date | string | null
  alarmDelayMinutes: number | null
  alarmDelayHighMinutes?: number | null
  alarmDelayLowMinutes?: number | null
  noResponseDelayMinutes?: number | null
  consigneSupPreAlarme?: number | null
  estConsigneSupPreAlarmeActive?: boolean | null
  consigneInfPreAlarme?: number | null
  estConsigneInfPreAlarmeActive?: boolean | null
  locationComment?: string | null
  surveillanceDisabled: boolean
  surveillanceDisabledSince?: Date | string | null
  surveillanceDisabledUntil?: Date | string | null
  surveillanceDisabledBy?: string | null
  surveillanceDisabledComment?: string | null
  isGso?: boolean | null
  gsoRssi?: string | null
  batteryPercent?: number | null
  gsoTension?: string | null
  alarmId?: number | null
  onEditLocation?: (idLieu: number) => void
  onDetailsModalStateChange?: (idLieu: number, open: boolean) => void
  backgroundPaused?: boolean
  onSurveillanceToggle: (
    idLieu: number,
    action: 'surveillance' | 'alarms',
    newState: boolean,
    durationMinutes: number | null,
    actionComment?: string | null,
  ) => void
  requireActionComment?: boolean
  showNullNonResponse?: boolean
}

export default function MonitoringCard({
  idLieu,
  nomLieu,
  currentValue = null,
  lastMeasurement = null,
  sondeNumeroSerie = '',
  lieuEtat,
  lieuType,
  siteName,
  groupName,
  status = 'ok',
  alarmType = null,
  alarmDisabled,
  alarmDisabledUntil,
  alarmDelayMinutes,
  alarmDelayHighMinutes,
  alarmDelayLowMinutes,
  noResponseDelayMinutes,
  consigneSupPreAlarme,
  estConsigneSupPreAlarmeActive,
  consigneInfPreAlarme,
  estConsigneInfPreAlarmeActive,
  locationComment,
  surveillanceDisabled,
  surveillanceDisabledSince = null,
  surveillanceDisabledUntil = null,
  surveillanceDisabledBy = null,
  surveillanceDisabledComment = null,
  isGso,
  gsoRssi,
  batteryPercent,
  gsoTension,
  alarmId = null,
  onEditLocation,
  onDetailsModalStateChange,
  backgroundPaused = false,
  onSurveillanceToggle,
  requireActionComment = false,
  showNullNonResponse = false,
}: MonitoringCardProps) {
  const t = useTranslations('monitoringCard')
  const tStatus = useTranslations('surveillanceStatus')
  const { hasPermission } = useAppAccess()
  const isMobile = useIsMobile()
  const locale = useLocale()
  const localeTag = locale === 'fr' ? 'fr-FR' : locale
  const queryClient = useQueryClient()
  const shouldLoadCardMeasurements = !isMobile && !backgroundPaused
  const translateOrFallback = (key: string, fallback: string) => {
    try {
      const translated = t(key)
      if (!translated || translated === key || translated === `monitoringCard.${key}`) {
        return fallback
      }
      return translated
    } catch {
      return fallback
    }
  }

  const { data, isLoading, reload, meta } = useLieuMeasurements(idLieu, {
    enabled: shouldLoadCardMeasurements,
    includeMeta: true,
    source: "mesures",
    includeNullNonResponse: showNullNonResponse,
  })

  const orderedData = useMemo(() => sortMeasuresChronologically(data), [data])
  const liveMeasurementDate = useMemo(() => {
    if (!lastMeasurement) return null
    const parsed = parseDbDateTime(lastMeasurement)
    if (!parsed) return null
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }, [lastMeasurement])

  const previewData = useMemo(() => {
    if (!liveMeasurementDate) return orderedData
    const lastPoint = orderedData[orderedData.length - 1]
    const lastPointDate = lastPoint?.DateHeureMesureIso ? parseDbDateTime(lastPoint.DateHeureMesureIso) : null
    const isLiveNullNonResponse = currentValue === null && (alarmType === "N" || alarmType === "M" || status === "technical")

    if (currentValue === null && !isLiveNullNonResponse) {
      return orderedData
    }

    const template = lastPoint ?? null
    const timeLabel = new Intl.DateTimeFormat(localeTag, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(liveMeasurementDate)

    const dateLabel = formatDbDateTime(liveMeasurementDate, { withSeconds: false })
    const livePoint = {
      id: `live-${idLieu}-${liveMeasurementDate.toISOString()}`,
      Valeur: currentValue,
      Nb_Decimal: template?.Nb_Decimal ?? null,
      Unite: template?.Unite ?? "??C",
      DateHeureMesure: dateLabel,
      DateHeureMesureIso: liveMeasurementDate.toISOString(),
      DateHeureMesureXaxis: timeLabel,
      Consigne: template?.Consigne ?? null,
      Consigne_Sup: template?.Consigne_Sup ?? null,
      Consigne_Inf: template?.Consigne_Inf ?? null,
      SondeNumeroSerie: template?.SondeNumeroSerie ?? sondeNumeroSerie,
      Frequence: template?.Frequence ?? 15,
      Est_Valeur_Null: isLiveNullNonResponse,
      Etat_Alarme: template?.Etat_Alarme ?? 0,
    }

    const hasSameTimestampAsLastPoint =
      !!lastPointDate &&
      !Number.isNaN(lastPointDate.getTime()) &&
      liveMeasurementDate.getTime() === lastPointDate.getTime()

    const hasDifferentValueThanLastPoint =
      !!lastPoint &&
      ((lastPoint.Valeur ?? null) !== (currentValue ?? null) ||
        Boolean(lastPoint.Est_Valeur_Null) !== Boolean(isLiveNullNonResponse))

    if (hasSameTimestampAsLastPoint && hasDifferentValueThanLastPoint) {
      return [...orderedData.slice(0, -1), livePoint]
    }

    if (lastPointDate && !Number.isNaN(lastPointDate.getTime()) && liveMeasurementDate <= lastPointDate) {
      return orderedData
    }

    return [...orderedData, livePoint]
  }, [alarmType, currentValue, idLieu, liveMeasurementDate, localeTag, orderedData, sondeNumeroSerie, status])

  const summary = useMemo(() => getMeasureSummary(previewData), [previewData])
  const { consigneSup, consigneInf, consigne, unite, frequence, lastMeasureText, lastDateTime, decimals, lastValue } = summary

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false)
  const [ackComment, setAckComment] = useState('')
  const [actionComment, setActionComment] = useState('')
  const [actionCommentError, setActionCommentError] = useState<string | null>(null)
  const [disableDuration, setDisableDuration] = useState<string>('60')
  const [actionType, setActionType] = useState<'surveillance' | 'alarms'>('surveillance')
  const [isSurveillanceActive, setIsSurveillanceActive] = useState(surveillanceDisabled !== undefined ? !surveillanceDisabled : lieuEtat !== 'D')
  const [isAlarmActive, setIsAlarmActive] = useState(!alarmDisabled)
  const [locallyAcknowledgedAlarmId, setLocallyAcknowledgedAlarmId] = useState<number | null>(null)

  const effectiveAlarmId = locallyAcknowledgedAlarmId !== null && alarmId === locallyAcknowledgedAlarmId ? null : alarmId
  const effectiveAlarmType = locallyAcknowledgedAlarmId !== null && alarmId === locallyAcknowledgedAlarmId ? null : alarmType
  const effectiveStatus = locallyAcknowledgedAlarmId !== null && alarmId === locallyAcknowledgedAlarmId ? 'ok' : status
  const resolvedLieuType = lieuType ?? meta?.lieuType ?? null

  useEffect(() => {
    const syncTimer = window.setTimeout(() => {
      if (surveillanceDisabled !== undefined) {
        setIsSurveillanceActive(!surveillanceDisabled)
        return
      }
      setIsSurveillanceActive(lieuEtat !== 'D')
    }, 0)

    return () => {
      window.clearTimeout(syncTimer)
    }
  }, [lieuEtat, surveillanceDisabled])

  useEffect(() => {
    const syncTimer = window.setTimeout(() => {
      setIsAlarmActive(!alarmDisabled)
    }, 0)

    return () => {
      window.clearTimeout(syncTimer)
    }
  }, [alarmDisabled])

  useEffect(() => {
    if (isModalOpen) reload(true)
  }, [isModalOpen, reload])

  useEffect(() => {
    onDetailsModalStateChange?.(idLieu, isModalOpen)
    return () => {
      if (isModalOpen) {
        onDetailsModalStateChange?.(idLieu, false)
      }
    }
  }, [idLieu, isModalOpen, onDetailsModalStateChange])

  const handleAcknowledgeOpen = useCallback(() => {
    setAckComment('')
    setShowAcknowledgeModal(true)
  }, [])

  const confirmSurveillanceToggle = () => {
    if (!hasPermission('LOCATION_DISABLE_ACCESS')) {
      setShowConfirmModal(false)
      return
    }

    const normalizedActionComment = actionComment.trim()
    if (requireActionComment && normalizedActionComment.length === 0) {
      const message = t('confirm.action_comment.required_error')
      setActionCommentError(message)
      return
    }

    const isDisabling = actionType === 'surveillance' ? isSurveillanceActive : isAlarmActive
    const durationMinutes = isDisabling ? (disableDuration === 'manual' ? null : Number(disableDuration)) : null

    if (actionType === 'surveillance') {
      const nextState = !isSurveillanceActive
      onSurveillanceToggle(idLieu, 'surveillance', nextState, durationMinutes, normalizedActionComment || null)
    } else {
      const nextState = !isAlarmActive
      onSurveillanceToggle(idLieu, 'alarms', nextState, durationMinutes, normalizedActionComment || null)
    }

    setActionComment('')
    setActionCommentError(null)
    setShowConfirmModal(false)
  }

  const [yMin, yMax] = useMemo(
    () => calculateYDomain(previewData, { consigneSup, consigneInf, consigne }),
    [consigne, consigneInf, consigneSup, previewData],
  )

  const surveillanceDisabledLabel = useMemo(() => {
    if (isSurveillanceActive) return null
    if (surveillanceDisabledUntil) {
      const untilDate = parseDbDateTime(surveillanceDisabledUntil)
      if (untilDate && !Number.isNaN(untilDate.getTime())) {
        return translateOrFallback(
          "surveillance.disabled_until",
          `Surveillance desactivee jusqu'au ${formatDbDateTime(untilDate, { withSeconds: false })}`,
        ).replace(
          "{date}",
          formatDbDateTime(untilDate, { withSeconds: false }),
        )
      }
    }
    if (!surveillanceDisabledSince) return t('surveillance.disabled')
    const date = parseDbDateTime(surveillanceDisabledSince)
    if (!date) return t('surveillance.disabled')
    if (Number.isNaN(date.getTime())) return t('surveillance.disabled')
    const formattedDate = formatDbDateTime(date, { withSeconds: false })
    if (surveillanceDisabledBy) {
      const template = translateOrFallback(
        'surveillance.disabled_since_by',
        'Surveillance desactivee depuis le {date} par {user}',
      )
      return template.replace('{date}', formattedDate).replace('{user}', surveillanceDisabledBy)
    }
    return translateOrFallback('surveillance.disabled_since', 'Surveillance desactivee depuis le {date}').replace(
      '{date}',
      formattedDate,
    )
  }, [isSurveillanceActive, surveillanceDisabledBy, surveillanceDisabledSince, surveillanceDisabledUntil, t])
  const alarmDisabledLabel = useMemo(() => {
    if (isAlarmActive) return null
    if (!alarmDisabledUntil) return t('alarms.disabled')
    const date = parseDbDateTime(alarmDisabledUntil)
    if (!date) return t('alarms.disabled')
    if (Number.isNaN(date.getTime())) return t('alarms.disabled')
    return t('alarms.disabled_until', { date: formatDbDateTime(date, { withSeconds: false }) })
  }, [alarmDisabledUntil, isAlarmActive, t])

  const contentTextClassName = 'text-muted-foreground'
  const actionButtonClassName = 'hover:bg-muted'
  const actionIconClassName = 'text-muted-foreground'

  const canAcknowledge =
    hasPermission('ALARM_ACK_ACCESS') &&
    isSurveillanceActive &&
    effectiveAlarmId !== null &&
    effectiveAlarmId !== undefined &&
    (effectiveStatus === 'critical' || effectiveStatus === 'technical' || effectiveStatus === 'ended')
  const canToggleSurveillance = hasPermission('LOCATION_DISABLE_ACCESS')
  const canEditLocation = hasPermission('LOCATION_CONFIG_ACCESS')

  const frequencyMinutes = useMemo(() => {
    if (isGso) return 15
    if (!frequence || frequence <= 0) return null
    return Math.round(frequence / 60)
  }, [frequence, isGso])

  const chartDatasets = useMemo(() => {
    const datasets = [
      {
        label: t('chart.upper_threshold', { unit: unite }),
        data: previewData.map((point) => point.Consigne_Sup),
        borderColor: 'rgba(239, 68, 68, 0.8)',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        fill: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
        borderDash: [6, 4],
        order: 0,
      },
      {
        label: t('chart.target', { unit: unite }),
        data: previewData.map((point) => point.Consigne),
        borderColor: '#111827',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        fill: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
        order: 0,
      },
      {
        label: t('chart.lower_threshold', { unit: unite }),
        data: previewData.map((point) => point.Consigne_Inf),
        borderColor: 'rgba(239, 68, 68, 0.8)',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        fill: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
        borderDash: [6, 4],
        order: 0,
      },
    ]

    if (estConsigneSupPreAlarmeActive && consigneSupPreAlarme !== null && consigneSupPreAlarme !== undefined) {
      datasets.push({
        label: t('chart.upper_pre_alarm', { unit: unite }),
        data: previewData.map(() => consigneSupPreAlarme),
        borderColor: 'rgba(245, 158, 11, 0.8)',
        backgroundColor: 'transparent',
        borderWidth: 1.25,
        fill: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
        borderDash: [2, 3],
        order: 0,
      })
    }

    if (estConsigneInfPreAlarmeActive && consigneInfPreAlarme !== null && consigneInfPreAlarme !== undefined) {
      datasets.push({
        label: t('chart.lower_pre_alarm', { unit: unite }),
        data: previewData.map(() => consigneInfPreAlarme),
        borderColor: 'rgba(245, 158, 11, 0.8)',
        backgroundColor: 'transparent',
        borderWidth: 1.25,
        fill: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
        borderDash: [2, 3],
        order: 0,
      })
    }

    datasets.push({
      label: t('chart.measures', { unit: unite }),
      data: previewData.map((point) => point.Valeur),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 1.5,
      fill: false,
      tension: 0,
      pointRadius: 1.25,
      pointHoverRadius: 3,
      order: 1,
    })

    return datasets
  }, [
    consigneInfPreAlarme,
    consigneSupPreAlarme,
    estConsigneInfPreAlarmeActive,
    estConsigneSupPreAlarmeActive,
    previewData,
    t,
    unite,
  ])

  const formattedConsigne = useMemo(() => formatMeasureValue(consigne, decimals, localeTag), [consigne, decimals, localeTag])
  const formattedConsigneSup = useMemo(() => formatMeasureValue(consigneSup, decimals, localeTag), [consigneSup, decimals, localeTag])
  const formattedConsigneInf = useMemo(() => formatMeasureValue(consigneInf, decimals, localeTag), [consigneInf, decimals, localeTag])
  const formattedLastValue = useMemo(() => formatMeasureValue(lastValue, decimals, localeTag), [lastValue, decimals, localeTag])
  const hasWirelessMetrics = Boolean(gsoRssi || gsoTension || batteryPercent !== null && batteryPercent !== undefined)
  const isOnBatteryPower = effectiveAlarmType === 'S'
  const gsoBatteryState = useMemo(() => {
    if (!isGso || !gsoTension) return null
    const normalized = gsoTension.replace(',', '.').replace(/[^0-9.\-]/g, '')
    const voltage = Number.parseFloat(normalized)
    if (!Number.isFinite(voltage)) return null
    const formattedVoltage = voltage.toFixed(2)
    const translateBatteryState = (
      key: 'gso.battery_state.ok' | 'gso.battery_state.medium' | 'gso.battery_state.low',
      fallbackPrefix: string,
    ) => {
      try {
        const translated = t(key, { value: formattedVoltage })
        if (
          translated &&
          translated !== key &&
          translated !== `monitoringCard.${key}` &&
          !translated.includes('battery_state.')
        ) {
          return translated
        }
      } catch {
        // Fallback below keeps the card readable even if the translation key is missing at runtime.
      }
      return `${fallbackPrefix} (${formattedVoltage}V)`
    }
    if (voltage >= 2.9) {
      return translateBatteryState('gso.battery_state.ok', 'Etat batterie : OK')
    }
    if (voltage >= 2.65) {
      return translateBatteryState('gso.battery_state.medium', 'Etat batterie : Moyen')
    }
    return translateBatteryState('gso.battery_state.low', 'Etat batterie : Faible')
  }, [gsoTension, isGso, t])

  const cardGlowClass = (() => {
    if (!isSurveillanceActive) return "opacity-75"
    if (effectiveStatus === "critical" || effectiveStatus === "technical")
      return "ring-1 ring-red-500/30 shadow-[0_4px_24px_-6px_rgba(239,68,68,0.35)]"
    if (effectiveStatus === "warning")
      return "ring-1 ring-amber-500/20 shadow-[0_4px_20px_-6px_rgba(245,158,11,0.25)]"
    return ""
  })()

  const acknowledgeDialogAlarm: AcknowledgeDialogAlarm | null = canAcknowledge && effectiveAlarmId
    ? {
        id: String(effectiveAlarmId),
        locationId: String(idLieu),
        locationName: nomLieu,
        sensorName: sondeNumeroSerie || nomLieu,
        type:
          effectiveAlarmType === 'H'
            ? 'high'
            : effectiveAlarmType === 'B'
              ? 'low'
              : effectiveAlarmType === 'N'
                ? 'no-response'
                : effectiveAlarmType === 'S'
                  ? 'sector'
                  : effectiveAlarmType === 'M'
                    ? 'module'
                : effectiveStatus === 'ended' || effectiveAlarmType === 'T'
                  ? 'ended'
                  : undefined,
        currentValue: typeof lastValue === 'number' ? lastValue : null,
        value: typeof lastValue === 'number' ? lastValue : null,
        unit: unite,
        minThreshold: consigneInf,
        maxThreshold: consigneSup,
      }
    : null

  return (
    <>
    <m.div
        variants={fadeInUp}
        className={cn(
          "relative w-full rounded-lg border overflow-hidden flex flex-col transition-all duration-200",
          "hover:shadow-lg hover:-translate-y-0.5",
          isSurveillanceActive
            ? "bg-card border-border shadow-sm"
            : "bg-muted/60 dark:bg-muted/40 border-muted-foreground/20",
          cardGlowClass,
        )}
      >
        <MonitoringCardHeader
          status={effectiveStatus}
          effectiveAlarmType={effectiveAlarmType}
          isSurveillanceActive={isSurveillanceActive}
          lieuEtat={lieuEtat}
          siteName={siteName}
          groupName={groupName}
          nomLieu={nomLieu}
          sondeNumeroSerie={sondeNumeroSerie || ""}
          locationComment={locationComment}
          lieuType={resolvedLieuType}
          surveillanceDisabledLabel={surveillanceDisabledLabel}
          alarmDisabledLabel={alarmDisabledLabel}
          canAcknowledge={canAcknowledge}
          onAcknowledge={handleAcknowledgeOpen}
          t={t}
          tStatus={tStatus}
        />

        <div className="p-4 flex flex-col flex-1">
          {isSurveillanceActive ? (
            <>
              <div className="cursor-pointer relative" onClick={() => setIsModalOpen(true)}>
                {isMobile ? (
                  <div className="py-2 text-center">
                    <p className="text-xs text-muted-foreground">{t('mobile.small_hint')}</p>
                  </div>
                ) : backgroundPaused ? (
                  <div className="flex h-32.5 items-center justify-center rounded-md border border-dashed border-border/60 bg-muted/20 text-xs text-muted-foreground">
                    {t('details.loading_hint')}
                  </div>
                ) : (
                  <MonitoringCardChartPreview
                    isLoading={isLoading}
                    orderedData={previewData}
                    chartDatasets={chartDatasets}
                    yMin={yMin}
                    yMax={yMax}
                    consigne={consigne}
                    consigneSup={consigneSup}
                    consigneInf={consigneInf}
                    formattedConsigne={formattedConsigne}
                    formattedConsigneSup={formattedConsigneSup}
                    formattedConsigneInf={formattedConsigneInf}
                    unite={unite}
                  />
                )}
              </div>

              <div className="mt-auto space-y-3 text-sm border-t border-border pt-3">
                {lastDateTime ? (
                  <>
                    <div className={`flex flex-col gap-1 text-[12px] font-semibold ${contentTextClassName}`}>
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <span className="min-w-0 truncate cursor-help">
                            {t('last_measure.label', { value: formattedLastValue ? `${formattedLastValue}${unite}` : lastMeasureText })}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">{t('last_measure.label', { value: formattedLastValue ? `${formattedLastValue}${unite}` : lastMeasureText })}</p>
                          <p className="text-xs text-muted-foreground">{lastDateTime}</p>
                        </TooltipContent>
                      </UITooltip>
                      <span className="text-[11px] font-medium text-muted-foreground">{lastDateTime}</span>
                    </div>
                    {hasWirelessMetrics ? (
                        <div className={`flex flex-wrap items-center justify-center gap-4 text-[11px] ${contentTextClassName}`}>
                          {gsoRssi ? <RssiBars value={gsoRssi} label={t('gso.rssi', { value: gsoRssi })} /> : null}
                          {batteryPercent !== null && batteryPercent !== undefined ? <span>{t('wireless.battery', { value: batteryPercent })}</span> : null}
                          {gsoBatteryState ? <span>{gsoBatteryState}</span> : gsoTension ? <span>{t('gso.tension', { value: gsoTension })}</span> : null}
                        </div>
                    ) : null}
                    {isOnBatteryPower ? (
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[11px] font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-200">
                          <BatteryWarning className="h-3.5 w-3.5" />
                          {t('wireless.on_battery')}
                        </span>
                      </div>
                    ) : null}
                    <div className={`flex items-center justify-center gap-4 text-[11px] ${contentTextClassName}`}>
                      <span>{t('frequency', { minutes: frequencyMinutes ?? '-' })}</span>
                      {(alarmDelayHighMinutes !== null && alarmDelayHighMinutes !== undefined) ||
                      (alarmDelayLowMinutes !== null && alarmDelayLowMinutes !== undefined) ||
                      (noResponseDelayMinutes !== null && noResponseDelayMinutes !== undefined) ? (
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help underline decoration-dotted underline-offset-2">{t('alarm_delay_hover.summary')}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-1 text-xs">
                              <p>{t('alarm_delay_hover.high', { minutes: alarmDelayHighMinutes ?? '-' })}</p>
                              <p>{t('alarm_delay_hover.low', { minutes: alarmDelayLowMinutes ?? '-' })}</p>
                              <p>{t('alarm_delay_hover.no_response', { minutes: noResponseDelayMinutes ?? '-' })}</p>
                            </div>
                          </TooltipContent>
                        </UITooltip>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground italic py-3">{t('no_measurements')}</div>
                )}
              </div>
            </>
          ) : (
            <div className={`space-y-1 text-sm ${contentTextClassName}`}>
              <div className="font-medium">{surveillanceDisabledLabel ?? t('surveillance.disabled')}</div>
              {surveillanceDisabledComment || locationComment ? (
                <p className="line-clamp-3 text-xs text-muted-foreground">{surveillanceDisabledComment ?? locationComment}</p>
              ) : null}
            </div>
          )}

          <div className={`mt-4 border-t border-border pt-3 ${isSurveillanceActive ? '' : 'border-white/20'}`}>
            <TooltipProvider>
              <div className="flex justify-center gap-4">
                <UITooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <button
                        onClick={(event) => {
                          event.stopPropagation()
                          if (!canToggleSurveillance) return
                          setActionType('surveillance')
                          setActionComment('')
                          setActionCommentError(null)
                          setShowConfirmModal(true)
                        }}
                        className={`p-1 rounded-md transition-colors ${actionButtonClassName} ${isSurveillanceActive ? 'text-red-600' : 'text-green-600 dark:text-green-400'} ${canToggleSurveillance ? '' : 'cursor-not-allowed opacity-40'}`}
                        disabled={!canToggleSurveillance}
                      >
                        {isSurveillanceActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{canToggleSurveillance ? t('actions.toggle') : t('actions.toggle_forbidden')}</p>
                  </TooltipContent>
                </UITooltip>

                <UITooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <button
                        onClick={(event) => { event.stopPropagation(); onEditLocation?.(idLieu) }}
                        className={`p-1 rounded-md transition-colors ${actionButtonClassName} ${canEditLocation ? "" : "cursor-not-allowed opacity-40"}`}
                        disabled={!canEditLocation}
                      >
                        <Settings className={`w-4 h-4 ${actionIconClassName}`} />
                      </button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {canEditLocation ? t('actions.settings') : t('actions.settings_forbidden')}
                    </p>
                  </TooltipContent>
                </UITooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </m.div>

      <Dialog
        open={showConfirmModal}
        onOpenChange={(open) => {
          setShowConfirmModal(open)
          if (!open) {
            setActionComment('')
            setActionCommentError(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('confirm.title')}</DialogTitle>
            <DialogDescription>
              {actionType === 'surveillance'
                ? t('confirm.description_surveillance', { action: isSurveillanceActive ? t('confirm.action_disable') : t('confirm.action_enable') })
                : t('confirm.description_alarms', { action: isAlarmActive ? t('confirm.action_disable') : t('confirm.action_enable') })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('confirm.action_type.label')}</label>
            <Select value={actionType} onValueChange={(value) => setActionType(value as 'surveillance' | 'alarms')}>
              <SelectTrigger><SelectValue placeholder={t('confirm.action_type.placeholder')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="surveillance">{t('confirm.action_type.options.surveillance')}</SelectItem>
                <SelectItem value="alarms">{t('confirm.action_type.options.alarms')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(actionType === 'surveillance' ? isSurveillanceActive : isAlarmActive) ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('confirm.disable_duration.label')}</label>
              <Select value={disableDuration} onValueChange={setDisableDuration}>
                <SelectTrigger><SelectValue placeholder={t('confirm.disable_duration.placeholder')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">{t('confirm.disable_duration.options.15')}</SelectItem>
                  <SelectItem value="60">{t('confirm.disable_duration.options.60')}</SelectItem>
                  <SelectItem value="240">{t('confirm.disable_duration.options.240')}</SelectItem>
                  <SelectItem value="720">{t('confirm.disable_duration.options.720')}</SelectItem>
                  <SelectItem value="manual">{t('confirm.disable_duration.options.manual')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-2">
            <label htmlFor={`monitoring-action-comment-${idLieu}`} className="text-sm font-medium">
              {translateOrFallback('confirm.action_comment.label', 'Commentaire')}
              {requireActionComment ? ' *' : ''}
            </label>
            <Textarea
              id={`monitoring-action-comment-${idLieu}`}
              rows={3}
              maxLength={500}
              value={actionComment}
              onChange={(event) => {
                setActionComment(event.target.value)
                if (actionCommentError) {
                  setActionCommentError(null)
                }
              }}
              placeholder={translateOrFallback(
                requireActionComment
                  ? 'confirm.action_comment.placeholder_required'
                  : 'confirm.action_comment.placeholder_optional',
                requireActionComment
                  ? 'Ajouter un commentaire (obligatoire)'
                  : 'Ajouter un commentaire (optionnel)',
              )}
            />
            {actionCommentError ? (
              <p className="text-xs text-destructive">{actionCommentError}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>{t('confirm.cancel')}</Button>
            <Button variant={(actionType === 'surveillance' ? isSurveillanceActive : isAlarmActive) ? 'destructive' : 'default'} onClick={confirmSurveillanceToggle}>{t('confirm.confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isModalOpen ? (
        <MonitoringDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          idLieu={idLieu}
          nomLieu={nomLieu}
          sondeNumeroSerie={sondeNumeroSerie || ''}
          isGso={isGso ?? null}
          gsoRssi={gsoRssi ?? null}
          batteryPercent={batteryPercent ?? null}
          gsoTension={gsoTension ?? null}
          consigneSup={consigneSup}
          consigneInf={consigneInf}
          consigne={consigne}
          consigneSupPreAlarme={consigneSupPreAlarme ?? null}
          estConsigneSupPreAlarmeActive={estConsigneSupPreAlarmeActive ?? false}
          consigneInfPreAlarme={consigneInfPreAlarme ?? null}
          estConsigneInfPreAlarmeActive={estConsigneInfPreAlarmeActive ?? false}
          unite={unite}
          isSurveillanceActive={isSurveillanceActive}
          measurements={isSurveillanceActive && shouldLoadCardMeasurements ? previewData : []}
          showNullNonResponse={showNullNonResponse}
        />
      ) : null}

      <AlarmAcknowledgeDialog
        open={showAcknowledgeModal}
        alarm={acknowledgeDialogAlarm}
        onOpenChange={(open) => {
          setShowAcknowledgeModal(open)
          if (!open) setAckComment('')
        }}
        onConfirm={async (ackAlarmIds, commentValue, options) => {
          try {
            for (const ackAlarmId of ackAlarmIds) {
              const response = await fetch(`/api/alarmes/${ackAlarmId}/acknowledge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment: commentValue || ackComment || undefined }),
              })
              if (!response.ok) {
                console.error('Acknowledge alarm error', await response.text())
                return
              }
              const acknowledgedId = Number(ackAlarmId)
              if (Number.isFinite(acknowledgedId)) {
                setLocallyAcknowledgedAlarmId(acknowledgedId)
                markAlarmAcknowledgedInPaginatedSensorsCache(queryClient, acknowledgedId)
              }
            }
            if (options?.closeAfter !== false) {
              setShowAcknowledgeModal(false)
              setAckComment('')
            }
            reload(true)
          } catch (error) {
            console.error('Acknowledge alarm error', error)
          }
        }}
      />
    </>
  )
}
