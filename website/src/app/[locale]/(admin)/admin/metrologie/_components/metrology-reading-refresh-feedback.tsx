"use client"

import { useEffect, useRef, useState } from "react"
import { CheckCircle2, RefreshCw } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { cn } from "@/lib/utils"

type Props = {
  label?: string
}

const FLASH_DURATION_MS = 1_400

export function MetrologyReadingRefreshFeedback({ label }: Props) {
  const locale = useLocale()
  const tRefresh = useTranslations("surveillance.refresh")
  const resolvedLabel = label ?? tRefresh("refreshed")
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [isFlashing, setIsFlashing] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const root = document.querySelector("main") ?? document.body
    const previousRows = new WeakMap<Element, string>()

    const snapshotRows = () => {
      root.querySelectorAll("tbody tr").forEach((row) => {
        previousRows.set(row, row.textContent ?? "")
      })
    }

    snapshotRows()

    const observer = new MutationObserver((mutations) => {
      const changedRows = new Set<HTMLTableRowElement>()

      for (const mutation of mutations) {
        const target = mutation.target instanceof Element ? mutation.target : mutation.target.parentElement
        const row = target?.closest("tbody tr") as HTMLTableRowElement | null
        if (row) changedRows.add(row)
      }

      let hasMeaningfulChange = false
      for (const row of changedRows) {
        const next = row.textContent ?? ""
        const previous = previousRows.get(row)
        previousRows.set(row, next)
        if (previous === undefined || previous === next) continue

        hasMeaningfulChange = true
        row.classList.remove("bg-primary/10", "transition-colors", "duration-700")
        void row.offsetWidth
        row.classList.add("bg-primary/10", "transition-colors", "duration-700")
        window.setTimeout(() => row.classList.remove("bg-primary/10"), FLASH_DURATION_MS)
      }

      if (!hasMeaningfulChange) return

      setUpdatedAt(new Date())
      setIsFlashing(true)
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => setIsFlashing(false), FLASH_DURATION_MS)
    })

    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
    })

    return () => {
      observer.disconnect()
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  const timeLabel = updatedAt
    ? new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(updatedAt)
    : null

  return (
    <div
      className={cn(
        "pointer-events-none fixed right-6 top-20 z-40 flex items-center gap-2 rounded-full border bg-background/95 px-3 py-2 text-xs shadow-sm backdrop-blur transition-all",
        updatedAt ? "opacity-100" : "opacity-0",
        isFlashing && "scale-[1.03] border-primary/50 shadow-md",
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {isFlashing ? (
        <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
      ) : (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
      )}
      <span className="inline-flex items-center gap-1.5">
        <span>{resolvedLabel}</span>
        {timeLabel ? <span className="text-muted-foreground">{timeLabel}</span> : null}
      </span>
    </div>
  )
}
