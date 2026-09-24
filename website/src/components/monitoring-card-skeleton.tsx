import { MonitoringChartLoading } from "@/components/animated-loaders/chart-loading"
import { MonitoringSignalSequence } from "@/components/animated-loaders/signal-sequence"
import { Skeleton } from "@/components/ui/skeleton"

export function MonitoringCardSkeleton() {
  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-white shadow-md dark:bg-card/95 dark:shadow-black/20">
      <div className="border-b border-border/60 bg-muted/35 px-3 py-2 dark:bg-muted/25">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-4 w-44" />
        </div>
      </div>
      <div className="space-y-3 px-3 pb-2 pt-2.5">
        <div className="flex h-7 items-center text-muted-foreground/60">
          <MonitoringSignalSequence className="h-7 w-[84px]" />
        </div>
        <div className="h-[142px]"><MonitoringChartLoading /></div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex items-center justify-center gap-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border/70 pt-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-5 w-5 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  )
}
