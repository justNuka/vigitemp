"use client"

import { useTranslations } from "next-intl"
import type { PlanningRegleResponse } from "@/lib/planning-regle-schema"

type WeekdayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"

const WEEKDAY_KEYS: WeekdayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]

interface WeeklyPlanningViewProps {
  regles: PlanningRegleResponse[]
  onSelectRegle?: (regle: PlanningRegleResponse) => void
}

// Check if a day (1=Mon..7=Sun) is covered by a rule
function dayInRule(regle: PlanningRegleResponse, day: number): boolean {
  const { Jour_Debut, Jour_Fin } = regle
  if (Jour_Debut <= Jour_Fin) {
    return day >= Jour_Debut && day <= Jour_Fin
  }
  // Cross-week: e.g., Fri(5) -> Mon(1): days 5,6,7,1 are covered
  return day >= Jour_Debut || day <= Jour_Fin
}

function formatRuleLabelForDay(regle: PlanningRegleResponse, day: number): string {
  const isStart = day == regle.Jour_Debut
  const isEnd = day == regle.Jour_Fin

  if (isStart && isEnd) {
    return `${regle.Heure_Debut}-${regle.Heure_Fin}`
  }

  if (isStart) {
    return `${regle.Heure_Debut}->`
  }

  if (isEnd) {
    return `->${regle.Heure_Fin}`
  }

  return "En cours"
}

export function WeeklyPlanningView({ regles, onSelectRegle }: WeeklyPlanningViewProps) {
  const t = useTranslations("lieux.planning")

  return (
    <div className="grid grid-cols-7 gap-1 text-xs">
      {WEEKDAY_KEYS.map((key, i) => {
        const day = i + 1
        const reglesForDay = regles.filter((r) => dayInRule(r, day))
        return (
          <div key={key} className="flex flex-col items-center gap-0.5">
            <span className="font-medium text-muted-foreground text-center">
              {t(`weekdays.${key}`)}
            </span>
            {reglesForDay.length > 0 ? (
              reglesForDay.map((r) => (
                <button
                  key={r.Id_Regle}
                  type="button"
                  onClick={() => onSelectRegle?.(r)}
                  className="w-full rounded bg-blue-500/20 border border-blue-500/40 px-1 py-0.5 text-blue-700 dark:text-blue-300 hover:bg-blue-500/30 truncate"
                  title={`${r.Heure_Debut}-${r.Heure_Fin}`}
                >
                  {formatRuleLabelForDay(r, day)}
                </button>
              ))
            ) : (
              <div className="w-full rounded bg-muted/30 px-1 py-1 text-center text-muted-foreground">
                --
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
