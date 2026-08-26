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

function average(values: number[]) {
  return values.length ? sum(values) / values.length : Number.NaN
}

export function CalibrationCalculationDetails({ session, medium }: CalibrationCalculationDetailsProps) {
  const t = useTranslations("metrologyAdmin.calibrationPage.workflow.enhanced")
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const localeTag = locale === "fr" ? "fr-FR" : "en-US"

  const formatter = useMemo(
    () => new Intl.NumberFormat(localeTag, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 12,
      useGrouping: false,
    }),
    [localeTag],
  )

  const formatRaw = (value: number | null | undefined) =>
    value == null || !Number.isFinite(value) ? "-" : formatter.format(value)

  const standardValues = session.standardSamples.map((sample) => sample.value)
  const standardSum = sum(standardValues)
  const standardMean = average(standardValues)

  return (
    <div className="mt-4 space-y-4">
      <Button type="button" variant="outline" onClick={() => setOpen((current) => !current)}>
        {open ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
        {open ? t("hide_calculation_details") : t("show_calculation_details")}
      </Button>

      {open ? (
        <div className="space-y-4">
          {Object.values(session.results).map((result) => {
            const sensor = session.sensors.find((item) => item.id === result.sensorId)
            const sensorSamples = session.sensorSamples[result.sensorId] ?? []
            const sensorValues = sensorSamples.map((sample) => sample.value)
            const sensorSum = sum(sensorValues)
            const sensorMean = average(sensorValues)
            const rawAccuracy = sensorMean - standardMean
            const roundedMeanSensor = Number(sensorMean.toFixed(3))
            const roundedMeanStandard = Number(standardMean.toFixed(3))
            const displayedAccuracy = roundedMeanSensor - roundedMeanStandard
            const displayRoundingDelta = displayedAccuracy - rawAccuracy

            const squaredDeviationSum = sensorValues.reduce(
              (total, value) => total + (value - sensorMean) ** 2,
              0,
            )
            const variance = sensorValues.length > 1
              ? squaredDeviationSum / (sensorValues.length - 1)
              : 0
            const standardDeviation = Math.sqrt(variance)

            const sqrt3 = Math.sqrt(3)
            const mediumStability = medium?.Stabilite ?? Number.NaN
            const mediumHomogeneity = medium?.Homogeneite ?? Number.NaN
            const u1 = session.standardResolution / (2 * sqrt3)
            const u2 = CALIBRATION_U2_RANGE / sqrt3
            const u3 = session.standardUncertainty / 2
            const u4 = DEFAULT_SENSOR_RESOLUTION / (2 * sqrt3)
            const u5 = 0
            const u6 = CALIBRATION_STANDARD_SELF_HEATING
            const u7 = standardDeviation
            const u8 = 0
            const u9 = Number.isFinite(mediumStability) && Number.isFinite(mediumHomogeneity)
              ? Math.sqrt((mediumStability / sqrt3) ** 2 + (mediumHomogeneity / sqrt3) ** 2)
              : Number.NaN
            const u10 = 0
            const u11 = 0
            const uncertaintySquaredSum = [u1, u2, u3, u4, u5, u6, u7, u8, u9, u10, u11]
              .reduce((total, value) => total + value ** 2, 0)
            const recomputedUncertainty = Math.sqrt(uncertaintySquaredSum)
            const unit = sensor?.unit ?? session.standardUnit ?? ""

            return (
              <Card key={result.sensorId} className="border-sky-200 dark:border-sky-500/30">
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("calculation_details_title", { serial: result.serialNumber })}
                    {unit ? ` · ${unit}` : ""}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{t("calculation_details_description")}</p>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="overflow-x-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>{t("raw_standard")}</TableHead>
                          <TableHead>{t("raw_sensor")}</TableHead>
                          <TableHead>{t("raw_difference")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {session.standardSamples.map((standardSample, index) => {
                          const sensorSample = sensorSamples[index]
                          const sensorValue = sensorSample?.value
                          return (
                            <TableRow key={standardSample.order}>
                              <TableCell>{standardSample.order}</TableCell>
                              <TableCell className="font-mono text-xs">{formatRaw(standardSample.value)}</TableCell>
                              <TableCell className="font-mono text-xs">{formatRaw(sensorValue)}</TableCell>
                              <TableCell className="font-mono text-xs">
                                {sensorValue == null ? "-" : formatRaw(sensorValue - standardSample.value)}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">{t("standard_sum")}</div>
                      <div className="font-mono text-sm">{formatRaw(standardSum)}</div>
                    </div>
                    <div className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">{t("sensor_sum")}</div>
                      <div className="font-mono text-sm">{formatRaw(sensorSum)}</div>
                    </div>
                    <div className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">{t("mean_standard")}</div>
                      <div className="font-mono text-sm">Σ / {standardValues.length} = {formatRaw(standardMean)}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {t("server_value")}: <span className="font-mono">{formatRaw(result.meanStandard)}</span>
                      </div>
                    </div>
                    <div className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">{t("mean_sensor")}</div>
                      <div className="font-mono text-sm">Σ / {sensorValues.length} = {formatRaw(sensorMean)}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {t("server_value")}: <span className="font-mono">{formatRaw(result.meanSensor)}</span>
                      </div>
                    </div>
                    <div className="rounded-md border p-3 md:col-span-2">
                      <div className="text-xs text-muted-foreground">{t("accuracy_error")}</div>
                      <div className="font-mono text-sm">
                        {formatRaw(sensorMean)} - {formatRaw(standardMean)} = {formatRaw(rawAccuracy)}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {t("server_value")}: <span className="font-mono">{formatRaw(result.accuracyError)}</span>
                      </div>
                      <div className="mt-2 border-t pt-2 font-mono text-xs">
                        round3(meanSensor) - round3(meanStandard) = {formatRaw(displayedAccuracy)}
                        <br />
                        Δ(display - raw) = {formatRaw(displayRoundingDelta)}
                      </div>
                    </div>
                    <div className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">{t("squared_deviation_sum")}</div>
                      <div className="font-mono text-sm">{formatRaw(squaredDeviationSum)}</div>
                    </div>
                    <div className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">{t("variance")}</div>
                      <div className="font-mono text-sm">
                        {formatRaw(squaredDeviationSum)} / {Math.max(1, sensorValues.length - 1)} = {formatRaw(variance)}
                      </div>
                    </div>
                    <div className="rounded-md border p-3 md:col-span-2">
                      <div className="text-xs text-muted-foreground">{t("standard_deviation")}</div>
                      <div className="font-mono text-sm">√{formatRaw(variance)} = {formatRaw(standardDeviation)}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {t("server_value")}: <span className="font-mono">{formatRaw(result.standardDeviation)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">{t("uncertainty_components")}</h4>
                    <div className="overflow-x-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("component")}</TableHead>
                            <TableHead>Formula</TableHead>
                            <TableHead>{t("raw_value")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            ["U1", "standardResolution / (2√3)", u1],
                            ["U2", `${CALIBRATION_U2_RANGE} / √3`, u2],
                            ["U3", "standardUncertainty / 2", u3],
                            ["U4", `${DEFAULT_SENSOR_RESOLUTION} / (2√3)`, u4],
                            ["U5", "0", u5],
                            ["U6", String(CALIBRATION_STANDARD_SELF_HEATING), u6],
                            ["U7", "standardDeviation", u7],
                            ["U8", "0", u8],
                            ["U9", "√((mediumStability/√3)² + (mediumHomogeneity/√3)²)", u9],
                            ["U10", "0", u10],
                            ["U11", "0", u11],
                          ].map(([name, formula, value]) => (
                            <TableRow key={String(name)}>
                              <TableCell className="font-medium">{name}</TableCell>
                              <TableCell className="font-mono text-xs">{formula}</TableCell>
                              <TableCell className="font-mono text-xs">{formatRaw(Number(value))}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell className="font-medium">{t("uncertainty_squared_sum")}</TableCell>
                            <TableCell className="font-mono text-xs">Σ Ui²</TableCell>
                            <TableCell className="font-mono text-xs">{formatRaw(uncertaintySquaredSum)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">{t("uncertainty")}</TableCell>
                            <TableCell className="font-mono text-xs">√(Σ Ui²)</TableCell>
                            <TableCell className="font-mono text-xs">
                              {formatRaw(recomputedUncertainty)} · {t("server_value")}: {formatRaw(result.uncertainty)}
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
