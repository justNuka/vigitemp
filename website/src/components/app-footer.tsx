"use client"

import { ShieldCheck } from "lucide-react"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { WEB_APP_VERSION } from "@/lib/app-version"
import { cn } from "@/lib/utils"

type AppFooterProps = {
  className?: string
  compact?: boolean
}

export function AppFooter({ className, compact = false }: AppFooterProps) {
  const t = useTranslations("appFooter")
  const year = new Date().getFullYear()

  return (
    <footer
      className={cn(
        "border-t border-border/60 bg-background/95 text-xs text-muted-foreground",
        compact ? "px-4 py-3" : "px-4 py-4 md:px-6",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full items-center gap-x-4 gap-y-2",
          compact
            ? "max-w-5xl flex-wrap justify-center text-center"
            : "max-w-7xl flex-col justify-between sm:flex-row",
        )}
      >
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-start">
          <span>{t("copyright", { year })}</span>
          <span aria-hidden="true">·</span>
          <span>{t("version", { version: WEB_APP_VERSION })}</span>
        </div>

        <nav
          aria-label={t("legal_notice")}
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-end"
        >
          <Link
            href="/legal-notice"
            className="transition-colors hover:text-foreground hover:underline hover:underline-offset-4"
          >
            {t("legal_notice")}
          </Link>
          <Link
            href="/data-protection"
            className="transition-colors hover:text-foreground hover:underline hover:underline-offset-4"
          >
            {t("data_protection")}
          </Link>
          <span
            className="inline-flex items-center gap-1.5"
            title={t("technical_cookies_help")}
          >
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {t("technical_cookies")}
          </span>
        </nav>
      </div>
    </footer>
  )
}
