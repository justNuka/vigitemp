import { PowerOff } from 'lucide-react'

import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getTypeIcon } from '@/lib/lieu-types'
import type { LieuTypeValue } from '@/lib/lieu-types'
import { getStatusTheme, type SensorStatus } from '@/lib/surveillance-status'

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
  effectiveAlarmType: 'H' | 'B' | 'N' | 'T' | null
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
    : effectiveAlarmType === 'H'
      ? { label: t('alarmTypes.high'), headerBgClassName: 'bg-red-700', headerBorderClassName: 'border-red-800', headerTextClassName: 'text-white' }
      : effectiveAlarmType === 'B'
        ? { label: t('alarmTypes.low'), headerBgClassName: 'bg-blue-700', headerBorderClassName: 'border-blue-800', headerTextClassName: 'text-white' }
        : effectiveAlarmType === 'N'
          ? { label: t('alarmTypes.no_response'), headerBgClassName: 'bg-black', headerBorderClassName: 'border-black', headerTextClassName: 'text-white' }
          : { label: t('alarmTypes.ended'), headerBgClassName: 'bg-violet-600', headerBorderClassName: 'border-violet-700', headerTextClassName: 'text-white' }

  const headerBgClassName = alarmTypeTheme?.headerBgClassName ?? headerTheme.headerBgClassName
  const headerBorderClassName = alarmTypeTheme?.headerBorderClassName ?? headerTheme.headerBorderClassName
  const headerTextClassName = alarmTypeTheme?.headerTextClassName ?? (isSurveillanceActive ? headerTheme.headerTextClassName : 'text-white')
  const headerStatusLabel = alarmTypeTheme?.label ?? headerTheme.label
  const HeaderIcon = headerTheme.Icon
  const typeIconInfo = lieuType ? getTypeIcon(lieuType, 'w-4 h-4') : null
  const alarmBadgeClassName = isSurveillanceActive ? 'bg-black/15 text-white ring-1 ring-white/15 backdrop-blur-sm' : 'bg-white/20 text-white ring-1 ring-white/20'

  const resolvedHeaderBg = HEADER_GRADIENT_MAP[headerBgClassName] ?? headerBgClassName

  return (
    <div
      className={`px-3 py-2 relative overflow-hidden ${resolvedHeaderBg} border-b-2 ${headerBorderClassName} ${canAcknowledge ? 'cursor-pointer' : ''}`}
      onClick={() => canAcknowledge && onAcknowledge()}
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
      {(status === 'critical' || status === 'technical') && isSurveillanceActive && (
        <span
          className="absolute top-2 right-10 h-2 w-2 rounded-full bg-white/80 animate-pulse pointer-events-none"
          aria-hidden="true"
        />
      )}
      <div className="flex items-start justify-between gap-2">
        <div className={`${headerTextClassName} min-w-0 flex-1 text-xs font-medium space-y-1`}>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <div className="max-w-full cursor-help truncate hover:opacity-80 transition-opacity">
                  {siteName || t('site.unknown')}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{lieuEtat === 'S' ? t('surveillance.active') : lieuEtat === 'D' ? t('surveillance.disabled') : lieuEtat || ''}</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
          {groupName ? <div className="max-w-full truncate">{groupName}</div> : null}
          <div className="flex min-w-0 items-start gap-2">
            <UITooltip>
              <TooltipTrigger asChild>
                <div className={`line-clamp-2 break-words text-[15px] leading-tight font-semibold ${locationComment ? 'cursor-help' : ''}`}>
                  {sondeNumeroSerie ? `${nomLieu} - ${sondeNumeroSerie}` : nomLieu}
                </div>
              </TooltipTrigger>
              {locationComment ? (
                <TooltipContent side="top" className="max-w-sm whitespace-pre-wrap wrap-break-word">
                  <p className="text-xs">{locationComment}</p>
                </TooltipContent>
              ) : null}
            </UITooltip>
          </div>
          {surveillanceDisabledLabel ? (
            <UITooltip>
              <TooltipTrigger asChild>
                <div className={`inline-flex items-center max-w-full gap-1.5 rounded-full text-[11px] font-medium px-2.5 py-1 ${locationComment ? 'cursor-help ' : ''}${alarmBadgeClassName}`}>
                  <PowerOff className="h-3 w-3" />
                  <span className="truncate">{surveillanceDisabledLabel}</span>
                </div>
              </TooltipTrigger>
              {locationComment ? (
                <TooltipContent side="top" className="max-w-xs whitespace-pre-wrap break-words">
                  <p className="text-xs">{locationComment}</p>
                </TooltipContent>
              ) : null}
            </UITooltip>
          ) : null}
          {alarmDisabledLabel ? (
            <UITooltip>
              <TooltipTrigger asChild>
                <div className={`inline-flex items-center max-w-full gap-1.5 rounded-full text-[11px] font-medium px-2.5 py-1 cursor-help ${alarmBadgeClassName}`}>
                  <PowerOff className="h-3 w-3" />
                  <span className="truncate">{alarmDisabledLabel}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs whitespace-pre-wrap break-words">
                <p className="text-xs">{alarmDisabledLabel}</p>
              </TooltipContent>
            </UITooltip>
          ) : null}
        </div>

        <TooltipProvider>
          <div className={`${headerTextClassName} shrink-0 mt-0.5 flex flex-col items-center gap-1.5`}>
            <UITooltip>
              <TooltipTrigger asChild>
                <div><HeaderIcon className="w-4 h-4" /></div>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">{headerStatusLabel}</p></TooltipContent>
            </UITooltip>
            {effectiveAlarmType ? (
              <UITooltip>
                <TooltipTrigger asChild>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${effectiveAlarmType === 'H' ? 'bg-red-700 text-white' : effectiveAlarmType === 'B' ? 'bg-blue-700 text-white' : effectiveAlarmType === 'T' ? 'bg-violet-600 text-white' : 'bg-black text-white'}`}>
                    {effectiveAlarmType}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{effectiveAlarmType === 'H' ? t('alarmTypes.high') : effectiveAlarmType === 'B' ? t('alarmTypes.low') : effectiveAlarmType === 'T' ? t('alarmTypes.ended') : t('alarmTypes.no_response')}</p>
                </TooltipContent>
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
          </div>
        </TooltipProvider>
      </div>
    </div>
  )
}
