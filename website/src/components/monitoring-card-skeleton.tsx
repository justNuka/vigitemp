import { Skeleton } from "@/components/ui/skeleton"

export function MonitoringCardSkeleton() {
  return (
    <div className="relative w-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="px-3 py-2 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-4 w-44" />
        </div>
      </div>
      <div className="p-4 space-y-4">
        <Skeleton className="h-32.5 w-full rounded-md" />
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
        <div className="flex justify-center gap-4 pt-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-6 w-6 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  )
}
