import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Chart as ChartJS, CategoryScale, Filler, Legend, LineElement, LinearScale, PointElement, Title, Tooltip } from 'chart.js'
import { BatteryWarning, Clock, History, Info, Power, PowerOff, Settings } from 'lucide-react'
import { m } from 'motion/react'

import { useAppAccess } from '@/components/access/app-access-provider'
import MonitoringDetailsModal from '@/components/monitoring-details-modal'
import { MonitoringCardChartPreview } from '@/components/monitoring-card/monitoring-card-chart-preview'
import { MonitoringCardHeader } from '@/components/monitoring-card/monitoring-card-header'
import { BatteryIndicator, getBatteryIndicatorState } from '@/components/monitoring-card/battery-indicator'
import { RssiBars } from '@/components/monitoring-card/rssi-bars'
import { getRssiLevel, parseRssiValue } from '@/components/monitoring-card/rssi'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useLieuMeasurements } from '@/hooks/useLieuMeasurements'
import {
  formatStoredDbDateTime,
  parseDbDateTime,
  parseStoredDbDateTime,
  serializeStoredDbDateTime,
} from '@/lib/date-display'
import { getTypeIcon, type LieuTypeValue } from '@/lib/lieu-types'
import { calculateYDomain, formatMeasureValue, getMeasureSummary, sortMeasuresChronologically } from '@/lib/measurements'
import { MONITORING_CARD_GRAPH_MAX_POINTS } from '@/lib/measurement-downsampling'
import { cn } from '@/lib/utils'
import { fadeInUp } from '@/lib/motion-variants'
import type { SensorStatus } from '@/lib/surveillance-status'
import type { AlarmTypeCode } from '@/lib/alarm-types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface MonitoringCardProps {
  idLieu: number
  nomLieu: string
  currentValue?: number | null
  unit?: string | null
  lastMeasurement?: Date | string | null
  sondeNumeroSerie?: string
  lieuEtat: string
  lieuType: LieuTypeValue
  siteName: string
  groupName: string
  status: SensorStatus
  alarmType?: AlarmTypeCode | null
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
  unit = null,
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
  const tDetails = useTranslations('monitoringDetailsModal')
  const { hasPermission } = useAppAccess()
  const isMobile = useIsMobile()
  const locale = useLocale()
  const localeTag = locale === 'fr' ? 'fr-FR' : locale
  const router = useRouter()
  const isAdjustmentInProgress = lieuEtat === 'A'
  const shouldLoadCardMeasurements = !isMobile && !backgroundPaused && !isAdjustmentInProgress

  const { data, isLoading, reload, meta } = useLieuMeasurements(idLieu, {
    enabled: shouldLoadCardMeasurements,
    includeMeta: true,
    source: "graphique",
    includeNullNonResponse: showNullNonResponse,
    rollingHours: 24,
    graphMaxPoints: MONITORING_CARD_GRAPH_MAX_POINTS,
  })

  const orderedData = useMemo(() => sortMeasuresChronologically(data), [data])
  const chartRangeStartMs = useMemo(
    () => parseDbDateTime(meta?.graphRangeStart ?? null)?.getTime() ?? 0,
    [meta?.graphRangeStart],
  )
  const chartRangeEndMs = useMemo(
    () => parseDbDateTime(meta?.graphRangeEnd ?? null)?.getTime() ?? 1,
    [meta?.graphRangeEnd],
  )
  const liveMeasurementIso = useMemo(
    () => serializeStoredDbDateTime(lastMeasurement),
    [lastMeasurement],
  )
  const liveMeasurementDate = useMemo(
    () => (liveMeasurementIso ? parseDbDateTime(liveMeasurementIso) : null),
    [liveMeasurementIso],
  )

  const previewData = useMemo(() => {
    if (!liveMeasurementDate) return orderedData
    const lastPoint = orderedData[orderedData.length - 1]
    const lastPointDate = lastPoint?.DateHeureMesureIso
      ? parseStoredDbDateTime(lastPoint.DateHeureMesureIso)
      : null
    const isLiveNullNonResponse = currentValue === null && (alarmType === "N" || alarmType === "M" || status === "technical")

    if (currentValue === null && !isLiveNullNonResponse) {
      return orderedData
    }

    const template = lastPoint ?? null
    const serializedDate = liveMeasurementIso ?? ""
    const timeLabel = formatStoredDbDateTime(serializedDate, {
      format: "time",
      locale: localeTag,
    })
    const dateLabel = formatStoredDbDateTime(serializedDate, { format: "dateTime" })
    const livePoint = {
      id: `live-${idLieu}-${serializedDate}`,
      Valeur: currentValue,
      Nb_Decimal: template?.Nb_Decimal ?? null,
      Unite: template?.Unite ?? unit ?? "°C",
      DateHeureMesure: dateLabel,
      DateHeureMesureIso: serializedDate,
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
  }, [alarmType, currentValue, idLieu, liveMeasurementDate, liveMeasurementIso, localeTag, orderedData, sondeNumeroSerie, status, unit])

  const summary = useMemo(() => getMeasureSummary(previewData), [previewData])
  const { consigneSup, consigneInf, consigne, unite, frequence, lastMeasureText, lastDateTime, decimals, lastValue } = summary

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [actionComment, setActionComment] = useState('')
  const [actionCommentError, setActionCommentError] = useState<string | null>(null)
  const [disableDuration, setDisableDuration] = useState<string>('60')
  const [actionType, setActionType] = useState<'surveillance' | 'alarms'>('surveillance')
  const [isSurveillanceActive, setIsSurveillanceActive] = useState(surveillanceDisabled !== undefined ? !surveillanceDisabled : lieuEtat !== 'D')
  const [isAlarmActive, setIsAlarmActive] = useState(!alarmDisabled)

  const effectiveAlarmId = alarmId
  const effectiveAlarmType = alarmType
  const effectiveStatus = status
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
    if (!effectiveAlarmId) return
    router.push(
      `/${locale}/alarmes/analyse?locationId=${encodeURIComponent(String(idLieu))}&alarmId=${encodeURIComponent(String(effectiveAlarmId))}`,
    )
  }, [effectiveAlarmId, idLieu, locale, router])

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
      const formattedUntil = formatStoredDbDateTime(surveillanceDisabledUntil, {
        format: "dateTime",
        fallback: "",
      })
      if (formattedUntil) {
        return t('surveillance.disabled_until', { date: formattedUntil })
      }
    }
    if (!surveillanceDisabledSince) return t('surveillance.disabled')
    const formattedSince = formatStoredDbDateTime(surveillanceDisabledSince, {
      format: "dateTime",
      fallback: "",
    })
    if (!formattedSince) return t('surveillance.disabled')
    return t('surveillance.disabled_since', { date: formattedSince })
  }, [isSurveillanceActive, surveillanceDisabledSince, surveillanceDisabledUntil, t])

  const alarmDisabledLabel = useMemo(() => {
    if (isAlarmActive) return null
    if (!alarmDisabledUntil) return t('alarms.disabled')
    const formattedUntil = formatStoredDbDateTime(alarmDisabledUntil, {
      format: "dateTime",
      fallback: "",
    })
    if (!formattedUntil) return t('alarms.disabled')
    return t('alarms.disabled_until', { date: formattedUntil })
  }, [alarmDisabledUntil, isAlarmActive, t])

  const contentTextClassName = 'text-muted-foreground'
  const actionButtonClassName = 'hover:bg-muted'
  const actionIconClassName = 'text-muted-foreground'

  const canAcknowledge =
    hasPermission('ALARM_ACK_ACCESS') &&
    isSurveillanceActive &&
    !isAdjustmentInProgress &&
    effectiveAlarmId !== null &&
    effectiveAlarmId !== undefined &&
    (effectiveStatus === 'critical' || effectiveStatus === 'technical' || effectiveStatus === 'ended')
  const canToggleSurveillance = hasPermission('LOCATION_DISABLE_ACCESS') && !isAdjustmentInProgress
  const canEditLocation = hasPermission('LOCATION_CONFIG_ACCESS') && !isAdjustmentInProgress

  const frequencyMinutes = useMemo(() => {
    if (isGso) return 15
    if (!frequence || frequence <= 0) return null
    return Math.round(frequence / 60)
  }, [frequence, isGso])

  const measureStrokeColor =
    effectiveAlarmType === 'CH' || effectiveAlarmType === 'H'
      ? '#dc2626'
      : effectiveAlarmType === 'CB' || effectiveAlarmType === 'B'
        ? '#1d4ed8'
        : effectiveStatus === 'warning'
          ? '#d97706'
          : effectiveStatus === 'technical'
            ? '#111827'
            : effectiveStatus === 'ended'
              ? '#7c3aed'
              : '#0ea5e9'

  const measureFillColor =
    effectiveAlarmType === 'CH' || effectiveAlarmType === 'H'
      ? 'rgba(220, 38, 38, 0.10)'
      : effectiveAlarmType === 'CB' || effectiveAlarmType === 'B'
        ? 'rgba(29, 78, 216, 0.10)'
        : effectiveStatus === 'warning'
          ? 'rgba(217, 119, 6, 0.10)'
          : effectiveStatus === 'technical'
            ? 'rgba(17, 24, 39, 0.08)'
            : effectiveStatus === 'ended'
              ? 'rgba(124, 58, 237, 0.10)'
              : 'rgba(14, 165, 233, 0.10)'

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
      borderColor: measureStrokeColor,
      backgroundColor: measureFillColor,
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
    measureStrokeColor,
    measureFillColor,
  ])

  const formattedConsigne = useMemo(() => formatMeasureValue(consigne, decimals, localeTag), [consigne, decimals, localeTag])
  const formattedConsigneSup = useMemo(() => formatMeasureValue(consigneSup, decimals, localeTag), [consigneSup, decimals, localeTag])
  const formattedConsigneInf = useMemo(() => formatMeasureValue(consigneInf, decimals, localeTag), [consigneInf, decimals, localeTag])
  const formattedLastValue = useMemo(() => formatMeasureValue(lastValue, decimals, localeTag), [lastValue, decimals, localeTag])
  const hasBatteryMetric = Boolean(
    batteryPercent !== null && batteryPercent !== undefined || gsoTension,
  )
  const hasWirelessMetrics = Boolean(gsoRssi || hasBatteryMetric)
  const isOnBatteryPower = effectiveAlarmType === 'S'
  const batteryTooltipLabel = useMemo(() => {
    const labels: string[] = []
    if (batteryPercent !== null && batteryPercent !== undefined) {
      labels.push(t('wireless.battery', { value: batteryPercent }))
    }
    if (gsoTension) {
      labels.push(t('gso.tension', { value: gsoTension }))
    }
    return labels.join(' · ')
  }, [batteryPercent, gsoTension, t])

  const rssiLevel = getRssiLevel(parseRssiValue(gsoRssi ?? null))
  const rssiStateLabel =
    rssiLevel >= 5 ? t('wireless.signal_state.excellent')
      : rssiLevel === 4 ? t('wireless.signal_state.good')
        : rssiLevel === 3 ? t('wireless.signal_state.medium')
          : rssiLevel === 2 ? t('wireless.signal_state.weak')
            : rssiLevel === 1 ? t('wireless.signal_state.critical')
              : t('wireless.signal_state.unknown')
  const batteryState = getBatteryIndicatorState({ percent: batteryPercent, voltage: gsoTension })
  const batteryStateLabel =
    batteryState.severity === 'normal' ? t('wireless.battery_state.ok')
      : batteryState.severity === 'low' ? t('wireless.battery_state.low')
        : batteryState.severity === 'critical' ? t('wireless.battery_state.critical')
          : t('wireless.battery_state.unknown')

  const cardToneClass = (() => {
    if (!isSurveillanceActive) return "border-slate-300/80 bg-[hsl(var(--surface-muted))] opacity-80 dark:border-slate-700"
    if (effectiveAlarmType === 'CH' || effectiveAlarmType === 'H') return "border-red-300 dark:border-red-800/80"
    if (effectiveAlarmType === 'CB' || effectiveAlarmType === 'B') return "border-blue-300 dark:border-blue-800/80"
    if (effectiveAlarmType === 'N' || effectiveAlarmType === 'S' || effectiveAlarmType === 'A' || effectiveAlarmType === 'M') {
      return "border-slate-400 dark:border-slate-600"
    }
    if (effectiveAlarmType === 'T' || effectiveStatus === 'ended') return "border-violet-300 dark:border-violet-700"
    if (effectiveStatus === 'warning') return "border-amber-300 dark:border-amber-700"
    return "border-border"
  })()

  const contextLabel = `${siteName || t('site.unknown')}${groupName ? ` · ${groupName}` : ''}`
  const typeIconInfo = getTypeIcon(resolvedLieuType, 'h-3 w-3')
  const hasAlarmDelay =
    (alarmDelayHighMinutes !== null && alarmDelayHighMinutes !== undefined) ||
    (alarmDelayLowMinutes !== null && alarmDelayLowMinutes !== undefined) ||
    (noResponseDelayMinutes !== null && noResponseDelayMinutes !== undefined)

  return (
    <>
    <m.div
        variants={fadeInUp}
        className={cn(
          "group/card relative flex w-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm",
          "transition-[border-color,box-shadow] duration-200 ease-out hover:shadow-[0_8px_22px_-16px_hsl(var(--shadow)/0.34)]",
          cardToneClass,
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
          onOpenDetails={() => setIsModalOpen(true)}
          t={t}
          tStatus={tStatus}
        />

        <div className="flex flex-1 flex-col px-3 pb-2 pt-2">
          <div className="flex items-center gap-1.5">
            <p className="min-w-0 flex-1 truncate text-[11px] leading-4 text-[hsl(var(--subtle-foreground))]" title={contextLabel}>
              {contextLabel}
            </p>
            <UITooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="shrink-0 rounded-sm text-[hsl(var(--subtle-foreground))] transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                  aria-label={locationComment || t('observations.empty')}
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">{locationComment || t('observations.empty')}</p>
              </TooltipContent>
            </UITooltip>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!isAdjustmentInProgress) setIsModalOpen(true)
            }}
            disabled={isAdjustmentInProgress}
            className="mt-0.5 line-clamp-2 rounded-sm text-left text-[15px] font-semibold leading-5 tracking-[-0.005em] text-foreground decoration-primary/60 decoration-[1.5px] underline-offset-[3px] transition-colors duration-150 hover:text-[hsl(var(--primary-strong))] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:hover:text-foreground disabled:hover:no-underline"
          >
            {nomLieu}
          </button>

          <div className="flex min-w-0 items-center gap-1 text-[11px] leading-4 text-[hsl(var(--subtle-foreground))]">
            <span className="shrink-0" title={typeIconInfo.label}>{typeIconInfo.icon}</span>
            <span className="num truncate">
              {sondeNumeroSerie ? tDetails('sensor', { serial: sondeNumeroSerie }) : '—'}
            </span>
          </div>

          {(alarmDisabledLabel || lieuEtat === 'E') ? (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {alarmDisabledLabel ? (
                <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-[hsl(var(--surface-sunken))] px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground" title={alarmDisabledLabel}>
                  <PowerOff className="h-3 w-3 shrink-0" />
                  <span className="truncate">{alarmDisabledLabel}</span>
                </span>
              ) : null}
              {lieuEtat === 'E' ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[hsl(var(--status-warning)/0.10)] px-1.5 py-0.5 text-[10px] font-semibold text-[hsl(var(--status-warning-text))]">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {t('surveillance.calibration')}
                </span>
              ) : null}
            </div>
          ) : null}

          {isAdjustmentInProgress ? (
            <div className="mt-2.5 flex flex-1 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-primary/35 bg-[hsl(var(--primary-soft)/0.55)] px-3 py-5 text-center">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary motion-reduce:animate-none" aria-hidden="true" />
              <p className="text-[13px] font-semibold text-[hsl(var(--primary-strong))]">{t('surveillance.adjustment')}</p>
            </div>
          ) : !isSurveillanceActive ? (
            <div className="mt-2.5 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{surveillanceDisabledLabel ?? t('surveillance.disabled')}</p>
              {surveillanceDisabledComment || locationComment ? (
                <p className="line-clamp-3 text-xs text-muted-foreground">{surveillanceDisabledComment ?? locationComment}</p>
              ) : null}
            </div>
          ) : lastDateTime ? (
            <>
              <div className="mt-2 flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <span className="num text-[23px] font-semibold leading-none tracking-[-0.03em] text-foreground">
                    {formattedLastValue || '—'}
                  </span>
                  {formattedLastValue ? <span className="ml-0.5 text-xs font-medium text-muted-foreground">{unite}</span> : null}
                </div>
                <span className="num flex shrink-0 items-center gap-1 pb-0.5 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {lastDateTime}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                aria-label={t('actions.details')}
                title={t('actions.details')}
                className="-mx-1.5 mt-1.5 rounded-md border border-transparent px-1.5 py-1 text-left transition-[background-color,border-color] duration-150 hover:border-border hover:bg-[hsl(var(--surface-muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                {isMobile ? (
                  <div className="py-2 text-center">
                    <p className="text-xs text-muted-foreground">{t('mobile.small_hint')}</p>
                  </div>
                ) : backgroundPaused ? (
                  <div className="flex h-[64px] items-center justify-center rounded-md border border-dashed border-border/60 bg-muted/20 text-xs text-muted-foreground">
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
                    rangeStartMs={chartRangeStartMs}
                    rangeEndMs={chartRangeEndMs}
                  />
                )}
              </button>

              <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] leading-4 text-muted-foreground">
                <span className="num">{t('frequency', { minutes: frequencyMinutes ?? '-' })}</span>
                {hasAlarmDelay ? (
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

                {hasWirelessMetrics ? (
                  <span className="ml-auto inline-flex items-center gap-2">
                    {gsoRssi ? (
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center gap-1">
                            <RssiBars value={gsoRssi} label={t('gso.rssi', { value: gsoRssi })} />
                            <span className="sr-only">{rssiStateLabel}</span>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent><p className="text-xs">{t('gso.rssi', { value: gsoRssi })} · {rssiStateLabel}</p></TooltipContent>
                      </UITooltip>
                    ) : null}
                    {hasBatteryMetric && batteryTooltipLabel ? (
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center gap-1">
                            <BatteryIndicator percent={batteryPercent} voltage={gsoTension} label={batteryTooltipLabel} />
                            {gsoTension ? <span className="num text-[10px]">{gsoTension}V</span> : null}
                            <span className="sr-only">{batteryStateLabel}</span>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent><p className="text-xs">{batteryTooltipLabel} · {batteryStateLabel}</p></TooltipContent>
                      </UITooltip>
                    ) : null}
                  </span>
                ) : null}
              </div>

              {isOnBatteryPower ? (
                <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-md bg-[hsl(var(--status-sector)/0.10)] px-1.5 py-0.5 text-[10px] font-medium text-[hsl(var(--status-sector))]">
                  <BatteryWarning className="h-3.5 w-3.5" />
                  {t('wireless.on_battery')}
                </span>
              ) : null}
            </>
          ) : (
            <p className="mt-3 flex-1 py-3 text-center text-xs italic text-muted-foreground">{t('no_measurements')}</p>
          )}
        </div>

        <footer className="flex h-7 shrink-0 items-center justify-end gap-0.5 border-t border-border/70 px-1">
          {!isSurveillanceActive && !isAdjustmentInProgress ? (
            <UITooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className={`rounded-md p-1 transition-colors ${actionButtonClassName}`}
                >
                  <History className={`h-3.5 w-3.5 ${actionIconClassName}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">{t('actions.details')}</p></TooltipContent>
            </UITooltip>
          ) : null}

          <UITooltip>
            <TooltipTrigger asChild>
              <span>
                <button
                  type="button"
                  onClick={() => {
                    if (!canToggleSurveillance) return
                    setActionType('surveillance')
                    setActionComment('')
                    setActionCommentError(null)
                    setShowConfirmModal(true)
                  }}
                  className={cn(
                    'rounded-md p-1 transition-colors',
                    actionButtonClassName,
                    isSurveillanceActive ? 'hover:text-[hsl(var(--status-critical))]' : 'text-[hsl(var(--status-ok-text))]',
                    !canToggleSurveillance && 'cursor-not-allowed opacity-40',
                  )}
                  disabled={!canToggleSurveillance}
                >
                  {isSurveillanceActive ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                </button>
              </span>
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">{canToggleSurveillance ? t('actions.toggle') : t('actions.toggle_forbidden')}</p></TooltipContent>
          </UITooltip>

          <UITooltip>
            <TooltipTrigger asChild>
              <span>
                <button
                  type="button"
                  onClick={() => onEditLocation?.(idLieu)}
                  className={cn('rounded-md p-1 transition-colors', actionButtonClassName, !canEditLocation && 'cursor-not-allowed opacity-40')}
                  disabled={!canEditLocation}
                >
                  <Settings className={`h-3.5 w-3.5 ${actionIconClassName}`} />
                </button>
              </span>
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">{canEditLocation ? t('actions.settings') : t('actions.settings_forbidden')}</p></TooltipContent>
          </UITooltip>
        </footer>
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
              {t('confirm.action_comment.label')}
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
              placeholder={t(
                requireActionComment
                  ? 'confirm.action_comment.placeholder_required'
                  : 'confirm.action_comment.placeholder_optional',
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

      {isModalOpen && !isAdjustmentInProgress ? (
        <MonitoringDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          idLieu={idLieu}
          nomLieu={nomLieu}
          siteName={siteName}
          groupName={groupName}
          sondeNumeroSerie={sondeNumeroSerie || ''}
          currentValue={currentValue}
          lastMeasurement={lastMeasurement}
          status={effectiveStatus}
          alarmType={effectiveAlarmType}
          canAcknowledge={canAcknowledge}
          onAcknowledge={handleAcknowledgeOpen}
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
          showNullNonResponse={showNullNonResponse}
        />
      ) : null}

    </>
  )
}
