import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Chart as ChartJS, CategoryScale, Filler, Legend, LineElement, LinearScale, PointElement, Title, Tooltip } from 'chart.js'
import { FileText, MapPin, Power, PowerOff, Settings } from 'lucide-react'
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
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useLieuMeasurements } from '@/hooks/useLieuMeasurements'
import { formatDbDateTime } from '@/lib/date-display'
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
  sondeNumeroSerie?: string
  lieuEtat: string
  lieuType: LieuTypeValue
  siteName: string
  groupName: string
  status: SensorStatus
  alarmType?: 'H' | 'B' | 'N' | 'T' | null
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
  isGso?: boolean | null
  gsoRssi?: string | null
  gsoTension?: string | null
  alarmId?: number | null
  onEditLocation?: (idLieu: number) => void
  onSurveillanceToggle: (
    idLieu: number,
    action: 'surveillance' | 'alarms',
    newState: boolean,
    durationMinutes: number | null,
  ) => void
  showNullNonResponse?: boolean
}

export default function MonitoringCard({
  idLieu,
  nomLieu,
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
  isGso,
  gsoRssi,
  gsoTension,
  alarmId = null,
  onEditLocation,
  onSurveillanceToggle,
  showNullNonResponse = false,
}: MonitoringCardProps) {
  const t = useTranslations('monitoringCard')
  const tStatus = useTranslations('surveillanceStatus')
  const { hasPermission } = useAppAccess()
  const locale = useLocale()
  const localeTag = locale === 'fr' ? 'fr-FR' : locale
  const queryClient = useQueryClient()

  const { data, isLoading, reload, meta } = useLieuMeasurements(idLieu, {
    includeMeta: true,
    includeNullNonResponse: showNullNonResponse,
  })

  const orderedData = useMemo(() => sortMeasuresChronologically(data), [data])
  const summary = useMemo(() => getMeasureSummary(orderedData), [orderedData])
  const { consigneSup, consigneInf, consigne, unite, frequence, lastMeasureText, lastDateTime, decimals, lastValue } = summary

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false)
  const [ackComment, setAckComment] = useState('')
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
    if (surveillanceDisabled !== undefined) {
      setIsSurveillanceActive(!surveillanceDisabled)
      return
    }
    setIsSurveillanceActive(lieuEtat !== 'D')
  }, [lieuEtat, surveillanceDisabled])

  useEffect(() => {
    setIsAlarmActive(!alarmDisabled)
  }, [alarmDisabled])

  useEffect(() => {
    if (isModalOpen) reload(true)
  }, [isModalOpen, reload])

  const handleAcknowledgeOpen = useCallback(() => {
    setAckComment('')
    setShowAcknowledgeModal(true)
  }, [])

  const confirmSurveillanceToggle = () => {
    const isDisabling = actionType === 'surveillance' ? isSurveillanceActive : isAlarmActive
    const durationMinutes = isDisabling ? (disableDuration === 'manual' ? null : Number(disableDuration)) : null

    if (actionType === 'surveillance') {
      const nextState = !isSurveillanceActive
      setIsSurveillanceActive(nextState)
      onSurveillanceToggle(idLieu, 'surveillance', nextState, durationMinutes)
    } else {
      const nextState = !isAlarmActive
      setIsAlarmActive(nextState)
      onSurveillanceToggle(idLieu, 'alarms', nextState, durationMinutes)
    }

    setShowConfirmModal(false)
  }

  const [yMin, yMax] = useMemo(
    () => calculateYDomain(orderedData, { consigneSup, consigneInf, consigne }),
    [consigne, consigneInf, consigneSup, orderedData],
  )

  const surveillanceDisabledLabel = useMemo(() => (!isSurveillanceActive ? t('surveillance.disabled') : null), [isSurveillanceActive, t])
  const alarmDisabledLabel = useMemo(() => {
    if (isAlarmActive) return null
    if (!alarmDisabledUntil) return t('alarms.disabled')
    const date = new Date(alarmDisabledUntil)
    if (Number.isNaN(date.getTime())) return t('alarms.disabled')
    return t('alarms.disabled_until', { date: formatDbDateTime(date, { withSeconds: false }) })
  }, [alarmDisabledUntil, isAlarmActive, t])

  const contentTextClassName = isSurveillanceActive ? 'text-muted-foreground' : 'text-white'
  const actionButtonClassName = isSurveillanceActive ? 'hover:bg-muted' : 'hover:bg-white/10'
  const actionIconClassName = isSurveillanceActive ? 'text-muted-foreground' : 'text-white'

  const canAcknowledge =
    hasPermission('ALARM_ACK_ACCESS') &&
    isSurveillanceActive &&
    effectiveAlarmId !== null &&
    effectiveAlarmId !== undefined &&
    (effectiveStatus === 'critical' || effectiveStatus === 'technical' || effectiveStatus === 'ended')

  const frequencyMinutes = useMemo(() => {
    if (isGso) return 15
    if (!frequence || frequence <= 0) return null
    return Math.round(frequence / 60)
  }, [frequence, isGso])

  const chartDatasets = useMemo(
    () => [
      {
        label: t('chart.measures', { unit: unite }),
        data: orderedData.map((point) => point.Valeur),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        order: 1,
      },
    ],
    [orderedData, t, unite],
  )

  const formattedConsigne = useMemo(() => formatMeasureValue(consigne, decimals, localeTag), [consigne, decimals, localeTag])
  const formattedConsigneSup = useMemo(() => formatMeasureValue(consigneSup, decimals, localeTag), [consigneSup, decimals, localeTag])
  const formattedConsigneInf = useMemo(() => formatMeasureValue(consigneInf, decimals, localeTag), [consigneInf, decimals, localeTag])
  const formattedLastValue = useMemo(() => formatMeasureValue(lastValue, decimals, localeTag), [lastValue, decimals, localeTag])
  const hasGsoMetrics = Boolean(isGso && (gsoRssi || gsoTension))

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
                <MonitoringCardChartPreview
                  isLoading={isLoading}
                  orderedData={orderedData}
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
              </div>

              <div className="mt-auto space-y-3 text-sm border-t border-border pt-3">
                {lastDateTime ? (
                  <>
                    <div className={`flex items-center justify-between text-[11px] ${contentTextClassName}`}>
                      <span>{t('last_measure.label', { value: formattedLastValue ? `${formattedLastValue}${unite}` : lastMeasureText })}</span>
                      <span>{lastDateTime}</span>
                    </div>
                    {hasGsoMetrics ? (
                      <div className={`flex flex-wrap items-center justify-center gap-4 text-[11px] ${contentTextClassName}`}>
                        {gsoRssi ? <RssiBars value={gsoRssi} label={t('gso.rssi', { value: gsoRssi })} /> : null}
                        {gsoTension ? <span>{t('gso.tension', { value: gsoTension })}</span> : null}
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
            <div className={`text-sm font-medium ${contentTextClassName}`}>{t('surveillance.disabled')}</div>
          )}

          <div className={`mt-4 border-t border-border pt-3 ${isSurveillanceActive ? '' : 'border-white/20'}`}>
            <TooltipProvider>
              <div className="flex justify-center gap-4">
                <UITooltip>
                  <TooltipTrigger asChild>
                    <button onClick={(event) => { event.stopPropagation(); setIsModalOpen(true) }} className={`p-1.5 rounded-md transition-colors ${actionButtonClassName}`}>
                      <FileText className={`w-4 h-4 ${actionIconClassName}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">{t('actions.details')}</p></TooltipContent>
                </UITooltip>

                <UITooltip>
                  <TooltipTrigger asChild>
                    <button onClick={(event) => { event.stopPropagation(); setActionType('surveillance'); setShowConfirmModal(true) }} className={`p-1.5 rounded-md transition-colors ${actionButtonClassName} ${isSurveillanceActive ? 'text-red-600' : 'text-white'}`}>
                      {isSurveillanceActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">{t('actions.toggle')}</p></TooltipContent>
                </UITooltip>

                <UITooltip>
                  <TooltipTrigger asChild>
                    <button onClick={(event) => event.stopPropagation()} className={`p-1.5 rounded-md transition-colors ${actionButtonClassName}`}>
                      <MapPin className={`w-4 h-4 ${actionIconClassName}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">{t('actions.location')}</p></TooltipContent>
                </UITooltip>

                <UITooltip>
                  <TooltipTrigger asChild>
                    <button onClick={(event) => { event.stopPropagation(); onEditLocation?.(idLieu) }} className={`p-1.5 rounded-md transition-colors ${actionButtonClassName}`}>
                      <Settings className={`w-4 h-4 ${actionIconClassName}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">{t('actions.settings')}</p></TooltipContent>
                </UITooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </m.div>

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
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
          measurements={isSurveillanceActive ? orderedData : []}
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
        onConfirm={async (ackAlarmId, commentValue) => {
          try {
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
            setShowAcknowledgeModal(false)
            setAckComment('')
            reload(true)
          } catch (error) {
            console.error('Acknowledge alarm error', error)
          }
        }}
      />
    </>
  )
}
