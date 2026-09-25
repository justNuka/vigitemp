import type { ReactNode } from "react"
import { ArrowRight, type LucideIcon } from "lucide-react"

import { Link } from "@/i18n/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type AdminCardTone = "primary" | "critical" | "warning" | "ok" | "ended" | "neutral"

const iconTone: Record<AdminCardTone, string> = {
  primary: "bg-[hsl(var(--primary-soft))] text-[hsl(var(--primary-strong))]",
  critical: "bg-[hsl(var(--status-critical)/0.10)] text-[hsl(var(--status-critical))]",
  warning: "bg-[hsl(var(--status-warning)/0.14)] text-[hsl(var(--status-warning-text))]",
  ok: "bg-[hsl(var(--status-ok)/0.10)] text-[hsl(var(--status-ok-text))]",
  ended: "bg-[hsl(var(--status-ended)/0.10)] text-[hsl(var(--status-ended))]",
  neutral: "bg-[hsl(var(--surface-sunken))] text-muted-foreground",
}

export function AdminDashboardCard({
  icon: Icon,
  tone = "primary",
  title,
  description,
  badge,
  footer,
  attention = null,
  onActivate,
  activateLabel,
  loading = false,
  className,
  children,
}: {
  icon: LucideIcon
  tone?: AdminCardTone
  title: string
  description?: ReactNode
  badge?: ReactNode
  footer?: ReactNode
  attention?: "critical" | "warning" | null
  onActivate?: () => void
  activateLabel?: string
  loading?: boolean
  className?: string
  children?: ReactNode
}) {
  return (
    <section
      className={cn(
        "group/card relative flex min-w-0 flex-col overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_1px_2px_hsl(var(--shadow)/0.06)]",
        "transition-[border-color,box-shadow,background-color] duration-200 ease-out",
        "hover:border-[hsl(var(--border-strong))] hover:shadow-[0_10px_28px_-20px_hsl(var(--shadow)/0.35)]",
        onActivate && "focus-within:border-primary/50",
        className,
      )}
    >
      {attention ? (
        <span
          aria-hidden
          className={cn(
            "absolute inset-y-0 left-0 w-[3px]",
            attention === "critical"
              ? "bg-[hsl(var(--status-critical))]"
              : "bg-[hsl(var(--status-warning))]",
          )}
        />
      ) : null}

      <header className="flex items-start gap-2.5 px-4 pb-2.5 pt-3.5">
        <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", iconTone[tone])}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[13px] font-semibold leading-7 text-foreground">{title}</h2>
          {description ? <p className="-mt-0.5 text-xs leading-4 text-muted-foreground">{description}</p> : null}
        </div>
        {badge ? <div className="relative z-[2] shrink-0 pt-1">{badge}</div> : null}
      </header>

      <div className="flex min-h-0 flex-1 flex-col px-4 pb-3">
        {loading ? <AdminCardSkeleton /> : children}
      </div>

      {footer ? (
        <footer className="relative z-[2] mt-auto flex items-center border-t border-border/70 px-4 py-2">
          {footer}
        </footer>
      ) : null}

      {onActivate ? (
        <button
          type="button"
          onClick={onActivate}
          aria-label={activateLabel ?? title}
          className="absolute inset-0 rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/60"
        />
      ) : null}
    </section>
  )
}

function AdminCardSkeleton() {
  return (
    <div className="space-y-2.5 pt-1" aria-busy>
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-2.5 w-3/4" />
      <Skeleton className="h-2.5 w-1/2" />
    </div>
  )
}

export function AdminCardLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href as never}
      className="group/link -mx-1.5 inline-flex h-7 items-center gap-1 rounded-md px-1.5 text-xs font-medium text-[hsl(var(--primary-strong))] transition-[background-color,color] duration-150 hover:bg-[hsl(var(--primary-soft))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      {label}
      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover/link:translate-x-0.5" aria-hidden />
    </Link>
  )
}
