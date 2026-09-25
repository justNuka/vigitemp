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
  content,
  onClick,
  ariaLabel,
}: {
  title: string
  description: string
  value?: string
  helper?: string
  href?: string
  hrefLabel?: string
  icon: ReactNode
  badge?: ReactNode
  content?: ReactNode
  onClick?: () => void
  ariaLabel?: string
}) {
  return (
    <Card
      className={`h-full overflow-hidden rounded-[10px] border-border bg-card shadow-[0_1px_2px_hsl(var(--shadow)/0.06)] transition-[border-color,box-shadow] duration-200 hover:border-[hsl(var(--border-strong))] hover:shadow-[0_10px_28px_-20px_hsl(var(--shadow)/0.35)] ${onClick ? "cursor-pointer" : ""}`}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? ariaLabel ?? title : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <CardHeader className="border-b border-border/70 px-4 pb-2.5 pt-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-[13px] font-semibold">
              {icon}
              <span className="truncate">{title}</span>
            </CardTitle>
            <CardDescription className="mt-0.5 line-clamp-2 text-xs leading-4">{description}</CardDescription>
          </div>
          {badge}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 overflow-hidden px-4 pb-3 pt-3">
        {content ?? (
          <>
            <div className="num text-2xl font-semibold tracking-[-0.02em] text-foreground">{value}</div>
            {helper ? <p className="line-clamp-3 whitespace-pre-line break-all text-sm text-muted-foreground">{helper}</p> : null}
          </>
        )}
        {href && hrefLabel ? (
          <Link
            href={href as never}
            className="group/link inline-flex items-center gap-1 rounded-md text-xs font-medium text-[hsl(var(--primary-strong))] transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            {hrefLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </CardContent>
    </Card>
  )
}
