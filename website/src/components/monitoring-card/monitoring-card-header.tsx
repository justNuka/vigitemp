import { CircleHelp, PowerOff } from 'lucide-react'

import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getTypeIcon } from '@/lib/lieu-types'
import type { LieuTypeValue } from '@/lib/lieu-types'
import { getStatusTheme, type SensorStatus } from '@/lib/surveillance-status'
import { isCriticalThresholdAlarmType, type AlarmTypeCode } from '@/lib/alarm-types'

const HEADER_GRADIENT_MAP: Record<string, string> = {
  // alarmTypeTheme values (clean single tokens)
  "bg-red-700":    "bg-linear-to-br from-red-600 to-red-800",
  "bg-blue-700":   "bg-linear-to-br from-blue-600 to-blue-800",
  "bg-black":      "bg-linear-to-br from-slate-900 to-black",
  "bg-violet-600": "bg-linear-to-br from-violet-500 to-violet-700",
  // getStatusTheme values (exact strings including dark: variants)
  "bg-slate-600 dark:bg-gray-700":    "bg-linear-to-br from-slate-500 to-slate-700 dark:from-gray-600 dark:to-gray-800",
  "bg-red-700 dark:bg-red-700":       "bg-linear-to-br from-red-600 to-red-800",
  "bg-amber-300 dark:bg-amber-300":   "bg-linear-to-br from-amber-200 to-amber-400",
  "bg-violet-600 dark:bg-violet-700": "bg-linear-to-br from-violet-500 to-violet-700 dark:from-violet-600 dark:to-violet-800",
  "bg-sky-400 dark:bg-sky-500":        "bg-linear-to-br from-sky-300 via-sky-400 to-sky-500 dark:from-sky-400 dark:via-sky-500 dark:to-sky-600",
}

interface MonitoringCardHeaderProps {
  status: SensorStatus
  effectiveAlarmType: AlarmTypeCode | null
  isSurveillanceActive: boolean
  lieuEtat: string
  siteName: string
  groupName: string
  nomLieu: string
  sondeNumeroSerie?: string
  locationComment?: string | null
  lieuType: LieuTypeValue | null
  surveillanceDisabledLabel: string | null
  alarmDisabledLabel: string | null
  canAcknowledge: boolean
  onAcknowledge: () => void
  onOpenDetails: () => void
  t: (key: string, values?: Record<string, string | number>) => string
  tStatus: (key: string) => string
}

