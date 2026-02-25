"use client"

import { useTranslations } from "next-intl"

interface LocationFormTabPlanningProps {
  idLieu: number | null // null when creating a new lieu (not yet saved)
}

export function LocationFormTabPlanning({ idLieu }: LocationFormTabPlanningProps) {
  const t = useTranslations("lieux")

  if (!idLieu) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        {t("planning.saveFirst")}
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      {/* WeeklyPlanningView will be added in Task 13 */}
      {/* PlanningRuleList will be added in Task 13 */}
      {/* PlanningRuleFormDialog will be added in Task 14 */}
      <p className="text-sm text-muted-foreground">{t("planning.noRules")}</p>
    </div>
  )
}
