import { ArrowRight } from "lucide-react"

import { Link } from "@/i18n/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type AdminServiceCardState = "active" | "inactive" | "incomplete" | "error" | "loading"

type Detail = {
  label: string
  value: string
}

type Props = {
  title: string
  description: string
  icon: React.ReactNode
  state: AdminServiceCardState
  stateLabel: string
  details: Detail[]
  href?: string
  hrefLabel?: string
}

function stateClassName(state: AdminServiceCardState) {
  if (state === "active") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  }
  if (state === "incomplete") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
  }
  if (state === "error") {
    return "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
  }
  return "border-slate-500/25 bg-slate-500/10 text-slate-700 dark:text-slate-300"
}

export function AdminServiceCard({
  title,
  description,
  icon,
  state,
  stateLabel,
  details,
  href,
  hrefLabel,
}: Props) {
  return (
    <Card className="h-full overflow-hidden border-border/60 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-card/95 dark:shadow-black/20">
      <CardHeader className="border-b border-border/50 bg-white/90 pb-3 dark:bg-card/90">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              {icon}
              {title}
            </CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <Badge variant="outline" className={stateClassName(state)}>
            {stateLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <div className="space-y-2 text-sm">
          {details.map((detail) => (
            <div
              key={detail.label}
              className="flex items-start justify-between gap-4 border-b border-border/40 pb-2 last:border-b-0 last:pb-0"
            >
              <span className="text-muted-foreground">{detail.label}</span>
              <span className="max-w-[60%] break-words text-right font-medium">{detail.value}</span>
            </div>
          ))}
        </div>

        {href && hrefLabel ? (
          <Link
            href={href as never}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            {hrefLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </CardContent>
    </Card>
  )
}
