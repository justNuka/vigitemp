import {
  ArrowDown,
  ArrowUp,
  BellRing,
  CircleCheck,
  CircleOff,
  PowerOff,
  ShieldAlert,
  TriangleAlert,
  WifiOff,
} from 'lucide-react'

import type { LieuTypeValue } from '@/lib/lieu-types'
import type { SensorStatus } from '@/lib/surveillance-status'
import type { AlarmTypeCode } from '@/lib/alarm-types'
import { cn } from '@/lib/utils'

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

type BandConfig = {
  label: string
  className: string
  dotClassName: string
  Icon: typeof ArrowUp
}

export function MonitoringCardHeader({
  status,
  effectiveAlarmType,
  isSurveillanceActive,
  canAcknowledge,
  onAcknowledge,
  t,
  tStatus,
}: MonitoringCardHeaderProps) {
  const config = resolveBandConfig({
    status,
    alarmType: effectiveAlarmType,
    isSurveillanceActive,
    t,
    tStatus,
  })

  const hasAlarmCode = isSurveillanceActive && Boolean(effectiveAlarmType)
  const Icon = config.Icon

  return (
    <div
      className={cn(
        'flex h-7 shrink-0 items-center gap-1.5 border-b px-2.5 text-[11px] font-semibold',
        'transition-[filter,box-shadow] duration-150 ease-out',
        config.className,
        canAcknowledge && 'cursor-pointer hover:brightness-[1.04] focus-within:ring-2 focus-within:ring-inset focus-within:ring-white/45',
      )}
      role={canAcknowledge ? 'button' : undefined}
      tabIndex={canAcknowledge ? 0 : undefined}
      aria-label={canAcknowledge ? t('acknowledge.button') : config.label}
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
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{config.label}</span>

      <span
        aria-hidden
        className={cn(
          'relative inline-flex h-2.5 w-2.5 shrink-0 rounded-full',
          config.dotClassName,
        )}
      >
        {hasAlarmCode ? (
          <span
            className={cn(
              'absolute inset-0 rounded-full opacity-35 motion-reduce:hidden',
              config.dotClassName,
              'alarm-beacon',
            )}
          />
        ) : null}
        <span className="absolute inset-[2px] rounded-full bg-current ring-1 ring-white/75" />
      </span>

      {canAcknowledge ? (
        <span className="ml-0.5 whitespace-nowrap opacity-95">
          {t('acknowledge.button')} <span aria-hidden>›</span>
        </span>
      ) : null}
    </div>
  )
}

function resolveBandConfig({
  status,
  alarmType,
  isSurveillanceActive,
  t,
  tStatus,
}: {
  status: SensorStatus
  alarmType: AlarmTypeCode | null
  isSurveillanceActive: boolean
  t: MonitoringCardHeaderProps['t']
  tStatus: MonitoringCardHeaderProps['tStatus']
}): BandConfig {
  if (!isSurveillanceActive) {
    return {
      label: tStatus('inactive'),
      className: 'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300',
      dotClassName: 'bg-slate-500 text-slate-500',
      Icon: CircleOff,
    }
  }

  if (alarmType === 'CH') {
    return {
      label: t('alarmTypes.critical_high'),
      className: 'border-red-800 bg-red-700 text-white',
      dotClassName: 'bg-white text-white',
      Icon: ShieldAlert,
    }
  }

  if (alarmType === 'H') {
    return {
      label: t('alarmTypes.high'),
      className: 'border-red-800 bg-red-700 text-white',
      dotClassName: 'bg-white text-white',
      Icon: ArrowUp,
    }
  }

  if (alarmType === 'CB') {
    return {
      label: t('alarmTypes.critical_low'),
      className: 'border-blue-800 bg-blue-700 text-white',
      dotClassName: 'bg-white text-white',
      Icon: ShieldAlert,
    }
  }

  if (alarmType === 'B') {
    return {
      label: t('alarmTypes.low'),
      className: 'border-blue-800 bg-blue-700 text-white',
      dotClassName: 'bg-white text-white',
      Icon: ArrowDown,
    }
  }

  if (alarmType === 'N' || alarmType === 'M') {
    return {
      label: alarmType === 'M' ? t('alarmTypes.module') : t('alarmTypes.no_response'),
      className: 'border-slate-950 bg-slate-950 text-white dark:border-slate-600 dark:bg-slate-800',
      dotClassName: 'bg-white text-white',
      Icon: WifiOff,
    }
  }

  if (alarmType === 'S' || alarmType === 'A') {
    return {
      label: t('alarmTypes.sector'),
      className: 'border-slate-950 bg-slate-950 text-white dark:border-slate-600 dark:bg-slate-800',
      dotClassName: 'bg-white text-white',
      Icon: PowerOff,
    }
  }

  if (alarmType === 'T' || status === 'ended') {
    return {
      label: t('alarmTypes.ended'),
      className: 'border-violet-500/40 bg-violet-500/12 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-200',
      dotClassName: 'bg-violet-600 text-violet-600',
      Icon: BellRing,
    }
  }

  if (status === 'warning') {
    return {
      label: tStatus('warning'),
      className: 'border-amber-400/55 bg-amber-100/80 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200',
      dotClassName: 'bg-amber-500 text-amber-500',
      Icon: TriangleAlert,
    }
  }

  if (status === 'critical') {
    return {
      label: tStatus('critical'),
      className: 'border-red-700/45 bg-red-600/10 text-red-700 dark:border-red-500/30 dark:bg-red-500/12 dark:text-red-200',
      dotClassName: 'bg-red-600 text-red-600',
      Icon: TriangleAlert,
    }
  }

  if (status === 'technical') {
    return {
      label: tStatus('technical'),
      className: 'border-slate-400 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-200',
      dotClassName: 'bg-slate-700 text-slate-700 dark:bg-slate-200 dark:text-slate-200',
      Icon: WifiOff,
    }
  }

  return {
    label: tStatus('ok'),
    className: 'border-border bg-[hsl(var(--surface-muted))] text-muted-foreground',
    dotClassName: 'bg-[hsl(var(--status-ok))] text-[hsl(var(--status-ok))]',
    Icon: CircleCheck,
  }
}
