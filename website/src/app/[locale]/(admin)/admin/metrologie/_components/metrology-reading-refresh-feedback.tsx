"use client"

import { useEffect, useRef, useState } from "react"
import { CheckCircle2, RefreshCw } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { cn } from "@/lib/utils"

type Props = {
  label?: string
}

const FEEDBACK_DURATION_MS = 3_200
const CELL_FADE_DURATION_MS = 3_000
const CELL_ACCENT_CLASSES = ["bg-emerald-200/70", "dark:bg-emerald-900/45"]

export function MetrologyReadingRefreshFeedback({ label }: Props) {
  const locale = useLocale()
  const tRefresh = useTranslations("surveillance.refresh")
  const resolvedLabel = label ?? tRefresh("refreshed")
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [isFlashing, setIsFlashing] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const root = document.querySelector("main") ?? document.body
    const previousCells = new WeakMap<Element, string>()
    const fadeTimers = new WeakMap<HTMLElement, number>()

    const snapshotCells = () => {
      root.querySelectorAll("tbody td").forEach((cell) => {
        previousCells.set(cell, cell.textContent ?? "")
      })
    }

    const accentCell = (cell: HTMLElement) => {
      const previousTimer = fadeTimers.get(cell)
      if (previousTimer) window.clearTimeout(previousTimer)

      cell.style.transition = "none"
      cell.classList.remove(...CELL_ACCENT_CLASSES)
      void cell.offsetWidth
      cell.classList.add(...CELL_ACCENT_CLASSES)
      void cell.offsetWidth

      cell.style.transition = `background-color ${CELL_FADE_DURATION_MS}ms ease-out`
      window.requestAnimationFrame(() => {
        cell.classList.remove(...CELL_ACCENT_CLASSES)
      })

      const cleanupTimer = window.setTimeout(() => {
        cell.style.removeProperty("transition")
        fadeTimers.delete(cell)
      }, CELL_FADE_DURATION_MS + 150)
      fadeTimers.set(cell, cleanupTimer)
    }

    snapshotCells()

    const observer = new MutationObserver((mutations) => {
      const changedCells = new Set<HTMLTableCellElement>()

      for (const mutation of mutations) {
        const target = mutation.target instanceof Element ? mutation.target : mutation.target.parentElement
        const cell = target?.closest("tbody td") as HTMLTableCellElement | null
        if (cell) changedCells.add(cell)
      }

      let hasMeaningfulChange = false
      for (const cell of changedCells) {
        const next = cell.textContent ?? ""
        const previous = previousCells.get(cell)
        previousCells.set(cell, next)
        if (previous === undefined || previous === next) continue

        hasMeaningfulChange = true
        accentCell(cell)
      }

      if (!hasMeaningfulChange) return

      setUpdatedAt(new Date())
      setIsFlashing(true)
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => setIsFlashing(false), FEEDBACK_DURATION_MS)
    })

    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
    })

    return () => {
      observer.disconnect()
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      root.querySelectorAll<HTMLElement>("tbody td").forEach((cell) => {
        const timer = fadeTimers.get(cell)
        if (timer) window.clearTimeout(timer)
        cell.classList.remove(...CELL_ACCENT_CLASSES)
        cell.style.removeProperty("transition")
      })
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
        isFlashing && "scale-[1.03] border-emerald-500/40 shadow-md",
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {isFlashing ? (
        <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
      ) : (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
      )}
      <span className="inline-flex items-center gap-1.5">
        <span>{resolvedLabel}</span>
        {timeLabel ? <span className="text-muted-foreground">{timeLabel}</span> : null}
      </span>
    </div>
  )
}
