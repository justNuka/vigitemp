import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type BatteryIndicatorSeverity = 'normal' | 'low' | 'critical' | 'unknown'

export type BatteryIndicatorState = {
  level: 0 | 1 | 2 | 3 | 4
  severity: BatteryIndicatorSeverity
}

export function parseBatteryVoltage(value?: string | null): number | null {
  if (!value) return null
  const normalized = value.replace(',', '.').replace(/[^0-9.\-]/g, '')
  const voltage = Number.parseFloat(normalized)
  return Number.isFinite(voltage) ? voltage : null
}

export function getBatteryIndicatorState(input: {
  percent?: number | null
  voltage?: string | null
}): BatteryIndicatorState {
  const percent = input.percent
  if (percent !== null && percent !== undefined && Number.isFinite(percent)) {
    const clamped = Math.min(100, Math.max(0, percent))

    if (clamped <= 25) {
      return { level: clamped <= 0 ? 0 : 1, severity: 'critical' }
    }
    if (clamped <= 50) return { level: 2, severity: 'low' }
    if (clamped <= 75) return { level: 3, severity: 'normal' }
    return { level: 4, severity: 'normal' }
  }

  const voltage = parseBatteryVoltage(input.voltage)
  if (voltage !== null) {
    if (voltage < 2.65) return { level: 1, severity: 'critical' }
    if (voltage < 2.9) return { level: 2, severity: 'low' }
    if (voltage < 3.0) return { level: 3, severity: 'normal' }
    return { level: 4, severity: 'normal' }
  }

  return { level: 0, severity: 'unknown' }
}

export function BatteryIndicator({
  percent,
  voltage,
  label,
}: {
  percent?: number | null
  voltage?: string | null
  label: string
}) {
  const state = getBatteryIndicatorState({ percent, voltage })
  const colorClass =
    state.severity === 'critical'
      ? 'text-red-500 dark:text-red-400'
      : state.severity === 'low'
        ? 'text-amber-500 dark:text-amber-400'
        : state.severity === 'normal'
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-slate-500 dark:text-slate-400'

  const animationClass =
    state.severity === 'critical'
      ? 'motion-safe:animate-[pulse_0.7s_ease-in-out_infinite] drop-shadow-[0_0_4px_rgba(239,68,68,0.65)]'
      : state.severity === 'low'
        ? 'motion-safe:animate-[pulse_1.8s_ease-in-out_infinite]'
        : ''

  return (
    <UITooltip>
      <TooltipTrigger asChild>
        <div
          className={cn('inline-flex cursor-help items-center', colorClass, animationClass)}
          aria-label={label}
        >
          <span className="relative flex h-3.5 w-6 items-stretch rounded-[3px] border-2 border-current p-0.5">
            <span className="grid h-full w-full grid-cols-4 gap-0.5">
              {Array.from({ length: 4 }).map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    'rounded-[1px] transition-colors',
                    index < state.level ? 'bg-current' : 'bg-slate-300/70 dark:bg-slate-600/70',
                  )}
                />
              ))}
            </span>
          </span>
          <span className="h-1.5 w-0.5 rounded-r-sm bg-current" aria-hidden="true" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{label}</p>
      </TooltipContent>
    </UITooltip>
  )
}
