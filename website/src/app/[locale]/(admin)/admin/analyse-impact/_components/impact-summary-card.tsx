"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { emtModeFromDb } from "@/lib/emt"
import type { SelectedLieu } from "../impact-analysis-client"

const EMT_LABELS_FR: Record<string, string> = {
  quart: "Methode du quart (EMT/4)",
  manuel: "Manuel",
  uncertainties: "Calcul par incertitudes",
  "sans-objet": "Sans objet",
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

  const displayToleranceSup = lieu.toleranceSup ?? lieu.consigneSup
  const displayToleranceInf = lieu.toleranceInf ?? lieu.consigneInf
  const emtMode = emtModeFromDb(lieu.emtModeDb)
  const emtLabel = EMT_LABELS_FR[emtMode] ?? "Sans objet"

  const newSupNum = newSup !== "" ? parseFloat(newSup) : null
  const newInfNum = newInf !== "" ? parseFloat(newInf) : null
  const hasValidationError =
    newSupNum !== null && newInfNum !== null && newInfNum >= newSupNum

  const formatThreshold = (value: number | null): string => {
    if (value === null) return t("summary.notDefined")
    return `${value} ${lieu.unit}`
  }

  return (
    <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-2">
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
              <dd className="font-medium">{formatThreshold(displayToleranceSup)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("summary.toleranceInf")}</dt>
              <dd className="font-medium">{formatThreshold(displayToleranceInf)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("summary.emtMode")}</dt>
              <dd className="font-medium">{emtLabel}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("summary.measureCount")}</dt>
              <dd className="font-medium">{measureCount.toLocaleString("fr-FR")}</dd>
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
              <Label htmlFor="new-tolerance-sup">{t("summary.newToleranceSup")}</Label>
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
              <Label htmlFor="new-tolerance-inf">{t("summary.newToleranceInf")}</Label>
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
