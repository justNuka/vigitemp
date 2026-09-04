"use client"

import { useTranslations, useLocale } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { emtModeFromDb } from "@/lib/emt"
import { formatNumber } from "@/lib/number-display"
import type { SelectedLieu } from "../impact-analysis-client"

const EMT_MODE_TO_KEY: Record<string, "quart" | "manuel" | "uncertainties" | "sansObjet"> = {
  quart: "quart",
  manuel: "manuel",
  uncertainties: "uncertainties",
  "sans-objet": "sansObjet",
}

interface ImpactSummaryCardProps {
  lieu: SelectedLieu
  measureCount: number
  newSup: string
  newInf: string
  onNewSupChange: (value: string) => void
  onNewInfChange: (value: string) => void
  onReset: () => void
}

export function ImpactSummaryCard({
  lieu,
  measureCount,
  newSup,
  newInf,
  onNewSupChange,
  onNewInfChange,
  onReset,
}: ImpactSummaryCardProps) {
  const t = useTranslations("impactAnalysis")
  const locale = useLocale()

  const displayToleranceSup = lieu.toleranceSup ?? lieu.consigneSup
  const displayToleranceInf = lieu.toleranceInf ?? lieu.consigneInf
  const emtMode = emtModeFromDb(lieu.emtModeDb)
  const emtKey = EMT_MODE_TO_KEY[emtMode] ?? "sansObjet"
  const emtLabel = t(`summary.emtModes.${emtKey}`)

  const newSupNum = newSup !== "" ? parseFloat(newSup) : null
  const newInfNum = newInf !== "" ? parseFloat(newInf) : null
  const hasValidationError =
    newSupNum !== null && newInfNum !== null && newInfNum >= newSupNum

  const formatThreshold = (value: number | null): string => {
    if (value === null) return t("summary.notDefined")
    return `${value} ${lieu.unit}`
  }

  return (
    <div className="grid grid-cols-1 gap-4 mx-6 mt-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("summary.recapTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("summary.consigne")}</dt>
              <dd className="font-medium">{formatThreshold(lieu.consigne)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("summary.toleranceSup")}</dt>
              <dd className="font-medium flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500 shrink-0" />
                {formatThreshold(displayToleranceSup)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("summary.toleranceInf")}</dt>
              <dd className="font-medium flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                {formatThreshold(displayToleranceInf)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("summary.emtMode")}</dt>
              <dd className="font-medium">{emtLabel}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("summary.measureCount")}</dt>
              <dd className="font-medium">{formatNumber(measureCount, { locale, decimals: 0 })}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("summary.newTolerancesTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-tolerance-sup" className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                {t("summary.newToleranceSup")}
              </Label>
              <Input
                id="new-tolerance-sup"
                type="number"
                step="0.1"
                value={newSup}
                onChange={(e) => onNewSupChange(e.target.value)}
                placeholder={displayToleranceSup !== null ? String(displayToleranceSup) : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-tolerance-inf" className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                {t("summary.newToleranceInf")}
              </Label>
              <Input
                id="new-tolerance-inf"
                type="number"
                step="0.1"
                value={newInf}
                onChange={(e) => onNewInfChange(e.target.value)}
                placeholder={displayToleranceInf !== null ? String(displayToleranceInf) : ""}
              />
            </div>

            {hasValidationError && (
              <p className="text-sm text-destructive">
                {t("summary.validationError")}
              </p>
            )}

            <Button variant="outline" onClick={onReset} className="w-full">
              {t("summary.resetButton")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
