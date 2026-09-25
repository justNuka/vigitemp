import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type AdminStatusTone = "ok" | "warning" | "critical" | "ended" | "info" | "neutral" | "loading"

const tones: Record<AdminStatusTone, { pill: string; dot: string }> = {
  ok: {
    pill: "border-[hsl(var(--status-ok)/0.30)] bg-[hsl(var(--status-ok)/0.10)] text-[hsl(var(--status-ok-text))]",
    dot: "bg-[hsl(var(--status-ok))]",
  },
  warning: {
    pill: "border-[hsl(var(--status-warning)/0.38)] bg-[hsl(var(--status-warning)/0.10)] text-[hsl(var(--status-warning-text))]",
    dot: "bg-[hsl(var(--status-warning))]",
  },
  critical: {
    pill: "border-[hsl(var(--status-critical)/0.30)] bg-[hsl(var(--status-critical)/0.10)] text-[hsl(var(--status-critical))]",
    dot: "bg-[hsl(var(--status-critical))]",
  },
  ended: {
    pill: "border-[hsl(var(--status-ended)/0.30)] bg-[hsl(var(--status-ended)/0.10)] text-[hsl(var(--status-ended))]",
    dot: "bg-[hsl(var(--status-ended))]",
  },
  info: {
    pill: "border-primary/30 bg-[hsl(var(--primary-soft))] text-[hsl(var(--primary-strong))]",
    dot: "bg-primary",
  },
  neutral: {
    pill: "border-border bg-[hsl(var(--surface-muted))] text-muted-foreground",
    dot: "bg-[hsl(var(--status-inactive))]",
  },
  loading: {
    pill: "border-border bg-[hsl(var(--surface-muted))] text-muted-foreground",
    dot: "bg-[hsl(var(--subtle-foreground))]",
  },
}

export function AdminStatusPill({
  tone,
  children,
  pulse = false,
  className,
}: {
  tone: AdminStatusTone
  children: ReactNode
  pulse?: boolean
  className?: string
}) {
  const config = tones[tone]

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full border px-2 text-[11px] font-semibold",
        config.pill,
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          config.dot,
          tone === "loading" && "animate-pulse",
          pulse && "alarm-blink",
        )}
      />
      {children}
    </span>
  )
}
