"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { IntercomparisonMedium } from "@/hooks/useIntercomparisonMedia"
import {
  CALIBRATION_STANDARD_SELF_HEATING,
  CALIBRATION_U2_RANGE,
  DEFAULT_SENSOR_RESOLUTION,
} from "@/lib/metrology-calibration-calculations"
import type { PublicCalibrationSession } from "@/lib/metrology-calibration-session"

type CalibrationCalculationDetailsProps = {
  session: PublicCalibrationSession
  medium: IntercomparisonMedium | null
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}

function mean(values: number[]) {
  return values.length ? sum(values) / values.length : Number.NaN
}

function sampleStandardDeviation(values: number[], average: number) {
  if (values.length < 2) return 0
  const variance = values.reduce((total, value) => total + (value - average) ** 2, 0) / (values.length - 1)
  return Math.sqrt(variance)
}

export function CalibrationCalculationDetails({ session, medium }: CalibrationCalculationDetailsProps) {
  const t = useTranslations("metrologyAdmin.calibrationPage.workflow.enhanced")
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const localeTag = locale === "fr" ? "fr-FR" : "en-US"

  const diagnosticFormatter = useMemo(
    () => new Intl.NumberFormat(localeTag, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 12,
      useGrouping: false,
    }),
    [localeTag],
  )
  const displayFormatter = useMemo(
    () => new Intl.NumberFormat(localeTag, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
      useGrouping: false,
    }),
    [localeTag],
  )

  const formatDiagnostic = (value: number | null | undefined) =>
    value == null || !Number.isFinite(value) ? "-" : diagnosticFormatter.format(value)
  const formatDisplay = (value: number | null | undefined) =>
    value == null || !Number.isFinite(value) ? "-" : displayFormatter.format(value)
  const formatValues = (values: number[]) => values.map((value) => formatDiagnostic(value)).join(" ; ")

  const standardValues = session.standardSamples.map((sample) => sample.value)
  const standardSum = sum(standardValues)
  const standardMeanFromSamples = mean(standardValues)
  const mediumStability = medium?.Stabilite ?? Number.NaN
  const mediumHomogeneity = medium?.Homogeneite ?? Number.NaN

  return (
    <div className="mt-4 space-y-4">
      <Button type="button" variant="outline" onClick={() => setOpen((current) => !current)}>
        {open ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
        {open ? t("calculation_details_hide") : t("calculation_details_show")}
      </Button>

      {open ? (
        <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
          <div>
            <h3 className="font-semibold">{t("calculation_details_title")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("calculation_details_description")}</p>
          </div>

          {Object.values(session.results).map((result) => {
            const sensor = session.sensors.find((item) => item.id === result.sensorId)
            const sensorValues = (session.sensorSamples[result.sensorId] ?? []).map((sample) => sample.value)
            const sensorSum = sum(sensorValues)
            const sensorMeanFromSamples = mean(sensorValues)
            const accuracyFromSamples = sensorMeanFromSamples - standardMeanFromSamples
            const displayedMeanSensor = Number(sensorMeanFromSamples.toFixed(3))
            const displayedMeanStandard = Number(standardMeanFromSamples.toFixed(3))
            const accuracyFromDisplayedMeans = displayedMeanSensor - displayedMeanStandard
            const roundingDisplayDelta = accuracyFromDisplayedMeans - accuracyFromSamples
            const standardDeviationFromSamples = sampleStandardDeviation(sensorValues, sensorMeanFromSamples)

            const sqrt3 = Math.sqrt(3)
            const u1 = session.standardResolution / (2 * sqrt3)
            const u2 = CALIBRATION_U2_RANGE / sqrt3
            const u3 = session.standardUncertainty / 2
            const u4 = DEFAULT_SENSOR_RESOLUTION / (2 * sqrt3)
            const u5 = 0
            const u6 = CALIBRATION_STANDARD_SELF_HEATING
            const u7 = standardDeviationFromSamples
            const u8 = 0
            const u9 = Number.isFinite(mediumStability) && Number.isFinite(mediumHomogeneity)
              ? Math.sqrt((mediumStability / sqrt3) ** 2 + (mediumHomogeneity / sqrt3) ** 2)
              : Number.NaN
            const u10 = 0
            const u11 = 0
            const uncertaintyFromDetails = Number.isFinite(u9)
              ? Math.sqrt(
                  u1 ** 2 +
                    u2 ** 2 +
                    u3 ** 2 +
                    u4 ** 2 +
                    u5 ** 2 +
                    u6 ** 2 +
                    u7 ** 2 +
                    u8 ** 2 +
                    u9 ** 2 +
                    u10 ** 2 +
                    u11 ** 2,
                )
              : Number.NaN

            const unit = sensor?.unit ?? session.standardUnit ?? ""

            const rows = [
              {
                step: t("calculation_standard_values"),
                formula: `x1…x${standardValues.length}`,
                raw: formatValues(standardValues),
                displayed: "-",
              },
              {
                step: t("calculation_standard_sum"),
                formula: "Σ x étalon",
                raw: formatDiagnostic(standardSum),
                displayed: "-",
              },
              {
                step: t("calculation_mean_standard"),
                formula: `${formatDiagnostic(standardSum)} / ${standardValues.length}`,
                raw: `${formatDiagnostic(standardMeanFromSamples)} (${t("calculation_server")}: ${formatDiagnostic(result.meanStandard)})`,
                displayed: formatDisplay(standardMeanFromSamples),
              },
              {
                step: t("calculation_sensor_values"),
                formula: `x1…x${sensorValues.length}`,
                raw: formatValues(sensorValues),
                displayed: "-",
              },
              {
                step: t("calculation_sensor_sum"),
                formula: "Σ x sonde",
                raw: formatDiagnostic(sensorSum),
                displayed: "-",
              },
              {
                step: t("calculation_mean_sensor"),
                formula: `${formatDiagnostic(sensorSum)} / ${sensorValues.length}`,
                raw: `${formatDiagnostic(sensorMeanFromSamples)} (${t("calculation_server")}: ${formatDiagnostic(result.meanSensor)})`,
                displayed: formatDisplay(sensorMeanFromSamples),
              },
              {
                step: t("calculation_accuracy_raw"),
                formula: "moyenne sonde brute - moyenne étalon brute",
                raw: `${formatDiagnostic(sensorMeanFromSamples)} - ${formatDiagnostic(standardMeanFromSamples)} = ${formatDiagnostic(accuracyFromSamples)} (${t("calculation_server")}: ${formatDiagnostic(result.accuracyError)})`,
                displayed: formatDisplay(result.accuracyError),
              },
              {
                step: t("calculation_accuracy_displayed"),
                formula: "moyenne sonde affichée - moyenne étalon affichée",
                raw: `${formatDisplay(displayedMeanSensor)} - ${formatDisplay(displayedMeanStandard)} = ${formatDiagnostic(accuracyFromDisplayedMeans)}`,
                displayed: formatDisplay(accuracyFromDisplayedMeans),
              },
              {
                step: t("calculation_rounding_delta"),
                formula: "justesse sur valeurs affichées - justesse brute",
                raw: formatDiagnostic(roundingDisplayDelta),
                displayed: formatDisplay(roundingDisplayDelta),
              },
              {
                step: t("calculation_standard_deviation"),
                formula: "√(Σ(xi - moyenne)² / (n - 1))",
                raw: `${formatDiagnostic(standardDeviationFromSamples)} (${t("calculation_server")}: ${formatDiagnostic(result.standardDeviation)})`,
                displayed: formatDisplay(result.standardDeviation),
              },
            ]

            const uncertaintyRows = [
              ["U1", "résolution étalon / (2√3)", u1],
              ["U2", `${CALIBRATION_U2_RANGE} / √3`, u2],
              ["U3", "incertitude étalon / 2", u3],
              ["U4", `${DEFAULT_SENSOR_RESOLUTION} / (2√3)`, u4],
              ["U5", "0", u5],
              ["U6", String(CALIBRATION_STANDARD_SELF_HEATING), u6],
              ["U7", t("calculation_standard_deviation"), u7],
              ["U8", "0", u8],
              ["U9", "√((stabilité/√3)² + (homogénéité/√3)²)", u9],
              ["U10", "0", u10],
              ["U11", "0", u11],
            ] as const

            return (
              <Card key={result.sensorId}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {result.serialNumber}{unit ? ` · ${unit}` : ""}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="overflow-x-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("calculation_step")}</TableHead>
                          <TableHead>{t("calculation_formula")}</TableHead>
                          <TableHead>{t("calculation_raw")}</TableHead>
                          <TableHead>{t("calculation_displayed")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow key={row.step}>
                            <TableCell className="font-medium">{row.step}</TableCell>
                            <TableCell className="font-mono text-xs">{row.formula}</TableCell>
                            <TableCell className="max-w-xl break-words font-mono text-xs">{row.raw}</TableCell>
                            <TableCell className="font-mono">{row.displayed}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">{t("calculation_uncertainty_components")}</h4>
                    <div className="grid gap-2 text-sm md:grid-cols-2 xl:grid-cols-3">
                      <div className="rounded-md border p-2">
                        {t("calculation_standard_resolution")}: <span className="font-mono">{formatDiagnostic(session.standardResolution)}</span>
                      </div>
                      <div className="rounded-md border p-2">
                        {t("calculation_standard_uncertainty")}: <span className="font-mono">{formatDiagnostic(session.standardUncertainty)}</span>
                      </div>
                      <div className="rounded-md border p-2">
                        {t("calculation_sensor_resolution")}: <span className="font-mono">{formatDiagnostic(DEFAULT_SENSOR_RESOLUTION)}</span>
                      </div>
                      <div className="rounded-md border p-2">
                        {t("calculation_medium_stability")}: <span className="font-mono">{formatDiagnostic(mediumStability)}</span>
                      </div>
                      <div className="rounded-md border p-2">
                        {t("calculation_medium_homogeneity")}: <span className="font-mono">{formatDiagnostic(mediumHomogeneity)}</span>
                      </div>
                    </div>
                    <div className="overflow-x-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("calculation_component")}</TableHead>
                            <TableHead>{t("calculation_formula")}</TableHead>
                            <TableHead>{t("calculation_raw")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {uncertaintyRows.map(([name, formula, value]) => (
                            <TableRow key={name}>
                              <TableCell className="font-medium">{name}</TableCell>
                              <TableCell className="font-mono text-xs">{formula}</TableCell>
                              <TableCell className="font-mono text-xs">{formatDiagnostic(value)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell className="font-semibold">{t("calculation_uncertainty_total")}</TableCell>
                            <TableCell className="font-mono text-xs">√(U1² + … + U11²)</TableCell>
                            <TableCell className="font-mono text-xs">
                              {formatDiagnostic(uncertaintyFromDetails)} ({t("calculation_server")}: {formatDiagnostic(result.uncertainty)})
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
