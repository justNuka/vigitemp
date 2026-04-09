"use client"

import { useTranslations } from "next-intl"
import type { PlanningRegleResponse } from "@/lib/planning-regle-schema"

const WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const
const DAY_FULL_KEYS = {
  1: "dialog.days.1",
  2: "dialog.days.2",
  3: "dialog.days.3",
  4: "dialog.days.4",
  5: "dialog.days.5",
  6: "dialog.days.6",
  7: "dialog.days.7",
} as const

function formatDayRange(t: (key: string) => string, startDay: number, endDay: number) {
  const startLabel = t(DAY_FULL_KEYS[startDay as keyof typeof DAY_FULL_KEYS])
  const endLabel = t(DAY_FULL_KEYS[endDay as keyof typeof DAY_FULL_KEYS])
  return startDay === endDay ? startLabel : `${startLabel} - ${endLabel}`
}

interface WeeklyPlanningViewProps {
  regles: PlanningRegleResponse[]
  onSelectRegle?: (regle: PlanningRegleResponse) => void
}

function dayInRule(regle: PlanningRegleResponse, day: number): boolean {
  const { Jour_Debut, Jour_Fin } = regle
  if (Jour_Debut <= Jour_Fin) {
    return day >= Jour_Debut && day <= Jour_Fin
  }
  return day >= Jour_Debut || day <= Jour_Fin
}

function getSegmentLabel(regle: PlanningRegleResponse, day: number): string {
  const isStart = day === regle.Jour_Debut
  const isEnd = day === regle.Jour_Fin

  if (isStart && isEnd) {
    return `${regle.Heure_Debut}-${regle.Heure_Fin}`
  }
  if (isStart) {
    return `${regle.Heure_Debut} ->`
  }
  if (isEnd) {
    return `-> ${regle.Heure_Fin}`
  }
  return "24h"
}

function getCellClasses(regle: PlanningRegleResponse, day: number): string {
  const isStart = day === regle.Jour_Debut
  const isEnd = day === regle.Jour_Fin

  return [
    "flex h-9 items-center justify-center border-y border-blue-500/40 bg-blue-500/15 px-1 text-[11px] font-medium text-blue-700 transition hover:bg-blue-500/25 dark:text-blue-300",
    isStart ? "rounded-l-md border-l" : "border-l-0",
    isEnd ? "rounded-r-md border-r" : "border-r-0",
    !isStart && !isEnd ? "text-blue-600/80 dark:text-blue-200/80" : "",
  ].join(" ")
}

export function WeeklyPlanningView({ regles, onSelectRegle }: WeeklyPlanningViewProps) {
  const t = useTranslations("lieux.planning")

  return (
    <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
      <div className="grid grid-cols-7 gap-1 text-xs font-medium text-muted-foreground">
        {WEEKDAY_KEYS.map((key) => (
          <div key={key} className="rounded-md bg-background px-2 py-1 text-center shadow-sm">
            {t(`weekdays.${key}`)}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {regles.map((regle) => (
          <div key={regle.Id_Regle} className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
              <span className="truncate font-medium text-foreground">
                {formatDayRange(t, regle.Jour_Debut, regle.Jour_Fin)}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, index) => {
                const day = index + 1
                const covered = dayInRule(regle, day)

                if (!covered) {
                  return <div key={day} className="h-9 rounded-md bg-background/70" />
                }

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => onSelectRegle?.(regle)}
                    className={getCellClasses(regle, day)}
                    title={`${formatDayRange(t, regle.Jour_Debut, regle.Jour_Fin)} | ${regle.Heure_Debut}-${regle.Heure_Fin}`}
                  >
                    <span className="truncate">{getSegmentLabel(regle, day)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