export function MonitoringCardHeader({
  status,
  effectiveAlarmType,
  isSurveillanceActive,
  lieuEtat,
  siteName,
  groupName,
  nomLieu,
  sondeNumeroSerie,
  locationComment,
  lieuType,
  surveillanceDisabledLabel,
  alarmDisabledLabel,
  canAcknowledge,
  onAcknowledge,
  onOpenDetails,
  t,
  tStatus,
}: MonitoringCardHeaderProps) {
  const statusLabels = {
    inactive: tStatus('inactive'),
    critical: tStatus('critical'),
    technical: tStatus('technical'),
    warning: tStatus('warning'),
    ended: tStatus('ended'),
    ok: tStatus('ok'),
  }
  const headerTheme = getStatusTheme(status, isSurveillanceActive, statusLabels)
  const alarmTypeTheme = !effectiveAlarmType || !isSurveillanceActive
    ? null
    : effectiveAlarmType === 'CH'
      ? { label: t('alarmTypes.critical_high'), headerBgClassName: 'bg-red-700', headerBorderClassName: 'border-red-800', headerTextClassName: 'text-white' }
      : effectiveAlarmType === 'H'
        ? { label: t('alarmTypes.high'), headerBgClassName: 'bg-red-700', headerBorderClassName: 'border-red-800', headerTextClassName: 'text-white' }
        : effectiveAlarmType === 'CB'
          ? { label: t('alarmTypes.critical_low'), headerBgClassName: 'bg-blue-700', headerBorderClassName: 'border-blue-800', headerTextClassName: 'text-white' }
          : effectiveAlarmType === 'B'
            ? { label: t('alarmTypes.low'), headerBgClassName: 'bg-blue-700', headerBorderClassName: 'border-blue-800', headerTextClassName: 'text-white' }
            : effectiveAlarmType === 'N'
              ? { label: t('alarmTypes.no_response'), headerBgClassName: 'bg-black', headerBorderClassName: 'border-black', headerTextClassName: 'text-white' }
              : effectiveAlarmType === 'S' || effectiveAlarmType === 'A'
                ? { label: t('alarmTypes.sector'), headerBgClassName: 'bg-black', headerBorderClassName: 'border-black', headerTextClassName: 'text-white' }
                : effectiveAlarmType === 'M'
                  ? { label: t('alarmTypes.module'), headerBgClassName: 'bg-black', headerBorderClassName: 'border-black', headerTextClassName: 'text-white' }
                  : { label: t('alarmTypes.ended'), headerBgClassName: 'bg-violet-600', headerBorderClassName: 'border-violet-700', headerTextClassName: 'text-white' }

  const headerBgClassName = alarmTypeTheme?.headerBgClassName ?? headerTheme.headerBgClassName
  const headerBorderClassName = alarmTypeTheme?.headerBorderClassName ?? headerTheme.headerBorderClassName
  const headerTextClassName = alarmTypeTheme?.headerTextClassName ?? (isSurveillanceActive ? headerTheme.headerTextClassName : 'text-white')
  const headerStatusLabel = alarmTypeTheme?.label ?? headerTheme.label
  const HeaderIcon = headerTheme.Icon
  const typeIconInfo = lieuType ? getTypeIcon(lieuType, 'w-4 h-4') : null
  const alarmBadgeClassName = isSurveillanceActive ? 'bg-black/15 text-white ring-1 ring-white/15 backdrop-blur-sm' : 'bg-white/20 text-white ring-1 ring-white/20'
  const hasActiveAlarmCode = isSurveillanceActive && Boolean(effectiveAlarmType)
  const hasCriticalThresholdAlarm = isCriticalThresholdAlarmType(effectiveAlarmType)

  const operationalState = lieuEtat === 'E'
    ? {
        label: t('surveillance.calibration'),
        tooltip: t('surveillance.calibration_tooltip'),
        className: 'bg-amber-50 text-amber-900 ring-1 ring-amber-200',
      }
    : lieuEtat === 'A'
      ? {
          label: t('surveillance.adjustment'),
          tooltip: t('surveillance.adjustment_tooltip'),
          className: 'bg-sky-50 text-sky-900 ring-1 ring-sky-200',
        }
      : null

  const resolvedHeaderBg = HEADER_GRADIENT_MAP[headerBgClassName] ?? headerBgClassName

  return (
    <div
      className={`px-3 py-2 relative overflow-hidden ${resolvedHeaderBg} border-b-2 ${headerBorderClassName} ${canAcknowledge ? 'cursor-pointer transition-[filter] hover:brightness-[1.04]' : ''}`}
      onClick={() => {
        if (canAcknowledge) onAcknowledge()
      }}
      onKeyDown={(event) => {
        if (!canAcknowledge) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onAcknowledge()
        }
      }}
      role={canAcknowledge ? 'button' : undefined}
      tabIndex={canAcknowledge ? 0 : undefined}
      aria-label={canAcknowledge ? t('acknowledge.button') : undefined}
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/20 via-white/8 to-transparent"
        aria-hidden="true"
      />
      <div className="flex items-start justify-between gap-2">
        <div className={`${headerTextClassName} min-w-0 flex-1 text-xs font-medium space-y-1`}>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <div className="max-w-full cursor-help truncate hover:opacity-80 transition-opacity">
                  {siteName || t('site.unknown')}
                  {groupName ? <span className="opacity-75"> · {groupName}</span> : null}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  {lieuEtat === 'S'
                    ? t('surveillance.active')
                    : lieuEtat === 'D'
                      ? t('surveillance.disabled')
                      : operationalState?.tooltip ?? lieuEtat ?? ''}
                </p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
          <div className="min-w-0 space-y-0.5">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onOpenDetails()
              }}
              className="line-clamp-2 max-w-full wrap-break-word rounded-sm text-left text-[17px] font-bold leading-tight tracking-tight underline-offset-4 transition-opacity hover:opacity-85 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label={t('actions.details')}
            >
              {nomLieu}
            </button>
            {sondeNumeroSerie ? (
              <div className="line-clamp-2 wrap-break-word text-[11px] leading-tight font-medium opacity-85">
                {sondeNumeroSerie}
              </div>
            ) : null}
          </div>
          {surveillanceDisabledLabel ? (
            <div className={`inline-flex items-center max-w-full gap-1.5 rounded-full text-[11px] font-medium px-2.5 py-1 ${alarmBadgeClassName}`}>
              <PowerOff className="h-3 w-3" />
              <span className="truncate">{surveillanceDisabledLabel}</span>
            </div>
          ) : null}
          {alarmDisabledLabel ? (
            <UITooltip>
              <TooltipTrigger asChild>
                <div className={`inline-flex items-center max-w-full gap-1.5 rounded-full text-[11px] font-medium px-2.5 py-1 cursor-help ${alarmBadgeClassName}`}>
                  <PowerOff className="h-3 w-3" />
                  <span className="truncate">{alarmDisabledLabel}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs whitespace-pre-wrap wrap-break-word">
                <p className="text-xs">{alarmDisabledLabel}</p>
              </TooltipContent>
            </UITooltip>
          ) : null}
          {operationalState ? (
            <UITooltip>
              <TooltipTrigger asChild>
                <div className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${operationalState.className}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                  <span className="truncate">{operationalState.label}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs whitespace-pre-wrap wrap-break-word">
                <p className="text-xs">{operationalState.tooltip}</p>
              </TooltipContent>
            </UITooltip>
          ) : null}
        </div>

        <TooltipProvider>
          <div className={`${headerTextClassName} shrink-0 mt-0.5 flex flex-col items-center gap-1.5`}>
            <div className="flex min-h-4 items-center justify-center">
              <UITooltip>
                <TooltipTrigger asChild>
                  <span
                    className="relative inline-flex h-5 w-5 cursor-help items-center justify-center"
                    aria-hidden="true"
                  >
                    {hasActiveAlarmCode ? (
                      <>
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/75 opacity-80 motion-reduce:hidden" />
                        <span className="absolute inline-flex h-4 w-4 rounded-full border border-white/55" />
                      </>
                    ) : null}
                    <span
                      className={`relative inline-flex rounded-full ${hasActiveAlarmCode
                        ? 'h-3 w-3 bg-white shadow-[0_0_0_2px_rgba(255,255,255,0.38),0_0_14px_5px_rgba(255,255,255,0.75)]'
                        : 'h-2.5 w-2.5 bg-white/45'}`}
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{hasActiveAlarmCode ? (effectiveAlarmType === 'CH' ? t('alarmTypes.critical_high') : effectiveAlarmType === 'H' ? t('alarmTypes.high') : effectiveAlarmType === 'CB' ? t('alarmTypes.critical_low') : effectiveAlarmType === 'B' ? t('alarmTypes.low') : effectiveAlarmType === 'S' || effectiveAlarmType === 'A' ? t('alarmTypes.sector') : effectiveAlarmType === 'M' ? t('alarmTypes.module') : effectiveAlarmType === 'T' ? t('alarmTypes.ended') : t('alarmTypes.no_response')) : t('status.ok')}</p>
                </TooltipContent>
              </UITooltip>
            </div>
            {status !== 'critical' || hasCriticalThresholdAlarm ? (
              <UITooltip>
                <TooltipTrigger asChild>
                  <div><HeaderIcon className="w-4 h-4" /></div>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">{headerStatusLabel}</p></TooltipContent>
              </UITooltip>
            ) : null}
            {typeIconInfo?.icon ? (
              <UITooltip>
                <TooltipTrigger asChild>
                  <span className={isSurveillanceActive ? 'text-current' : 'text-white'}>{typeIconInfo.icon}</span>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">{typeIconInfo.label}</p></TooltipContent>
              </UITooltip>
            ) : null}
            <UITooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <CircleHelp className="h-3.5 w-3.5" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs whitespace-pre-wrap wrap-break-word">
                <p className="text-xs">{locationComment || t('observations.empty')}</p>
              </TooltipContent>
            </UITooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  )
}
