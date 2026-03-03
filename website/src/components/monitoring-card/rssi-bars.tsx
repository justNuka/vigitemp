import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { getRssiLevel, parseRssiValue } from './rssi'

export function RssiBars({ value, label }: { value?: string | null; label: string }) {
  const dbm = parseRssiValue(value ?? null)
  const level = getRssiLevel(dbm)
  const levelClass =
    level >= 4
      ? 'bg-emerald-500'
      : level === 3
        ? 'bg-yellow-500'
        : level === 2
          ? 'bg-orange-500'
          : 'bg-red-500'

  return (
    <UITooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex items-end gap-0.5 cursor-help" aria-label={label}>
          {Array.from({ length: 5 }).map((_, index) => {
            const isActive = index < level
            const height = 4 + index * 3
            return (
              <span
                key={index}
                className={`w-1 rounded-sm transition-colors ${isActive ? levelClass : 'bg-slate-400/80 dark:bg-slate-500/80'}`}
                style={{ height }}
              />
            )
          })}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{label}</p>
      </TooltipContent>
    </UITooltip>
  )
}
