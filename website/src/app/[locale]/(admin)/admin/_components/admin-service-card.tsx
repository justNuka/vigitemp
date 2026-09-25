import type { ComponentType } from "react"
import { MailQuestion } from "lucide-react"

import {
  AdminCardLink,
  AdminDashboardCard,
  type AdminCardTone,
} from "./admin-dashboard-card"
import { AdminStatusPill, type AdminStatusTone } from "./admin-status-pill"

export type AdminServiceCardState = "active" | "inactive" | "incomplete" | "error" | "loading"

type Detail = {
  label: string
  value: string
  ok?: boolean | null
}

type Props = {
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
  state: AdminServiceCardState
  stateLabel: string
  details: Detail[]
  href?: string
  hrefLabel?: string
  className?: string
}

const stateTone: Record<AdminServiceCardState, AdminStatusTone> = {
  active: "ok",
  inactive: "neutral",
  incomplete: "warning",
  error: "critical",
  loading: "loading",
}

const cardTone: Record<AdminServiceCardState, AdminCardTone> = {
  active: "primary",
  inactive: "neutral",
  incomplete: "warning",
  error: "critical",
  loading: "neutral",
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
  className,
}: Props) {
  const Icon = icon ?? MailQuestion

  return (
    <AdminDashboardCard
      icon={Icon}
      tone={cardTone[state]}
      title={title}
      description={description}
      attention={state === "error" ? "critical" : state === "incomplete" ? "warning" : null}
      badge={<AdminStatusPill tone={stateTone[state]}>{stateLabel}</AdminStatusPill>}
      footer={href && hrefLabel ? <AdminCardLink href={href} label={hrefLabel} /> : undefined}
      loading={state === "loading"}
      className={className}
    >
      <dl className="divide-y divide-border/70 rounded-md border border-border/70">
        {details.map((detail) => (
          <div key={detail.label} className="flex items-center justify-between gap-3 px-2.5 py-1.5 text-xs">
            <dt className="text-muted-foreground">{detail.label}</dt>
            <dd className="flex items-center gap-1.5 text-right font-medium text-foreground">
              {detail.ok !== undefined && detail.ok !== null ? (
                <span
                  aria-hidden
                  className={
                    detail.ok
                      ? "h-1.5 w-1.5 rounded-full bg-[hsl(var(--status-ok))]"
                      : "h-1.5 w-1.5 rounded-full bg-[hsl(var(--status-warning))]"
                  }
                />
              ) : null}
              <span className={detail.ok === false ? "text-[hsl(var(--status-warning-text))]" : undefined}>
                {detail.value}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </AdminDashboardCard>
  )
}
