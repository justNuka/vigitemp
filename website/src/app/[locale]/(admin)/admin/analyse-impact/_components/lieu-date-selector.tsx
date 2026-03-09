"use client"

import { useMemo } from "react"
import { useTranslations, useLocale } from "next-intl"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox } from "@/components/ui/combobox"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { useLocations } from "@/hooks/useLocations"
import type { SelectedLieu } from "../impact-analysis-client"

interface LieuDateSelectorProps {
  selectedLieu: SelectedLieu | null
  dateRange: { from: Date; to: Date } | null
  onLieuChange: (lieu: SelectedLieu | null) => void
  onDateRangeChange: (range: { from: Date; to: Date } | null) => void
  onAnalyze: () => void
}

export function LieuDateSelector({
  selectedLieu,
  dateRange,
  onLieuChange,
  onDateRangeChange,
  onAnalyze,
}: LieuDateSelectorProps) {
  const t = useTranslations("impactAnalysis")
  const locale = useLocale()
  const { data: locations, isLoading: locationsLoading } = useLocations()

  const locationOptions = useMemo(
    () =>
      (locations ?? []).map((location) => ({
        value: location.Id_Lieu.toString(),
        label: [
          location.Nom_Lieu ?? `#${location.Id_Lieu}`,
          location.t_site?.Libelle_Site ? `(${location.t_site.Libelle_Site})` : null,
        ]
          .filter(Boolean)
          .join(" "),
        searchText: `${location.Nom_Lieu ?? ""} ${location.t_site?.Libelle_Site ?? ""} ${location.Id_Lieu}`,
      })),
    [locations],
  )

  const handleLieuChange = (value: string) => {
    if (!value) {
      onLieuChange(null)
      return
    }
    const id = parseInt(value, 10)
    const found = (locations ?? []).find((l) => l.Id_Lieu === id)
    if (!found) {
      onLieuChange(null)
      return
    }
    const lieu: SelectedLieu = {
      id: found.Id_Lieu,
      nom: found.Nom_Lieu ?? `#${found.Id_Lieu}`,
      consigne: found.Consigne,
      consigneSup: found.Consigne_Sup,
      consigneInf: found.Consigne_Inf,
      toleranceSup: found.Tolerance_Surveillance_Sup,
      toleranceInf: found.Tolerance_Surveillance_Inf,
      emtModeDb: (() => {
        const modeStr = found.EMT_Mode
        if (!modeStr) return null
        const map: Record<string, number> = {
          quart: 1,
          manuel: 2,
          uncertainties: 3,
          "sans-objet": 4,
        }
        return map[modeStr] ?? null
      })(),
      unit: found.Unite ?? "°C",
    }
    onLieuChange(lieu)
  }

  const isAnalyzeDisabled = !selectedLieu || !dateRange

  return (
    <Card className="mx-6 mt-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          {t("selector.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="lieu-combobox">{t("selector.lieuLabel")}</Label>
          <Combobox
            triggerId="lieu-combobox"
            value={selectedLieu ? selectedLieu.id.toString() : ""}
            onValueChange={handleLieuChange}
            options={locationOptions}
            placeholder={t("selector.lieuPlaceholder")}
            searchPlaceholder={t("selector.lieuSearch")}
            emptyMessage={t("selector.lieuEmpty")}
            disabled={locationsLoading}
          />
        </div>

        <div className="space-y-2">
          <Label>{t("selector.dateRangeLabel")}</Label>
          <DateRangePicker
            onUpdate={(values) => {
              const { range } = values
              if (range.from) {
                const to = range.to ?? range.from
                onDateRangeChange({ from: range.from, to })
              } else {
                onDateRangeChange(null)
              }
            }}
            showCompare={false}
            locale={locale}
            allowEmpty
            align="start"
            matchTriggerWidth={false}
            popoverClassName="w-[min(980px,calc(100vw-2rem))]"
          />
        </div>

        <div className="flex items-end">
          <Button
            onClick={onAnalyze}
            disabled={isAnalyzeDisabled}
            className="w-full sm:w-auto"
          >
            {t("selector.analyzeButton")}
          </Button>
        </div>
        </div>
      </CardContent>
    </Card>
  )
}
