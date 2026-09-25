import { MonitoringSignalSequence } from "@/components/animated-loaders/signal-sequence"
import { Skeleton } from "@/components/ui/skeleton"

export function MonitoringCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm"
    >
      <div className="flex h-7 items-center gap-2 bg-[hsl(var(--surface-muted))] px-2.5">
        <Skeleton className="h-2.5 w-2.5 rounded-full" />
        <Skeleton className="h-2 w-16" />
      </div>

      <div className="flex flex-1 flex-col px-3 pb-2 pt-2">
        <Skeleton className="h-2 w-24" />
        <Skeleton className="mt-1.5 h-3.5 w-32" />
        <Skeleton className="mt-1.5 h-2 w-20" />

        <div className="mt-2 flex h-[22px] items-center text-primary/60">
          <MonitoringSignalSequence className="h-6 w-[72px]" />
        </div>

        <svg
          viewBox="0 0 240 60"
          preserveAspectRatio="none"
          className="mt-2.5 h-[52px] w-full text-muted-foreground"
        >
          <line
            x1={0}
            x2={240}
            y1={12}
            y2={12}
            className="stroke-[hsl(var(--status-critical)/0.45)]"
            strokeDasharray="4 3"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1={0}
            x2={240}
            y1={48}
            y2={48}
            className="stroke-[hsl(var(--status-critical)/0.45)]"
            strokeDasharray="4 3"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M0 34 L30 31 L60 36 L90 28 L120 31 L150 24 L180 28 L210 22 L240 25"
            fill="none"
            className="stroke-primary/55"
            strokeWidth={1.6}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <Skeleton className="mt-1.5 h-2 w-28" />
      </div>

      <div className="flex h-7 items-center justify-end gap-2 border-t border-border/70 px-3">
        <Skeleton className="h-3.5 w-3.5" />
        <Skeleton className="h-3.5 w-3.5" />
      </div>
    </div>
  )
}
