import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export function HotlineHealthCard({
  title,
  status,
  loading,
  icon: Icon,
  statusLabel,
  badgeClassName,
}: {
  title: string
  status: string
  loading: boolean
  icon: LucideIcon
  statusLabel: string
  badgeClassName: string
}) {
  return (
    <Card className="border-[#26A5DA]/25">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <Icon className="h-4 w-4 text-[#26A5DA]" />
      </CardHeader>
      <CardContent>
        <div className={cn('inline-flex rounded-md border px-2 py-1 text-xs font-medium', badgeClassName)}>
          {loading ? statusLabel : status}
        </div>
      </CardContent>
    </Card>
  )
}
