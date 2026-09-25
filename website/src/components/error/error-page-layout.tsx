"use client"

import Link from "next/link"
import { m, useReducedMotion } from "motion/react"
import type { ReactNode } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { SignalField } from "@/components/error/signal-field"
import { SystemIllustration, type SystemVariant } from "@/components/error/system-illustration"
import { usePathname } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

type ErrorAction = {
  label: string
  href?: string
  onClick?: () => void
  icon?: ReactNode
  variant?: "default" | "outline" | "secondary" | "ghost"
}

interface ErrorPageLayoutProps {
  code: string
  title: string
  description: string
  badge?: string
  icon?: ReactNode
  helperText?: string
  primaryAction: ErrorAction
  secondaryAction?: ErrorAction
  variant?: SystemVariant
  standalone?: boolean
}

const EASE = [0.23, 1, 0.32, 1] as const

const variantTone: Record<SystemVariant, { badge: string; field: string }> = {
  "not-found": {
    badge: "border-primary/30 bg-[hsl(var(--primary-soft))] text-[hsl(var(--primary-strong))]",
    field: "fill-primary",
  },
  forbidden: {
    badge: "border-[hsl(var(--status-warning)/0.40)] bg-[hsl(var(--status-warning)/0.10)] text-[hsl(var(--status-warning-text))]",
    field: "fill-[hsl(var(--status-warning))]",
  },
  "server-error": {
    badge: "border-[hsl(var(--status-critical)/0.30)] bg-[hsl(var(--status-critical)/0.10)] text-[hsl(var(--status-critical))]",
    field: "fill-[hsl(var(--status-critical))]",
  },
  network: {
    badge: "border-[hsl(var(--status-technical)/0.30)] bg-[hsl(var(--status-technical)/0.08)] text-[hsl(var(--status-technical))] dark:text-slate-100",
    field: "fill-[hsl(var(--status-technical))] dark:fill-slate-100",
  },
  maintenance: {
    badge: "border-[hsl(var(--status-ok)/0.30)] bg-[hsl(var(--status-ok)/0.10)] text-[hsl(var(--status-ok-text))]",
    field: "fill-[hsl(var(--status-ok))]",
  },
}

function resolveVariant(code: string, variant?: SystemVariant): SystemVariant {
  if (variant) return variant
  if (code === "403") return "forbidden"
  if (code === "404") return "not-found"
  return "server-error"
}

function ActionButton({
  action,
  fallbackHref,
}: {
  action: ErrorAction
  fallbackHref: string
}) {
  const variant = action.variant === "default" || !action.variant ? "primary" : action.variant

  if (action.onClick) {
    return (
      <Button
        onClick={action.onClick}
        variant={variant}
        size="sm"
        className="h-8 gap-1.5"
      >
        {action.icon}
        {action.label}
      </Button>
    )
  }

  return (
    <Button
      asChild
      variant={variant}
      size="sm"
      className="h-8 gap-1.5"
    >
      <Link href={action.href ?? fallbackHref}>
        {action.icon}
        {action.label}
      </Link>
    </Button>
  )
}

function SplitTitle({ text, reduced }: { text: string; reduced: boolean }) {
  const words = text.split(" ")

  return (
    <m.h1
      aria-label={text}
      className="mt-3 text-xl font-semibold tracking-[-0.01em] text-foreground"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduced ? 0 : 0.045,
            delayChildren: reduced ? 0 : 0.2,
          },
        },
      }}
    >
      {words.map((word, index) => (
        <m.span
          key={`${word}-${index}`}
          aria-hidden
          className="inline-block whitespace-pre"
          variants={{
            hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 6, filter: "blur(2px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: reduced ? 0 : 0.24, ease: EASE },
            },
          }}
        >
          {word}
          {index < words.length - 1 ? " " : ""}
        </m.span>
      ))}
    </m.h1>
  )
}

export function ErrorPageLayout({
  code,
  title,
  description,
  badge,
  helperText,
  primaryAction,
  secondaryAction,
  variant,
  standalone = false,
}: ErrorPageLayoutProps) {
  const pathname = usePathname()
  const locale = pathname?.split("/")[1] || "fr"
  const t = useTranslations("errors")
  const reduced = Boolean(useReducedMotion())
  const resolvedVariant = resolveVariant(code, variant)
  const tone = variantTone[resolvedVariant]

  return (
    <div
      className={cn(
        "relative isolate flex w-full flex-col items-center justify-center overflow-hidden bg-background px-6",
        standalone ? "min-h-screen py-10" : "min-h-[72vh] rounded-xl py-12",
      )}
    >
      <SignalField
        toneClassName={tone.field}
        className="absolute inset-0 -z-10 h-full w-full opacity-80 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
      />

      {standalone ? (
        <div className="absolute left-6 top-5 text-foreground">
          <Logo size="xs" showText />
        </div>
      ) : null}

      <section className="flex w-full max-w-md flex-col items-center text-center">
        <SystemIllustration variant={resolvedVariant} />

        <m.div
          initial={{ opacity: 0, y: reduced ? 0 : 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.2, delay: reduced ? 0 : 0.15, ease: EASE }}
          className="mt-5 flex items-center gap-2"
        >
          <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", tone.badge)}>
            {badge ?? t("default_badge", { code })}
          </span>
          <span className="num text-[11px] font-semibold text-[hsl(var(--subtle-foreground))]">{code}</span>
        </m.div>

        <SplitTitle text={title} reduced={reduced} />

        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.22, delay: reduced ? 0 : 0.38 }}
          className="mt-1.5 text-[13px] leading-5 text-muted-foreground"
        >
          {description}
        </m.p>

        {helperText ? (
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.22, delay: reduced ? 0 : 0.46 }}
            className="mt-2 text-xs leading-5 text-[hsl(var(--subtle-foreground))]"
          >
            {helperText}
          </m.p>
        ) : null}

        <m.div
          initial={{ opacity: 0, y: reduced ? 0 : 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.22, delay: reduced ? 0 : 0.52, ease: EASE }}
          className="mt-6 flex flex-wrap justify-center gap-2"
        >
          <ActionButton action={primaryAction} fallbackHref={`/${locale}/surveillance`} />
          {secondaryAction ? <ActionButton action={secondaryAction} fallbackHref={`/${locale}/surveillance`} /> : null}
        </m.div>
      </section>
    </div>
  )
}
