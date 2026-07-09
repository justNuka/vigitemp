import type { ReactNode } from "react"
import { ArrowRight } from "lucide-react"

import { Link } from "@/i18n/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ExpertWidgetCard({
  title,
  description,
  value,
  helper,
  href,
  hrefLabel,
  icon,
  badge,
}: {
  title: string
  description: string
  value: string
  helper?: string
  href?: string
  hrefLabel?: string
  icon: ReactNode
  badge?: ReactNode
}) {
  return (
    <Card className="h-full overflow-hidden border-slate-200 bg-white/95 shadow-sm dark:border-border dark:bg-card/95">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              {icon}
              <span className="truncate">{title}</span>
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">{description}</CardDescription>
          </div>
          {badge}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 overflow-hidden">
        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
        {helper ? <p className="line-clamp-3 whitespace-pre-line break-all text-sm text-muted-foreground">{helper}</p> : null}
        {href && hrefLabel ? (
          <Link
            href={href as never}
            className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 transition-colors hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
          >
            {hrefLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </CardContent>
    </Card>
  )
}
